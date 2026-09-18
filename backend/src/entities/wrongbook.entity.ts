import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('wrongbook')
export class WrongBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'question_id', type: 'int' })
  questionId: number;

  @Column({ name: 'first_wrong_at', type: 'timestamptz', default: () => 'NOW()' })
  firstWrongAt: Date;

  @Column({ name: 'last_wrong_at', type: 'timestamptz', default: () => 'NOW()' })
  lastWrongAt: Date;

  @Column({ name: 'wrong_count', type: 'int', default: 1 })
  wrongCount: number;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'last_retry_correct', type: 'boolean', nullable: true })
  lastRetryCorrect: boolean;

  @Column({ name: 'next_review_at', type: 'timestamptz', nullable: true })
  nextReviewAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: string;
}
