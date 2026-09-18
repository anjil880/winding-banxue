import * as crypto from 'crypto';

/** 生成 64 位十六进制随机刷新令牌（256 bit 熵） */
export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** 对刷新令牌做 SHA-256 哈希，数据库中仅保存哈希值 */
export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/** 判断日期/时间戳是否已过期（<= now 视为过期） */
export function isExpired(
  expiresAt: Date | string | number,
  now: number = Date.now(),
): boolean {
  return new Date(expiresAt).getTime() <= now;
}
