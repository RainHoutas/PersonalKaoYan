import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const math = await prisma.subject.findFirst({
    where: { name: '高等数学' }
  })
  
  if (!math) {
    console.log('未找到高等数学项目')
    return
  }

  const existing = await prisma.chapter.count({
    where: { subjectId: math.id }
  })

  if (existing > 0) {
    console.log('✅ 章节已存在，略过注入。')
    return
  }

  const chapters = []
  for (let i = 1; i <= 9; i++) {
    chapters.push({
      subjectId: math.id,
      order: i,
      title: `第 ${i} 章`
    })
  }

  await prisma.chapter.createMany({
    data: chapters
  })

  console.log(`✅ 成功为 高等数学 挂载 ${chapters.length} 个碎片段落结构`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
