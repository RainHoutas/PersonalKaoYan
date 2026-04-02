import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const subject = await prisma.subject.findFirst({
    where: { name: '高等数学' }
  })

  if (subject) {
    console.log(`Found Subject: ${subject.id}`)
    const record = await prisma.record.create({
      data: {
        subjectId: subject.id,
        modulesDone: 10,
        date: new Date().toISOString().split('T')[0] // 修正日期格式为 YYYY-MM-DD
      }
    })
    console.log(`Completed 10 modules for 高等数学. Record ID: ${record.id}`)
  } else {
    console.error('Subject "高等数学" not found.')
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
