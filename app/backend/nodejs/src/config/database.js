import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  // Development: log all queries
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: [/* 'query', */ 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

