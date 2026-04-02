import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const math = await prisma.subject.findFirst({
    where: { name: '高等数学' }
  })
  
  const ds = await prisma.subject.findFirst({
    where: { name: '408 - 数据结构' }
  })

  // 使用当前日期（如果需要也可以硬编码）
  const today = new Date().toISOString().split('T')[0]

  if (math) {
    await prisma.record.create({
      data: {
        subjectId: math.id,
        modulesDone: 13.5,
        date: today,
        note: '补充初始化进度'
      }
    })
    console.log(`✅ 高等数学补充录入：13.5 单位`)
  }

  if (ds) {
    await prisma.record.create({
      data: {
        subjectId: ds.id,
        modulesDone: 13,
        date: today,
        note: '补充初始化进度'
      }
    })
    console.log(`✅ 数据结构补充录入：13 单位`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
