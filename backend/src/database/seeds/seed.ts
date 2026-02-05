import dataSource from '../../config/typeorm.config';
import * as bcrypt from 'bcrypt';
import { Shop } from '../../modules/shops/entities/shop.entity';
import { ShopWorkingHours } from '../../modules/shops/entities/shop-working-hours.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Service } from '../../modules/services/entities/service.entity';

async function seed() {
  await dataSource.initialize();

  const shopRepo = dataSource.getRepository(Shop);
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const serviceRepo = dataSource.getRepository(Service);
  const hoursRepo = dataSource.getRepository(ShopWorkingHours);

  const shopEmail = 'hello@beautivo.local';
  let shop = await shopRepo.findOne({ where: { email: shopEmail } });

  if (!shop) {
    shop = shopRepo.create({
      name: 'Beautivo Studio',
      description: 'Sample salon for local development.',
      email: shopEmail,
      phone: '+30 210 000 0000',
      address: '123 Beauty St',
      city: 'Athens',
      postalCode: '10558',
      country: 'GR',
      timezone: 'Europe/Athens',
      settings: {
        minBookingNotice: 30,
        maxAdvanceBooking: 90,
        bufferTime: 15,
        cancellationDeadline: 120,
        employeeSelection: 'mandatory',
        defaultBookingStatus: 'confirmed',
        requirePhone: true,
        allowNotes: true,
      },
      images: [],
      isActive: true,
    });
    shop = await shopRepo.save(shop);
  }

  let role = await roleRepo.findOne({
    where: { shopId: shop.id, name: 'Shop Admin' },
  });

  if (!role) {
    role = roleRepo.create({
      shopId: shop.id,
      name: 'Shop Admin',
      description: 'Full access role for shop administrators.',
      permissions: [
        'bookings.view',
        'bookings.create',
        'bookings.update',
        'bookings.delete',
        'services.view',
        'services.create',
        'services.update',
        'services.delete',
        'categories.view',
        'categories.manage',
        'staff.view',
        'staff.create',
        'staff.update',
        'staff.delete',
        'customers.view',
        'customers.update',
        'customers.delete',
        'customers.notes',
        'settings.view',
        'settings.update',
        'settings.hours',
        'settings.booking',
        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',
        'reports.view',
        'reports.export',
      ],
      isSystem: false,
      isDefault: true,
    });
    role = await roleRepo.save(role);
  }

  const adminEmail = 'admin@beautivo.local';
  const seedAdminPassword = 'ChangeMe123!';
  let admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(seedAdminPassword, 10);
    admin = userRepo.create({
      shopId: shop.id,
      roleId: role.id,
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Beautivo',
      lastName: 'Admin',
      is2FAEnabled: false,
      isActive: true,
    });
    admin = await userRepo.save(admin);
  } else if (!admin.password.startsWith('$2')) {
    admin.password = await bcrypt.hash(seedAdminPassword, 10);
    await userRepo.save(admin);
  }

  let category = await categoryRepo.findOne({
    where: { shopId: shop.id, name: 'Hair' },
  });
  if (!category) {
    category = categoryRepo.create({
      shopId: shop.id,
      name: 'Hair',
      nameEn: 'Hair',
      description: 'Cuts, styling and treatments',
      descriptionEn: 'Cuts, styling and treatments',
      sortOrder: 1,
      isActive: true,
    });
    category = await categoryRepo.save(category);
  }

  let service = await serviceRepo.findOne({
    where: { shopId: shop.id, name: 'Signature Haircut' },
  });
  if (!service) {
    service = serviceRepo.create({
      shopId: shop.id,
      categoryId: category.id,
      name: 'Signature Haircut',
      nameEn: 'Signature Haircut',
      description: 'Cut, wash, and finish.',
      descriptionEn: 'Cut, wash, and finish.',
      duration: 45,
      price: 30,
      bufferTime: 10,
      sortOrder: 1,
      isActive: true,
    });
    service = await serviceRepo.save(service);
  }

  const existingHours = await hoursRepo.count({ where: { shopId: shop.id } });
  if (existingHours === 0) {
    const hours = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
    ].map((entry) =>
      hoursRepo.create({
        shopId: shop.id,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        isOpen: true,
      }),
    );
    await hoursRepo.save(hours);
  }

  await dataSource.destroy();
  console.log('Seed completed successfully.');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  dataSource.destroy().catch(() => undefined);
  process.exit(1);
});
