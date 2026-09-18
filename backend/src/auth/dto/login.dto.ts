import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(3, 50, { message: '用户名长度需在 3-50 个字符之间' })
  username: string;

  @IsString()
  @Length(6, 64, { message: '密码长度需在 6-64 个字符之间' })
  password: string;
}
