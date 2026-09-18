import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_task_id', type: 'int' })
  studentTaskId: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'question_id', type: 'int' })
  questionId: number;

  @Column({ type: 'text', nullable: true })
  answer: string;

  @Column({ name: 'is_correct', type: 'boolean', nullable: true })
  isCorrect: boolean;

  @Column({ name: 'error_tag', type: 'varchar', length: 64, nullable: true })
  errorTag: string;

  @Column({ name: 'ai_explanation', type: 'text', nullable: true })
  aiExplanation: string;

  @Column({ name: 'time_spent_seconds', type: 'int', default: 0 })
  timeSpentSeconds: number;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;
}
