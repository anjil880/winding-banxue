import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('class_students')
export class ClassStudent {
  @PrimaryColumn({ name: 'class_id', type: 'int' })
  classId: number;

  @PrimaryColumn({ name: 'student_id', type: 'int' })
  studentId: number;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
