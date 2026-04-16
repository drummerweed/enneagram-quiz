import { PrismaClient } from '@prisma/client'
import { questions } from './src/lib/questions'

const prisma = new PrismaClient()

async function main() {
  const session = await prisma.session.create({
    data: {
      name: "Test User"
    }
  });

  const answersData = questions.map(q => {
    // Strongly favor Type 2
    let value = 3;
    if (q.type === 2) {
      value = 5;
    } else {
      value = Math.floor(Math.random() * 3) + 1; // random 1-3
    }

    return {
        sessionId: session.id,
        questionId: q.id,
        value: value
    }
  });

  await prisma.answer.createMany({
    data: answersData
  });

  console.log(`\n✅ Successfully completed test as "Test User" with Session ID: ${session.id}\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
