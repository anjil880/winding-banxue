import * as assert from 'assert';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import {
  generateRefreshToken,
  sha256,
  isExpired,
} from '../src/auth/token.util';

/**
 * 认证模块逻辑单元测试（无数据库依赖）。
 * 运行方式：npm run test:logic
 * 全部断言通过打印 PASS，否则打印 FAIL 并以退出码 1 结束。
 */
async function main(): Promise<void> {
  // 1. bcryptjs hash / compare 往返
  const plain = 'Student@123456';
  const hash = await bcrypt.hash(plain, 10);
  assert.strictEqual(await bcrypt.compare(plain, hash), true);
  assert.strictEqual(await bcrypt.compare('WrongPassword', hash), false);

  // 2. JwtService 签发 / 校验往返
  const jwtService = new JwtService({
    secret: 'unit-test-secret',
    signOptions: { expiresIn: '30m' },
  });
  const payload = { sub: 1, username: 'admin', role: 'admin' };
  const token = await jwtService.signAsync(payload);
  assert.strictEqual(typeof token, 'string');
  const decoded = await jwtService.verifyAsync<typeof payload>(token);
  assert.strictEqual(decoded.sub, payload.sub);
  assert.strictEqual(decoded.username, payload.username);
  assert.strictEqual(decoded.role, payload.role);

  // 篡改令牌应校验失败
  let tamperedRejected = false;
  try {
    await jwtService.verifyAsync(`${token}tampered`);
  } catch {
    tamperedRejected = true;
  }
  assert.strictEqual(tamperedRejected, true);

  // 3. refresh token 生成 + SHA-256 哈希往返 + 过期判断
  const raw = generateRefreshToken();
  assert.strictEqual(typeof raw, 'string');
  assert.strictEqual(raw.length, 64); // 32 bytes -> 64 hex chars
  assert.notStrictEqual(generateRefreshToken(), raw); // 随机性

  const hashed = sha256(raw);
  assert.strictEqual(typeof hashed, 'string');
  assert.strictEqual(hashed.length, 64); // sha256 -> 64 hex chars
  assert.strictEqual(sha256(raw), hashed); // 确定性（往返一致）

  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const past = new Date(Date.now() - 1000);
  assert.strictEqual(isExpired(future), false);
  assert.strictEqual(isExpired(past), true);

  console.log('PASS: auth logic tests');
}

main().catch((error) => {
  console.error('FAIL: auth logic tests');
  console.error(error);
  process.exit(1);
});
