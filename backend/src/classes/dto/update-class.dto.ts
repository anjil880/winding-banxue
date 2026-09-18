import { IsInt, IsOptional, IsString, Length } from 'class-validator';

/**
 * 更新班级请求体（全部可选）。
 */
export class UpdateClassDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  grade?: string;

  @IsOptional()
  @IsInt()
  teacherId?: number;
}
