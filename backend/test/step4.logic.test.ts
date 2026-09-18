import * as assert from 'assert';
import * as bcrypt from 'bcryptjs';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { QueryUsersDto } from '../src/users/dto/query-users.dto';
import { AddStudentsDto } from '../src/classes/dto/add-students.dto';
import { UserRole, UserStatus } from '../src/entities/user.entity';

/**
 * Step 4 用户与班级模块逻辑单元测试（无数据库依赖）。
 * 运行方式：npm run test:step4
 * 覆盖：DTO 校验规则、密码哈希、角色扩展字段约束。
 */
async function main(): Promise<void> {
  // 1. CreateUserDto 校验：合法学生
  const validStudent = plainToInstance(CreateUserDto, {
    role: UserRole.STUDENT,
    username: 'stu_001',
    password: 'Passw0rd123',
    name: '张三',
    studentNo: 'S001',
  });
  assert.strictEqual((await validate(validStudent)).length, 0, '合法学生应无校验错误');

  // 2. CreateUserDto 校验：非法（用户名含特殊字符、密码过短）
  const invalidUser = plainToInstance(CreateUserDto, {
    role: UserRole.STUDENT,
    username: 'bad name!',
    password: '123',
    name: '',
    studentNo: 'S002',
  });
  const invalidErrors = await validate(invalidUser);
  assert.ok(invalidErrors.length > 0, '非法输入应产生校验错误');

  // 3. role 非法枚举值
  const badRole = plainToInstance(CreateUserDto, {
    role: 'superuser',
    username: 'x_001',
    password: 'Passw0rd123',
    name: '测试',
  });
  const badRoleErrors = await validate(badRole);
  assert.ok(
    badRoleErrors.some((e) => e.property === 'role'),
    'role 非法值应报错',
  );

  // 4. 密码哈希往返
  const hash = await bcrypt.hash('Admin@123456', 10);
  assert.strictEqual(await bcrypt.compare('Admin@123456', hash), true);
  assert.strictEqual(await bcrypt.compare('wrong', hash), false);

  // 5. QueryUsersDto 分页默认值 + 类型转换
  const q = plainToInstance(QueryUsersDto, {});
  await validate(q);
  assert.strictEqual(q.page, 1);
  assert.strictEqual(q.pageSize, 20);

  const q2 = plainToInstance(QueryUsersDto, { page: '2', pageSize: '50', role: UserRole.TEACHER });
  await validate(q2);
  assert.strictEqual(q2.page, 2);
  assert.strictEqual(q2.pageSize, 50);
  assert.strictEqual(q2.role, UserRole.TEACHER);

  // 6. AddStudentsDto：空数组应报错
  const emptyAdd = plainToInstance(AddStudentsDto, { studentIds: [] });
  const emptyErrors = await validate(emptyAdd);
  assert.ok(emptyErrors.length > 0, '空学生列表应报错');

  const validAdd = plainToInstance(AddStudentsDto, { studentIds: [1, 2, 3] });
  assert.strictEqual((await validate(validAdd)).length, 0);

  // 7. 角色枚举与状态枚举值一致性
  assert.deepStrictEqual(
    Object.values(UserRole).sort(),
    ['admin', 'student', 'teacher'].sort(),
  );
  assert.deepStrictEqual(
    Object.values(UserStatus).sort(),
    ['active', 'inactive'].sort(),
  );

  console.log('PASS: step4 logic tests');
}

main().catch((error) => {
  console.error('FAIL: step4 logic tests');
  console.error(error);
  process.exit(1);
});
