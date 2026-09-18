import { AppDataSource } from './data-source';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Teacher } from '../entities/teacher.entity';
import { Student } from '../entities/student.entity';
import { ClassEntity } from '../entities/class.entity';
import { KnowledgePoint } from '../entities/knowledge-point.entity';

/**
 * 演示种子数据：管理员 + 老师 + 班级 + 学生 + 知识点
 * 运行方式：NODE_ENV=development ts-node src/database/seed.ts
 * 说明：密码统一 123456（生产环境严禁，仅用于本地演示）
 */
async function run() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const teacherRepo = AppDataSource.getRepository(Teacher);
  const studentRepo = AppDataSource.getRepository(Student);
  const classRepo = AppDataSource.getRepository(ClassEntity);
  const kpRepo = AppDataSource.getRepository(KnowledgePoint);

  // 管理员
  const admin = await userRepo.findOneBy({ username: 'admin' });
  if (!admin) {
    await userRepo.save(
      userRepo.create({
        role: UserRole.ADMIN,
        username: 'admin',
        // 123456 的 bcrypt 占位；实际请在认证模块用 bcryptjs 生成后替换
        passwordHash: '$2a$10$PLACEHOLDER_REPLACE_ME',
        name: '李校长',
        status: UserStatus.ACTIVE,
      }),
    );
  }

  // 老师
  const teacherUser = await userRepo.findOneBy({ username: 'T1001' });
  if (!teacherUser) {
    await userRepo.save(
      userRepo.create({
        role: UserRole.TEACHER,
        username: 'T1001',
        passwordHash: '$2a$10$PLACEHOLDER_REPLACE_ME',
        name: '王老师',
        status: UserStatus.ACTIVE,
      }),
    );
    await teacherRepo.save(teacherRepo.create({ userId: (await userRepo.findOneBy({ username: 'T1001' })).id, teacherNo: 'T1001' }));
  }

  // 班级
  let cls = await classRepo.findOneBy({ name: '六(3)班' });
  if (!cls) {
    cls = await classRepo.save(classRepo.create({ name: '六(3)班', grade: '六年级', teacherId: (await userRepo.findOneBy({ username: 'T1001' })).id }));
  }

  // 学生
  const studentUser = await userRepo.findOneBy({ username: '2024001' });
  if (!studentUser) {
    await userRepo.save(
      userRepo.create({
        role: UserRole.STUDENT,
        username: '2024001',
        passwordHash: '$2a$10$PLACEHOLDER_REPLACE_ME',
        name: '李小明',
        status: UserStatus.ACTIVE,
      }),
    );
    const stu = await userRepo.findOneBy({ username: '2024001' });
    await studentRepo.save(studentRepo.create({ userId: stu.id, studentNo: '2024001', classId: cls.id }));
  }

  // 知识点（模块 → 考点 → 知识点 三级示例）
  const moduleName = await kpRepo.findOneBy({ name: '图形与几何', level: 1 });
  if (!moduleName) {
    const module = await kpRepo.save(kpRepo.create({ level: 1, name: '图形与几何', code: 'M-GEO' }));
    const exam = await kpRepo.save(kpRepo.create({ level: 2, name: '圆', parentId: module.id, code: 'E-CIRCLE' }));
    await kpRepo.save(kpRepo.create({ level: 3, name: '圆的面积', parentId: exam.id, code: 'K-CIRCLE-AREA' }));
  }

  await AppDataSource.destroy();
  console.log('Seed data created.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
