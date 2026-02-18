import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting user seed...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@sintas.go.id' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create default admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sintas.go.id',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
      jabatan: 'Kepala Bagian Administrasi',
      isActive: true,
    },
  });

  console.log('Admin user created successfully:');
  console.log({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    jabatan: admin.jabatan,
  });
}

main()
  .catch((e) => {
    console.error('Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
