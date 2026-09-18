import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('classes')
export class ClassEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 32 })
  grade: string;

  @Column({ name: 'teacher_id', type: 'int', nullable: true })
  teacherId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
