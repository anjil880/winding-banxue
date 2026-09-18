import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

/**
 * 批量添加学生到班级。
 */
export class AddStudentsDto {
  @IsArray()
  @ArrayNotEmpty({ message: '学生列表不能为空' })
  @IsInt({ each: true, message: 'studentIds 必须是整数数组' })
  studentIds: number[];
}
