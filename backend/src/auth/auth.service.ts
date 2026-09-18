import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';

import { User, UserStatus } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UsersService } from '../users/users.service';
import { AuditService } from '../common/services/audit.service';
import { LoginDto } from './dto/login.dto';
import { generateRefreshToken, sha256, isExpired } from './token.util';

export interface SafeUser {
  id: number;
  username: string;
  role: string;
  real_name: string;
}

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
  ) {}

  async login(dto: LoginDto, req: Request, res: Response) {
    const ip = this.clientIp(req);
    const userAgent = this.userAgent(req);
    const user = await this.usersService.findByUsername(dto.username);

    if (!user) {
      await this.auditService.record({
        action: 'login_failed',
        resource: 'auth',
        ipAddress: ip,
        userAgent,
        details: { username: dto.username, reason: 'user_not_found' },
      });
      throw new UnauthorizedException('用户名或密码错误');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      await this.auditService.record({
        userId: user.id,
        action: 'login_failed',
        resource: 'auth',
        ipAddress: ip,
        userAgent,
        details: { username: dto.username, reason: 'wrong_password' },
      });
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this.auditService.record({
        userId: user.id,
        action: 'login_failed',
        resource: 'auth',
        ipAddress: ip,
        userAgent,
        details: { username: dto.username, reason: 'inactive_account' },
      });
      throw new UnauthorizedException('账号已被禁用');
    }

    const accessToken = await this.signAccessToken(user);
    const refreshToken = generateRefreshToken();
    await this.persistRefreshToken(user.id, refreshToken);
    this.setRefreshCookie(res, refreshToken);

    await this.auditService.record({
      userId: user.id,
      action: 'login_success',
      resource: 'auth',
      ipAddress: ip,
      userAgent,
      details: { username: user.username },
    });

    return { access_token: accessToken, user: this.toSafeUser(user) };
  }

  async refresh(req: Request, res: Response) {
    const token = this.readRefreshToken(req);
    if (!token) {
      throw new UnauthorizedException('缺少刷新令牌');
    }

    const tokenHash = sha256(token);
    const record = await this.refreshRepo.findOneBy({ tokenHash });
    if (!record) {
      this.clearRefreshCookie(res);
      throw new UnauthorizedException('刷新令牌无效');
    }

    if (isExpired(record.expiresAt)) {
      await this.refreshRepo.delete({ id: record.id });
      this.clearRefreshCookie(res);
      throw new UnauthorizedException('刷新令牌已过期');
    }

    const user = await this.usersService.findById(record.userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      await this.refreshRepo.delete({ id: record.id });
      this.clearRefreshCookie(res);
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    // 轮换：吊销旧记录，签发新 access_token 与新 refresh_token
    await this.refreshRepo.delete({ id: record.id });
    const accessToken = await this.signAccessToken(user);
    const newRefreshToken = generateRefreshToken();
    await this.persistRefreshToken(user.id, newRefreshToken);
    this.setRefreshCookie(res, newRefreshToken);

    return { access_token: accessToken, user: this.toSafeUser(user) };
  }

  async logout(userId: number, req: Request, res: Response) {
    const token = this.readRefreshToken(req);
    if (token) {
      await this.refreshRepo.delete({ tokenHash: sha256(token) });
    }
    this.clearRefreshCookie(res);

    await this.auditService.record({
      userId,
      action: 'logout',
      resource: 'auth',
      ipAddress: this.clientIp(req),
      userAgent: this.userAgent(req),
      details: {},
    });

    return { message: 'ok' };
  }

  async me(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return this.toSafeUser(user);
  }

  private signAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
  }

  private async persistRefreshToken(
    userId: number,
    token: string,
  ): Promise<void> {
    await this.refreshRepo.save(
      this.refreshRepo.create({
        userId,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + this.refreshTokenDays() * DAY_MS),
      }),
    );
  }

  private refreshTokenDays(): number {
    const raw = this.config.get<string>('REFRESH_TOKEN_DAYS');
    const days = parseInt(raw || '7', 10);
    return Number.isFinite(days) && days > 0 ? days : 7;
  }

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get<string>('NODE_ENV') === 'production',
      maxAge: this.refreshTokenDays() * DAY_MS,
      path: REFRESH_COOKIE_PATH,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
  }

  private readRefreshToken(req: Request): string | undefined {
    const cookies = (req as any).cookies;
    if (!cookies) {
      return undefined;
    }
    const value = cookies[REFRESH_COOKIE_NAME];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  private clientIp(req: Request): string {
    return (req as any).ip || (req as any).socket?.remoteAddress || '';
  }

  private userAgent(req: Request): string {
    return (req.headers?.['user-agent'] as string) || '';
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      real_name: user.name,
    };
  }
}
