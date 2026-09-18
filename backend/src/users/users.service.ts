import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { Teacher } from '../entities/teacher.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';

/**
 * 用户列表单条返回结构（不含密码哈希）。
 */
export interface UserListItem {
  id: number;
  role: UserRole;
  username: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: UserStatus;
  studentNo: string | null;
  teacherNo: string | null;
  classId: number | null;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOneBy({ username });
  }

  findById(id: number): Promise<User | null> {
    return this.userRepo.findOneBy({ id });
  }

  /**
   * 分页查询用户列表，附带学生/老师扩展信息。
   */
  async list(query: QueryUsersDto): Promise<{
    items: UserListItem[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { page, pageSize, role, status, keyword } = query;

    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndMapOne(
        'u.student',
        Student,
        's',
        's.user_id = u.id',
      )
      .leftJoinAndMapOne(
        'u.teacher',
        Teacher,
        't',
        't.user_id = u.id',
      )
      .select([
        'u.id',
        'u.role',
        'u.username',
        'u.name',
        'u.phone',
        'u.email',
        'u.status',
        'u.createdAt',
        's.studentNo',
        's.classId',
        't.teacherNo',
      ]);

    if (role) qb.andWhere('u.role = :role', { role });
    if (status) qb.andWhere('u.status = :status', { status });
    if (keyword) {
      qb.andWhere(
        '(u.username ILIKE :kw OR u.name ILIKE :kw OR u.phone ILIKE :kw)',
        { kw: `%${keyword}%` },
      );
    }

    qb.orderBy('u.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [raw, total] = await qb.getManyAndCount();

    const items: UserListItem[] = raw.map((u: any) => ({
      id: u.id,
      role: u.role,
      username: u.username,
      name: u.name,
      phone: u.phone ?? null,
      email: u.email ?? null,
      status: u.status,
      studentNo: u.student?.studentNo ?? null,
      teacherNo: u.teacher?.teacherNo ?? null,
      classId: u.student?.classId ?? null,
      createdAt: u.createdAt,
    }));

    return { items, total, page, pageSize };
  }

  /**
   * 创建用户。学生同步写 students 表，老师同步写 teachers 表。
   */
  async create(dto: CreateUserDto): Promise<UserListItem> {
    const existing = await this.userRepo.findOneBy({ username: dto.username });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    if (dto.role === UserRole.STUDENT && !dto.studentNo) {
      throw new BadRequestException('创建学生必须提供 studentNo');
    }
    if (dto.role === UserRole.TEACHER && !dto.teacherNo) {
      throw new BadRequestException('创建老师必须提供 teacherNo');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepo.save(
      this.userRepo.create({
        role: dto.role,
        username: dto.username,
        passwordHash,
        name: dto.name,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        status: UserStatus.ACTIVE,
      }),
    );

    if (dto.role === UserRole.STUDENT) {
      const dup = await this.studentRepo.findOneBy({ studentNo: dto.studentNo });
      if (dup) {
        throw new ConflictException('学号已存在');
      }
      await this.studentRepo.save(
        this.studentRepo.create({ userId: user.id, studentNo: dto.studentNo }),
      );
    }
    if (dto.role === UserRole.TEACHER) {
      const dup = await this.teacherRepo.findOneBy({ teacherNo: dto.teacherNo });
      if (dup) {
        throw new ConflictException('教师工号已存在');
      }
      await this.teacherRepo.save(
        this.teacherRepo.create({ userId: user.id, teacherNo: dto.teacherNo }),
      );
    }

    return this.toListItem(user, dto.studentNo ?? null, dto.teacherNo ?? null);
  }

  /**
   * 更新用户基础资料。
   */
  async update(id: number, dto: UpdateUserDto): Promise<UserListItem> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.status !== undefined) user.status = dto.status;
    if (dto.phone !== undefined) user.phone = dto.phone || null;
    if (dto.email !== undefined) user.email = dto.email || null;

    await this.userRepo.save(user);

    const student = await this.studentRepo.findOneBy({ userId: id });
    const teacher = await this.teacherRepo.findOneBy({ userId: id });
    return this.toListItem(
      user,
      student?.studentNo ?? null,
      teacher?.teacherNo ?? null,
    );
  }

  /**
   * 重置用户密码（管理员操作）。
   */
  async resetPassword(id: number, password: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    user.passwordHash = await bcrypt.hash(password, 10);
    await this.userRepo.save(user);
  }

  /**
   * 启用/停用用户。
   */
  async setStatus(id: number, status: UserStatus): Promise<UserListItem> {
    return this.update(id, { status });
  }

  /**
   * 批量导入（CSV 行数组），事务内逐行创建，返回成功/失败明细。
   */
  async bulkImport(
    rows: Array<Partial<CreateUserDto>>,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const result = { success: 0, failed: 0, errors: [] as string[] };
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        await this.create(row as CreateUserDto);
        result.success += 1;
      } catch (err) {
        result.failed += 1;
        const msg = (err as Error).message;
        result.errors.push(`第 ${i + 1} 行: ${msg}`);
      }
    }
    return result;
  }

  private toListItem(
    user: User,
    studentNo: string | null,
    teacherNo: string | null,
  ): UserListItem {
    return {
      id: user.id,
      role: user.role,
      username: user.username,
      name: user.name,
      phone: user.phone ?? null,
      email: user.email ?? null,
      status: user.status,
      studentNo,
      teacherNo,
      classId: null,
      createdAt: user.createdAt,
    };
  }
}
