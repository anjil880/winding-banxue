import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { UserRole } from '../../entities/user.entity';

/**
 * 创建用户请求体。role 决定是否同步扩展表（student/teacher）。
 * - student：studentNo 必填
 * - teacher：teacherNo 必填
 * - admin：无需扩展字段
 */
export class CreateUserDto {
  @IsEnum(UserRole, { message: 'role 必须为 student/teacher/admin' })
  role: UserRole;

  @IsString()
  @Length(3, 20, { message: '用户名长度 3-20' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名仅限字母数字下划线' })
  username: string;

  @IsString()
  @Length(6, 64, { message: '密码长度 6-64' })
  password: string;

  @IsString()
  @Length(1, 64, { message: '姓名长度 1-64' })
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  studentNo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  teacherNo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;
}
