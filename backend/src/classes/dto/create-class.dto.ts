import { IsInt, IsOptional, IsString, Length } from 'class-validator';

/**
 * 创建班级请求体。teacherId 为老师用户 id（可选，创建后再指派）。
 */
export class CreateClassDto {
  @IsString()
  @Length(1, 64, { message: '班级名称长度 1-64' })
  name: string;

  @IsString()
  @Length(1, 32, { message: '年级长度 1-32' })
  grade: string;

  @IsOptional()
  @IsInt()
  teacherId?: number;
}
