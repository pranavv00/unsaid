// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed colleges
  const colleges = await Promise.all([
    prisma.college.upsert({
      where: { slug: 'pccoe' },
      update: {},
      create: { name: 'PCCOE', slug: 'pccoe' },
    }),
    prisma.college.upsert({
      where: { slug: 'mit' },
      update: {},
      create: { name: 'MIT Pune', slug: 'mit' },
    }),
    prisma.college.upsert({
      where: { slug: 'vit' },
      update: {},
      create: { name: 'VIT Vellore', slug: 'vit' },
    }),
    prisma.college.upsert({
      where: { slug: 'coep' },
      update: {},
      create: { name: 'COEP', slug: 'coep' },
    }),
  ])

  // Seed companies
  const companies = ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys', 'TCS', 'Wipro', 'Deloitte', 'Accenture', 'Goldman Sachs']
  for (const name of companies) {
    await prisma.company.upsert({
      where: { id: companies.indexOf(name) + 1 },
      update: {},
      create: { name },
    })
  }

  console.log('Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
