import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.subject.updateMany({
    where: { name: '408 - 数据结构' },
    data: { totalModules: 32 }
  })
  console.log('✅ 数据库中【408 - 数据结构】的总模块数已成功热更新为 32')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
