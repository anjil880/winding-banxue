import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('student_tasks')
export class StudentTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id', type: 'int' })
  taskId: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ type: 'varchar', length: 20, default: 'assigned' })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'int', nullable: true })
  score: number;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;
}
