import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'student_no', type: 'varchar', length: 64, unique: true })
  studentNo: string;

  @Column({ name: 'class_id', type: 'int', nullable: true })
  classId: number;
}
