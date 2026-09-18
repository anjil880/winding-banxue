import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserStatus } from '../../entities/user.entity';

/**
 * 更新用户请求体（全部可选，仅更新传入字段）。
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 64, { message: '姓名长度 1-64' })
  name?: string;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'status 必须为 active/inactive' })
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;
}
