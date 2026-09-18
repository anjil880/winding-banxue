import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('mastery')
export class Mastery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'knowledge_point_id', type: 'int' })
  knowledgePointId: number;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ name: 'total_attempts', type: 'int', default: 0 })
  totalAttempts: number;

  @Column({ name: 'correct_attempts', type: 'int', default: 0 })
  correctAttempts: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
