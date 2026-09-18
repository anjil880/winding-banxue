import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { AuditService } from '../common/services/audit.service';
import { UserRole, UserStatus } from '../entities/user.entity';

/**
 * 用户管理接口（仅管理员）。
 * 路径经全局前缀后为 /api/v1/users/*。
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Query() query: QueryUsersDto) {
    return this.usersService.list(query);
  }

  @Post()
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    const user = await this.usersService.create(dto);
    await this.audit.record({
      userId: operator.sub,
      action: 'user.create',
      resource: 'user',
      resourceId: String(user.id),
      details: { role: dto.role, username: dto.username },
    });
    return user;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    const user = await this.usersService.update(id, dto);
    await this.audit.record({
      userId: operator.sub,
      action: 'user.update',
      resource: 'user',
      resourceId: String(id),
      details: { ...dto },
    });
    return user;
  }

  @Post(':id/reset-password')
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    await this.usersService.resetPassword(id, dto.password);
    await this.audit.record({
      userId: operator.sub,
      action: 'user.reset_password',
      resource: 'user',
      resourceId: String(id),
    });
    return { message: 'ok' };
  }

  @Post(':id/status')
  async setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: UserStatus },
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    const user = await this.usersService.setStatus(id, body.status);
    await this.audit.record({
      userId: operator.sub,
      action: 'user.set_status',
      resource: 'user',
      resourceId: String(id),
      details: { status: body.status },
    });
    return user;
  }

  @Post('bulk-import')
  async bulkImport(
    @Body() body: { rows: Array<Partial<CreateUserDto>> },
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    const result = await this.usersService.bulkImport(body.rows ?? []);
    await this.audit.record({
      userId: operator.sub,
      action: 'user.bulk_import',
      resource: 'user',
      details: { total: body.rows?.length ?? 0, ...result },
    });
    return result;
  }
}
