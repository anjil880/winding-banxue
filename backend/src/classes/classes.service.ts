import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from '../entities/class.entity';
import { ClassStudent } from '../entities/class-student.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

/**
 * 班级学生列表项。
 */
export interface ClassStudentItem {
  studentId: number;
  name: string;
  studentNo: string;
  joinedAt: Date;
}

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(ClassStudent)
    private readonly classStudentRepo: Repository<ClassStudent>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async list(): Promise<ClassEntity[]> {
    return this.classRepo.find({ order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<ClassEntity> {
    const cls = await this.classRepo.findOneBy({ id });
    if (!cls) {
      throw new NotFoundException('班级不存在');
    }
    return cls;
  }

  async create(dto: CreateClassDto): Promise<ClassEntity> {
    return this.classRepo.save(
      this.classRepo.create({
        name: dto.name,
        grade: dto.grade,
        teacherId: dto.teacherId ?? null,
      }),
    );
  }

  async update(id: number, dto: UpdateClassDto): Promise<ClassEntity> {
    const cls = await this.findById(id);
    if (dto.name !== undefined) cls.name = dto.name;
    if (dto.grade !== undefined) cls.grade = dto.grade;
    if (dto.teacherId !== undefined) cls.teacherId = dto.teacherId || null;
    return this.classRepo.save(cls);
  }

  async remove(id: number): Promise<void> {
    const cls = await this.findById(id);
    // 先清空班级学生关系，再删除班级
    await this.classStudentRepo.delete({ classId: id });
    // 解除学生扩展表中的 classId 指向
    await this.studentRepo.update({ classId: id }, { classId: null });
    await this.classRepo.remove(cls);
  }

  /**
   * 班级学生列表（联查学生姓名/学号）。
   */
  async listStudents(classId: number): Promise<ClassStudentItem[]> {
    await this.findById(classId);

    const rows = await this.classStudentRepo
      .createQueryBuilder('cs')
      .innerJoin(Student, 's', 's.user_id = cs.student_id')
      .innerJoin(User, 'u', 'u.id = s.user_id')
      .where('cs.class_id = :classId', { classId })
      .select([
        'cs.student_id',
        'cs.joined_at',
        's.student_no',
        'u.name',
      ])
      .orderBy('u.name', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      studentId: r.student_id,
      name: r.u_name ?? r.name,
      studentNo: r.s_student_no ?? r.student_no,
      joinedAt: r.cs_joined_at ?? r.joined_at,
    }));
  }

  /**
   * 批量添加学生到班级。校验每个 id 是否为有效学生。
   */
  async addStudents(
    classId: number,
    studentIds: number[],
  ): Promise<{ added: number }> {
    await this.findById(classId);

    const uniqueIds = [...new Set(studentIds)];
    let added = 0;

    for (const userId of uniqueIds) {
      const student = await this.studentRepo.findOneBy({ userId });
      if (!student) {
        throw new BadRequestException(`用户 ${userId} 不是学生`);
      }
      const exists = await this.classStudentRepo.findOneBy({
        classId,
        studentId: userId,
      });
      if (!exists) {
        await this.classStudentRepo.save(
          this.classStudentRepo.create({ classId, studentId: userId }),
        );
        added += 1;
      }
      // 同步 student.classId
      if (student.classId !== classId) {
        student.classId = classId;
        await this.studentRepo.save(student);
      }
    }

    return { added };
  }

  /**
   * 从班级移除单个学生。
   */
  async removeStudent(classId: number, studentId: number): Promise<void> {
    await this.findById(classId);
    await this.classStudentRepo.delete({ classId, studentId });
    const student = await this.studentRepo.findOneBy({ userId: studentId });
    if (student && student.classId === classId) {
      student.classId = null;
      await this.studentRepo.save(student);
    }
  }
}
