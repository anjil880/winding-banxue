import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * RBAC 角色元数据装饰器。
 * 用法：@Roles('admin', 'teacher')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
