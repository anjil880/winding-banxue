import { User } from './user.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { ClassEntity } from './class.entity';
import { ClassStudent } from './class-student.entity';
import { KnowledgePoint } from './knowledge-point.entity';
import { Question } from './question.entity';
import { Task } from './task.entity';
import { StudentTask } from './student-task.entity';
import { Submission } from './submission.entity';
import { Mastery } from './mastery.entity';
import { WrongBook } from './wrongbook.entity';
import { RefreshToken } from './refresh-token.entity';
import { Notification } from './notification.entity';
import { AuditLog } from './audit-log.entity';

export const allEntities = [
  User,
  Student,
  Teacher,
  ClassEntity,
  ClassStudent,
  KnowledgePoint,
  Question,
  Task,
  StudentTask,
  Submission,
  Mastery,
  WrongBook,
  RefreshToken,
  Notification,
  AuditLog,
];

export {
  User,
  Student,
  Teacher,
  ClassEntity,
  ClassStudent,
  KnowledgePoint,
  Question,
  Task,
  StudentTask,
  Submission,
  Mastery,
  WrongBook,
  RefreshToken,
  Notification,
  AuditLog,
};
