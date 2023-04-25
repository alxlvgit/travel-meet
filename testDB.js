const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.create({
        data: {
            name: 'John',
            email: 'john@example.com',
            password: 'secret'
        }
    })
    console.log(user)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })