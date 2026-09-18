import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('teachers')
export class Teacher {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'teacher_no', type: 'varchar', length: 64, unique: true })
  teacherNo: string;
}
