import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32 })
  type: string;

  @Column({ type: 'text' })
  stem: string;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, string>;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ type: 'int' })
  difficulty: number;

  @Column({ name: 'knowledge_point_id', type: 'int', nullable: true })
  knowledgePointId: number;

  @Column({ name: 'error_tags', type: 'jsonb', nullable: true })
  errorTags: string[];

  @Column({ type: 'varchar', length: 128, nullable: true })
  source: string;

  @Column({ name: 'review_status', type: 'varchar', length: 20, default: 'pending' })
  reviewStatus: string;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
