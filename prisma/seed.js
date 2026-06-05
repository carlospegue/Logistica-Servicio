const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('Iniciando seed...')

    const adminPass = await bcrypt.hash('admin123', 10)
    const opPass = await bcrypt.hash('op123', 10)

    await prisma.user.createMany({
        data: [
            { email: 'admin@stockflow.com', password: adminPass, role: 'ADMIN' },
            { email: 'operator@stockflow.com', password: opPass, role: 'OPERATOR' },
        ],
        skipDuplicates: true,
    })
    console.log('Usuarios creados')

    const cat = await prisma.category.create({ data: { name: 'Electronica' } })
    console.log('Categoria creada')

    await prisma.product.createMany({
        data: [
            { name: 'Laptop HP', sku: 'LAP-001', stock: 10, minStock: 3, price: 899.99, categoryId: cat.id },
            { name: 'Mouse USB', sku: 'MOU-001', stock: 2, minStock: 5, price: 15.50, categoryId: cat.id },
        ],
        skipDuplicates: true,
    })
    console.log('Productos creados')
}

main()
    .catch((e) => console.error('Error:', e))
    .finally(() => prisma.$disconnect())