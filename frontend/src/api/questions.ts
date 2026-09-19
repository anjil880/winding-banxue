import type { KnowledgeNode, Question, QuestionForm, QuestionQuery } from '@/types'

/** 题库/知识点接口占位（后端 Step 5 实现后替换为真实 axios 请求） */

const knowledgeTreeData: KnowledgeNode[] = [
  {
    id: 1,
    name: '数与代数',
    level: 1,
    parentId: null,
    children: [
      {
        id: 11,
        name: '整数运算',
        level: 2,
        parentId: 1,
        children: [
          { id: 111, name: '四则混合运算', level: 3, parentId: 11 },
          { id: 112, name: '巧算与速算', level: 3, parentId: 11 }
        ]
      },
      {
        id: 12,
        name: '分数与小数',
        level: 2,
        parentId: 1,
        children: [
          { id: 121, name: '分数加减法', level: 3, parentId: 12 },
          { id: 122, name: '分数乘除法', level: 3, parentId: 12 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '图形与几何',
    level: 1,
    parentId: null,
    children: [
      {
        id: 21,
        name: '平面图形',
        level: 2,
        parentId: 2,
        children: [
          { id: 211, name: '长方形与正方形', level: 3, parentId: 21 },
          { id: 212, name: '三角形面积', level: 3, parentId: 21 }
        ]
      }
    ]
  },
  {
    id: 3,
    name: '应用题',
    level: 1,
    parentId: null,
    children: [
      {
        id: 31,
        name: '行程问题',
        level: 2,
        parentId: 3,
        children: [
          { id: 311, name: '相遇问题', level: 3, parentId: 31 },
          { id: 312, name: '追及问题', level: 3, parentId: 31 }
        ]
      }
    ]
  }
]

let questionIdCounter = 6

const questionsData: Question[] = [
  {
    id: 1,
    stem: '计算：25 × 4 + 36 ÷ 6 = ?',
    options: ['106', '116', '126', '136'],
    answer: '106',
    analysis: '先乘除后加减：25×4=100，36÷6=6，100+6=106。',
    knowledgePointId: 111,
    type: 'choice',
    difficulty: 'basic',
    tagged: true,
    source: '校本题库'
  },
  {
    id: 2,
    stem: '一个长方形长 8cm，宽 5cm，求面积。',
    options: ['13cm²', '26cm²', '40cm²', '45cm²'],
    answer: '40cm²',
    analysis: '长方形面积 = 长 × 宽 = 8 × 5 = 40cm²。',
    knowledgePointId: 211,
    type: 'choice',
    difficulty: 'basic',
    tagged: true,
    source: '校本题库'
  },
  {
    id: 3,
    stem: '甲乙两车分别从 A、B 两地同时出发相向而行，甲速 60km/h，乙速 40km/h，2 小时后相遇，求两地距离。',
    options: [],
    answer: '200km',
    analysis: '路程 = 速度和 × 时间 = (60+40)×2 = 200km。',
    knowledgePointId: 311,
    type: 'fill',
    difficulty: 'advanced',
    tagged: true,
    source: '校本题库'
  },
  {
    id: 4,
    stem: '计算：1/2 + 1/3',
    options: ['2/5', '5/6', '1/6', '3/2'],
    answer: '5/6',
    analysis: '通分：1/2=3/6，1/3=2/6，3/6+2/6=5/6。',
    knowledgePointId: 121,
    type: 'choice',
    difficulty: 'basic',
    tagged: true,
    source: '校本题库'
  },
  {
    id: 5,
    stem: '鸡兔同笼：头共 35 个，脚共 94 只，求鸡兔各几只？',
    options: [],
    answer: ['鸡 23 只，兔 12 只'],
    analysis: '假设全是鸡，则脚 70 只，多出 24 只脚，每只兔多 2 只脚，故兔 12 只，鸡 23 只。',
    knowledgePointId: 312,
    type: 'answer',
    difficulty: 'challenge',
    tagged: false,
    source: '校本题库'
  }
]

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/** 知识点树 */
export function getKnowledgeTree(): Promise<KnowledgeNode[]> {
  return delay([...knowledgeTreeData])
}

/** 题目列表 */
export function getQuestions(params: QuestionQuery): Promise<{ list: Question[]; total: number; page: number; size: number }> {
  const { page = 1, size = 10, keyword = '', type = '', difficulty = '', knowledgePointId } = params
  let list = [...questionsData]
  if (keyword) {
    list = list.filter((q) => q.stem.includes(keyword))
  }
  if (type) {
    list = list.filter((q) => q.type === type)
  }
  if (difficulty) {
    list = list.filter((q) => q.difficulty === difficulty)
  }
  if (knowledgePointId) {
    list = list.filter((q) => q.knowledgePointId === knowledgePointId)
  }
  const total = list.length
  const start = (page - 1) * size
  const pageList = list.slice(start, start + size)
  return delay({ list: pageList, total, page, size })
}

/** 创建题目 */
export function createQuestion(dto: QuestionForm): Promise<Question> {
  const question: Question = {
    id: questionIdCounter++,
    tagged: !!dto.knowledgePointId,
    ...dto
  }
  questionsData.unshift(question)
  return delay(question)
}

/** 更新题目 */
export function updateQuestion(id: number, dto: QuestionForm): Promise<Question> {
  const index = questionsData.findIndex((q) => q.id === id)
  if (index === -1) {
    return Promise.reject(new Error('题目不存在'))
  }
  const updated: Question = {
    ...questionsData[index],
    ...dto,
    id,
    tagged: !!dto.knowledgePointId
  }
  questionsData.splice(index, 1, updated)
  return delay(updated)
}

/** 删除题目 */
export function deleteQuestion(id: number): Promise<void> {
  const index = questionsData.findIndex((q) => q.id === id)
  if (index !== -1) {
    questionsData.splice(index, 1)
  }
  return delay(undefined)
}
