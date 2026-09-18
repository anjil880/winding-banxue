import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { UserRole, UserStatus } from '../../entities/user.entity';

/**
 * 用户列表查询参数。
 */
export class QueryUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 20;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role 必须为 student/teacher/admin' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'status 必须为 active/inactive' })
  status?: UserStatus;

  @IsOptional()
  @IsString()
  keyword?: string;
}
