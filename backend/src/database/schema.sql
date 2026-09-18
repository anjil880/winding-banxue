-- 生产环境 DDL 参考（开发环境由 TypeORM synchronize 自动建表）
-- 执行前请确认目标库为空或版本一致

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('student','teacher','admin')),
  username      VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(64) NOT NULL,
  phone         VARCHAR(20),
  email         VARCHAR(128),
  status        VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teachers (
  user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  teacher_no  VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS classes (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(64) NOT NULL,
  grade      VARCHAR(32) NOT NULL,
  teacher_id INTEGER REFERENCES teachers(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  student_no VARCHAR(64) NOT NULL UNIQUE,
  class_id   INTEGER REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS class_students (
  class_id   INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(user_id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);

CREATE TABLE IF NOT EXISTS knowledge_points (
  id         SERIAL PRIMARY KEY,
  parent_id  INTEGER REFERENCES knowledge_points(id),
  level      INTEGER NOT NULL CHECK (level IN (1,2,3)),
  name       VARCHAR(128) NOT NULL,
  code       VARCHAR(64) UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id                 SERIAL PRIMARY KEY,
  type               VARCHAR(32) NOT NULL,
  stem               TEXT NOT NULL,
  options            JSONB,
  answer             TEXT NOT NULL,
  explanation        TEXT,
  difficulty         INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  knowledge_point_id INTEGER REFERENCES knowledge_points(id),
  error_tags         JSONB,
  source             VARCHAR(128),
  review_status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_by         INTEGER REFERENCES users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  class_id     INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_by   INTEGER NOT NULL REFERENCES users(id),
  question_ids INTEGER[] NOT NULL,
  settings     JSONB NOT NULL DEFAULT '{}',
  status       VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_tasks (
  id           SERIAL PRIMARY KEY,
  task_id      INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  student_id   INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  status       VARCHAR(20) NOT NULL DEFAULT 'assigned',
  progress     INTEGER NOT NULL DEFAULT 0,
  score        INTEGER,
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE (task_id, student_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id                 SERIAL PRIMARY KEY,
  student_task_id    INTEGER NOT NULL REFERENCES student_tasks(id) ON DELETE CASCADE,
  student_id         INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  question_id        INTEGER NOT NULL REFERENCES questions(id),
  answer             TEXT,
  is_correct         BOOLEAN,
  error_tag          VARCHAR(64),
  ai_explanation     TEXT,
  time_spent_seconds INTEGER DEFAULT 0,
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mastery (
  id                 SERIAL PRIMARY KEY,
  student_id         INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  knowledge_point_id INTEGER NOT NULL REFERENCES knowledge_points(id) ON DELETE CASCADE,
  score              INTEGER NOT NULL DEFAULT 0,
  total_attempts     INTEGER NOT NULL DEFAULT 0,
  correct_attempts   INTEGER NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, knowledge_point_id)
);

CREATE TABLE IF NOT EXISTS wrongbook (
  id                 SERIAL PRIMARY KEY,
  student_id         INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  question_id        INTEGER NOT NULL REFERENCES questions(id),
  first_wrong_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_wrong_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  wrong_count        INTEGER NOT NULL DEFAULT 1,
  retry_count        INTEGER NOT NULL DEFAULT 0,
  last_retry_correct BOOLEAN,
  next_review_at     TIMESTAMPTZ,
  status             VARCHAR(20) NOT NULL DEFAULT 'open',
  UNIQUE (student_id, question_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(32) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  action      VARCHAR(64) NOT NULL,
  resource    VARCHAR(64) NOT NULL,
  resource_id VARCHAR(64),
  ip_address  INET,
  user_agent  TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_kp ON questions(knowledge_point_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_question ON submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_mastery_student ON mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_mastery_kp ON mastery(knowledge_point_id);
CREATE INDEX IF NOT EXISTS idx_wrongbook_student ON wrongbook(student_id);
CREATE INDEX IF NOT EXISTS idx_student_tasks_task ON student_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_class ON tasks(class_id);
