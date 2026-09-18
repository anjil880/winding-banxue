import { IsString, Length } from 'class-validator';

/**
 * 重置密码请求体。
 */
export class ResetPasswordDto {
  @IsString()
  @Length(6, 64, { message: '密码长度 6-64' })
  password: string;
}
