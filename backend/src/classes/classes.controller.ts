import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AddStudentsDto } from './dto/add-students.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { AuditService } from '../common/services/audit.service';
import { UserRole } from '../entities/user.entity';

/**
 * 班级管理接口。
 * - 管理员：全部操作
 * - 老师：读取班级与学生列表（写操作限 admin）
 * 路径经全局前缀后为 /api/v1/classes/*。
 */
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  list() {
    return this.classesService.list();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  get(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findById(id);
  }

  @Get(':id/students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  listStudents(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.listStudents(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() dto: CreateClassDto,
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    const cls = await this.classesService.create(dto);
    await this.audit.record({
      userId: operator.sub,
      action: 'class.create',
      resource: 'class',
      resourceId: String(cls.id),
      details: { name: dto.name },
    });
    return cls;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassDto,
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    const cls = await this.classesService.update(id, dto);
    await this.audit.record({
      userId: operator.sub,
      action: 'class.update',
      resource: 'class',
      resourceId: String(id),
      details: { ...dto },
    });
    return cls;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    await this.classesService.remove(id);
    await this.audit.record({
      userId: operator.sub,
      action: 'class.remove',
      resource: 'class',
      resourceId: String(id),
    });
    return { message: 'ok' };
  }

  @Post(':id/students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async addStudents(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddStudentsDto,
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    const result = await this.classesService.addStudents(id, dto.studentIds);
    await this.audit.record({
      userId: operator.sub,
      action: 'class.add_students',
      resource: 'class',
      resourceId: String(id),
      details: { count: dto.studentIds.length },
    });
    return result;
  }

  @Delete(':id/students/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async removeStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    await this.classesService.removeStudent(id, studentId);
    await this.audit.record({
      userId: operator.sub,
      action: 'class.remove_student',
      resource: 'class',
      resourceId: String(id),
      details: { studentId },
    });
    return { message: 'ok' };
  }
}
