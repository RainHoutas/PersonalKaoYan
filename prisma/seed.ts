import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('清理旧数据...')
  // 先删除关联记录，再删除科目，防止重复运行导致数据翻倍
  await prisma.record.deleteMany()
  await prisma.subject.deleteMany()

  console.log('写入初始科目...')

  const subjects = [
    {
      name: '高等数学',
      stageName: '一轮复习',
      totalModules: 42,
      subjectType: 'PROFESSIONAL',
      startDate: '2026-03-10',
      endDate: '2026-04-20',
      chapters: {
        create: Array.from({ length: 9 }).map((_, i) => ({
          order: i + 1,
          title: `第 ${i + 1} 章`
        }))
      }
    },
    {
      name: '线性代数',
      stageName: '模块化复习',
      totalModules: 25,
      subjectType: 'PROFESSIONAL',
      startDate: '2026-04-21',
      endDate: '2026-05-15'
    },
    {
      name: '408 - 数据结构',
      stageName: '重点攻坚',
      totalModules: 32,
      subjectType: 'PROFESSIONAL',
      startDate: '2026-03-10',
      endDate: '2026-04-08'
    },
    {
      name: '408 - 计算机组成原理',
      stageName: '一轮复习',
      totalModules: 30,
      subjectType: 'PROFESSIONAL',
      startDate: '2026-04-09',
      endDate: '2026-05-08'
    },
    {
      name: '408 - 操作系统',
      stageName: '一轮复习',
      totalModules: 25,
      subjectType: 'PROFESSIONAL',
      startDate: '2026-05-09',
      endDate: '2026-06-02'
    },
    {
      name: '408 - 计算机网络',
      stageName: '一轮复习',
      totalModules: 15,
      subjectType: 'PROFESSIONAL',
      startDate: '2026-06-03',
      endDate: '2026-06-17'
    },
    {
      name: '考研英语',
      stageName: '单词长难句',
      totalModules: 0, // 英语不依赖模块配速
      subjectType: 'ENGLISH'
    }
  ]

  for (const s of subjects) {
    await prisma.subject.create({
      data: s
    })
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
