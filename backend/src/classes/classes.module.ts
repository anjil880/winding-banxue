import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from '../entities/class.entity';
import { ClassStudent } from '../entities/class-student.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { CommonModule } from '../common/common.module';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassEntity, ClassStudent, Student, User]),
    CommonModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
