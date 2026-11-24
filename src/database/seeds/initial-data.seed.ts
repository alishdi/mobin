import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, RoleName } from '../entities/role-permission/role.entity';
import { Permission, PermissionResource, PermissionAction } from '../entities/role-permission/permission.entity';
import { User } from '../entities/user.entity';
import { Setting, SettingType } from '../entities/setting.entity';
import { Menu } from '../entities/menu/menu.entity';
import { Submenu } from '../entities/menu/sub-menu.entity';
import { Megamenu } from '../entities/menu/mega-menu.entity';
import { ALL_PERMISSIONS } from '../../common/constants/permissions.constant';
import { Footer, FooterSection } from '../entities/footer/footer.entity';
import { Product } from '../entities/product/product.entity';
import { Brand } from '../entities/product/brand.entity';
import { InstallmentPlan } from '../entities/installment/installment-plan.entity';
import { Vehicle } from '../entities/vehicles/vehicle.entity';
import { VehicleModel } from '../entities/vehicles/vehicle-model.entity';
import { ApiClient } from '../entities/api-client/api-client.entity';
import { createHmac, randomBytes } from 'node:crypto';

export async function runSeed(dataSource: DataSource) {
  console.log('🌱 شروع فرآیند Seed دیتابیس...');

  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);
  const userRepo = dataSource.getRepository(User);
  const settingRepo = dataSource.getRepository(Setting);
  const menuRepo = dataSource.getRepository(Menu);
  const submenuRepo = dataSource.getRepository(Submenu);
  const megamenuRepo = dataSource.getRepository(Megamenu);
  const footerRepo = dataSource.getRepository(Footer);
  const productRepo = dataSource.getRepository(Product);
  const brandRepo = dataSource.getRepository(Brand);
  const planRepo = dataSource.getRepository(InstallmentPlan);
  const vehicleRepo = dataSource.getRepository(Vehicle);
  const modelRepo = dataSource.getRepository(VehicleModel);
  const apiClientRepo = dataSource.getRepository(ApiClient);

  try {
    // ==========================================
    // ۱. دسترسی‌ها و نقش‌ها
    // ==========================================
    console.log('🔹 در حال بررسی/ساخت دسترسی‌ها...');
    const permissions: Permission[] = [];
    for (const def of ALL_PERMISSIONS) {
      let perm = await permissionRepo.findOne({ where: { code: def.code } });
      if (!perm) {
        perm = permissionRepo.create(def);
        perm = await permissionRepo.save(perm);
      }
      permissions.push(perm);
    }
    console.log(`✅ ${permissions.length} دسترسی آماده است.`);

    console.log('🔹 در حال بررسی/ساخت نقش‌ها...');
    const roleDefs = [
      {
        name: RoleName.SUPER_ADMIN,
        displayName: 'مدیر کل',
        description: 'دسترسی نامحدود به تمام بخش‌های سیستم',
        perms: permissions,
      },
      {
        name: RoleName.ADMIN,
        displayName: 'مدیر',
        description: 'مدیریت کاربران، خودروها و قراردادها',
        perms: permissions.filter(p => p.resource !== PermissionResource.ROLES),
      },
      {
        name: RoleName.OPERATOR,
        displayName: 'اپراتور محتوا',
        description: 'مدیریت منوها، ساب‌منوها، مگا منوها، اسلایدرها و تنظیمات سایت',
        perms: permissions.filter(p =>
          [PermissionResource.MENUS, PermissionResource.SUBMENUS, PermissionResource.MEGAMENUS, PermissionResource.SLIDERS, PermissionResource.FOOTERS, PermissionResource.SETTINGS].includes(p.resource)
        ),
      },
      {
        name: RoleName.SALES_CONSULTANT,
        displayName: 'مشاور فروش',
        description: 'ثبت خودرو و مدیریت قراردادها',
        perms: permissions.filter(p => [PermissionResource.VEHICLES, PermissionResource.CONTRACTS].includes(p.resource)),
      },
      {
        name: RoleName.ACCOUNTANT,
        displayName: 'حسابدار',
        description: 'مشاهده پرداخت‌ها و گزارشات مالی',
        perms: permissions.filter(p => [PermissionResource.PAYMENTS, PermissionResource.REPORTS].includes(p.resource)),
      },
      {
        name: RoleName.USER,
        displayName: 'کاربر عادی',
        description: 'دسترسی محدود به پنل کاربری',
        perms: permissions.filter(p => p.resource === PermissionResource.USERS && p.action === PermissionAction.READ),
      },
    ];

    const savedRoles: Role[] = [];
    for (const def of roleDefs) {
      let role = await roleRepo.findOne({ where: { name: def.name }, relations: { permissions: true } });
      if (!role) {
        role = roleRepo.create({ name: def.name, displayName: def.displayName, description: def.description, permissions: def.perms });
        role = await roleRepo.save(role);
      } else {
        role.permissions = def.perms;
        await roleRepo.save(role);
      }
      savedRoles.push(role);
    }
    console.log(`✅ ${savedRoles.length} نقش آماده است.`);

    // ==========================================
    // ۲. کاربر Super Admin
    // ==========================================
    console.log('🔹 در حال بررسی/ساخت کاربر Super Admin...');
    const superAdminRole = savedRoles.find(r => r.name === RoleName.SUPER_ADMIN);
    const superAdminPhone = process.env.SUPER_ADMIN_PHONE || '09120000000';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345';

    let adminUser = await userRepo.findOne({ where: { phone: superAdminPhone }, relations: { roles: true } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
      adminUser = userRepo.create({
        phone: superAdminPhone,
        password: hashedPassword,
        firstName: 'مدیر',
        lastName: 'کل',
        email: process.env.SUPER_ADMIN_EMAIL || 'admin@mobinkhodro.com',
        isVerified: true,
        isActive: true,
        roles: superAdminRole ? [superAdminRole] : [],
      });
      await userRepo.save(adminUser);
      console.log('✅ کاربر Super Admin ساخته شد.');
    }

    // ==========================================
    // ۳. تنظیمات پیش‌فرض
    // ==========================================
    console.log('🔹 در حال بررسی/ساخت تنظیمات پیش‌فرض...');
    const defaultSettings = [
      { key: 'site_name', value: 'مبین خودرو', type: SettingType.STRING, group: 'general', displayName: 'نام سایت', isPublic: true },
      { key: 'site_logo', value: 'https://via.placeholder.com/150x50?text=Mobin+Khodro', type: SettingType.IMAGE, group: 'general', displayName: 'لینک لوگوی سایت', isPublic: true },
      { key: 'contact_phone', value: '021-12345678', type: SettingType.STRING, group: 'contact', displayName: 'شماره تماس پشتیبانی', isPublic: true },
      { key: 'seo_description', value: 'فروش اقساطی انواع خودروهای داخلی و خارجی با بهترین شرایط', type: SettingType.STRING, group: 'seo', displayName: 'توضیحات متا', isPublic: true },
    ];
    for (const def of defaultSettings) {
      const exists = await settingRepo.findOne({ where: { key: def.key } });
      if (!exists) await settingRepo.save(settingRepo.create(def));
    }
    console.log('✅ تنظیمات پیش‌فرض ثبت شد.');

    // ==========================================
    // ۴. فوتر سایت
    // ==========================================
    console.log('🔹 در حال بررسی/ساخت فوتر...');
    const footerCount = await footerRepo.count();
    if (footerCount === 0) {
      const footerSections = [
        { section: FooterSection.BRAND, title: 'معرفی مبین خودرو', order: 1, content: JSON.stringify({ logoUrl: '/assets/logo.svg', slogan: 'خیابان‌های شهر منتظرن!' }), isActive: true },
        { section: FooterSection.INSTALLMENT_BRANDS, title: 'جدول اقساط برندها', order: 2, content: JSON.stringify({ items: [{ title: 'ایران خودرو', url: '/installment/iran-khodro' }] }), isActive: true },
        { section: FooterSection.COPYRIGHT, title: 'کپی‌رایت', order: 7, content: JSON.stringify({ company: 'مبین خودرو ماندگار', rightsText: 'تمامی حقوق محفوظ است' }), isActive: true },
      ];
      for (const section of footerSections) {
        await footerRepo.save(footerRepo.create(section));
      }
      console.log(`✅ ${footerSections.length} بخش فوتر ثبت شد.`);
    }

    // ==========================================
    // ۵. دسته‌بندی‌ها و برندها
    // ==========================================
    console.log('🔹 در حال بررسی/ساخت دسته‌بندی‌ها و برندها...');
    const productCount = await productRepo.count();
    if (productCount === 0) {
      const domesticProduct = await productRepo.save(productRepo.create({ title: 'خودروهای داخلی', slug: 'domestic', description: 'فروش اقساطی خودروهای داخلی', order: 1, isActive: true }));
      const foreignProduct = await productRepo.save(productRepo.create({ title: 'خودروهای خارجی', slug: 'foreign', description: 'فروش اقساطی خودروهای وارداتی', order: 2, isActive: true }));

      const domesticBrands = [
        { title: 'ایران خودرو', slug: 'iran-khodro', order: 1 },
        { title: 'سایپا', slug: 'saipa', order: 2 },
        { title: 'فونیکس', slug: 'fownix', order: 3 },
        { title: 'کرمان موتور', slug: 'kerman-motor', order: 4 },
        { title: 'لوکسانو', slug: 'luxano', order: 5 },
        { title: 'چری آریزو', slug: 'chery-arizo', order: 6 },
        { title: 'گروه بهمن', slug: 'bahman-group', order: 7 },
        { title: 'لاماری', slug: 'lamari', order: 8 },
        { title: 'تانک', slug: 'tank', order: 9 },
        { title: 'ام وی ام', slug: 'mvm', order: 10 },
      ];
      for (const brand of domesticBrands) await brandRepo.save(brandRepo.create({ ...brand, product: domesticProduct, isActive: true }));

      const foreignBrands = [
        { title: 'کیا', slug: 'kia', order: 1 },
        { title: 'هیوندای', slug: 'hyundai', order: 2 },
        { title: 'بی ام و', slug: 'bmw', order: 3 },
        { title: 'مرسدس بنز', slug: 'mercedes-benz', order: 4 },
        { title: 'رنو', slug: 'renault', order: 5 },
        { title: 'نیسان', slug: 'nissan', order: 6 },
        { title: 'فولکس واگن', slug: 'volkswagen', order: 7 },
        { title: 'تویوتا', slug: 'toyota', order: 8 },
        { title: 'سانگ یانگ', slug: 'ssangyong', order: 9 },
        { title: 'لکسوس', slug: 'lexus', order: 10 },
        { title: 'سوزوکی', slug: 'suzuki', order: 11 },
        { title: 'میتسوبیشی', slug: 'mitsubishi', order: 12 },
      ];
      for (const brand of foreignBrands) await brandRepo.save(brandRepo.create({ ...brand, product: foreignProduct, isActive: true }));

      console.log('✅ دسته‌بندی‌ها و برندها ثبت شد.');
    }

    // ==========================================
    // ۶. منوی پیش‌فرض
    // ==========================================
    console.log('🔹 در حال بررسی/ساخت منوی پیش‌فرض...');
    if (await menuRepo.count() === 0) {
      const homeMenu = await menuRepo.save(menuRepo.create({ title: 'صفحه اصلی', url: '/', order: 1, isActive: true }));
      const productsMenu = await menuRepo.save(menuRepo.create({ title: 'محصولات', url: null, order: 2, isActive: true }));

      const domesticSubmenu = await submenuRepo.save(submenuRepo.create({ title: 'خودروهای داخلی', url: '/vehicles/domestic', order: 1, isActive: true, menu: productsMenu }));
      await megamenuRepo.save(megamenuRepo.create({ title: 'فروش اقساطی ایران خودرو', url: '/vehicles/iran-khodro', order: 1, submenu: domesticSubmenu }));

      const importedSubmenu = await submenuRepo.save(submenuRepo.create({ title: 'خودروهای وارداتی', url: '/vehicles/imported', order: 2, isActive: true, menu: productsMenu }));
      await megamenuRepo.save(megamenuRepo.create({ title: 'فروش اقساطی تویوتا', url: '/vehicles/toyota', order: 1, submenu: importedSubmenu }));

      await menuRepo.save(menuRepo.create({ title: 'درباره ما', url: '/about', order: 5, isActive: true }));
      await menuRepo.save(menuRepo.create({ title: 'تماس با ما', url: '/contact', order: 6, isActive: true }));
      console.log('✅ منوی پیش‌فرض ثبت شد.');
    }

    // ==========================================
    // ۷. خودروها، مدل‌ها و جداول اقساط (با محاسبه خودکار)
    // ==========================================
    console.log('🔹 در حال بررسی/ساخت خودروها، مدل‌ها و جداول اقساط...');
    if (await vehicleRepo.count() === 0) {
      const allVehiclesData = [
        {
          brandSlug: 'iran-khodro',
          vehicle: { title: 'تارا', slug: 'tara', order: 1, isFeatured: true },
          models: [
            {
              title: 'اتوماتیک V4', slug: 'tara-automatic-v4', year: 1405, mileage: 'صفر کیلومتر',
              firstDownPayment: 1487200000, totalPrice: 1500000000, imageUrl: '/assets/models/tara-v4-white.jpg', order: 1, isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 219170000 },
                { durationMonths: 24, monthlyAmount: 120051000 },
                { durationMonths: 36, monthlyAmount: 87920000 },
                { durationMonths: 48, monthlyAmount: 71990000 },
                { durationMonths: 60, monthlyAmount: 62680000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 55130000 },
              ],
            },
            {
              title: 'اتوماتیک توربو', slug: 'tara-automatic-turbo', year: 1405, mileage: 'صفر کیلومتر',
              firstDownPayment: 1619200000, totalPrice: 1650000000, imageUrl: '/assets/models/tara-turbo-black.jpg', order: 2,
              plans: [
                { durationMonths: 12, monthlyAmount: 238640000 },
                { durationMonths: 24, monthlyAmount: 131600000 },
                { durationMonths: 36, monthlyAmount: 95730000 },
                { durationMonths: 48, monthlyAmount: 78380000 },
                { durationMonths: 60, monthlyAmount: 68240000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 60520000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'saipa',
          vehicle: { title: 'شاهین', slug: 'shahin', order: 1, isFeatured: true },
          models: [
            {
              title: 'شاهین G (دستی)', slug: 'shahin-g-manual', year: 1405, mileage: 'صفر کیلومتر',
              firstDownPayment: 420000000, totalPrice: 720000000, imageUrl: '/assets/models/shahin-g-silver.jpg', order: 1, isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 65000000 },
                { durationMonths: 24, monthlyAmount: 35000000 },
                { durationMonths: 36, monthlyAmount: 25000000 },
                { durationMonths: 48, monthlyAmount: 20000000 },
                { durationMonths: 60, monthlyAmount: 17500000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 15500000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'fownix',
          vehicle: { title: 'تیگو ۸ پرو', slug: 'tigo-8-pro', order: 1, isFeatured: true },
          models: [
            {
              title: 'تیگو ۸ پرو مکس', slug: 'tigo-8-pro-max', year: 1405, mileage: 'صفر کیلومتر',
              firstDownPayment: 1500000000, totalPrice: 2500000000, imageUrl: '/assets/models/tigo8-pro-max-red.jpg', order: 1, isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 220000000 },
                { durationMonths: 24, monthlyAmount: 120000000 },
                { durationMonths: 36, monthlyAmount: 87000000 },
                { durationMonths: 48, monthlyAmount: 71000000 },
                { durationMonths: 60, monthlyAmount: 62000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 55000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'kia',
          vehicle: { title: 'کیا سراتو', slug: 'kia-cerato', order: 1, isFeatured: true },
          models: [
            {
              title: 'سراتو ۲۰۲۴ آپشنال', slug: 'cerato-2024-optional', year: 2024, mileage: 'صفر کیلومتر',
              firstDownPayment: 2500000000, totalPrice: 4500000000, imageUrl: '/assets/models/cerato-2024-white.jpg', order: 1, isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 400000000 },
                { durationMonths: 24, monthlyAmount: 220000000 },
                { durationMonths: 36, monthlyAmount: 160000000 },
                { durationMonths: 48, monthlyAmount: 130000000 },
                { durationMonths: 60, monthlyAmount: 115000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 100000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'hyundai',
          vehicle: { title: 'هیوندای توسان', slug: 'hyundai-tucson', order: 1, isFeatured: true },
          models: [
            {
              title: 'توسان ۲۰۲۴ فول', slug: 'tucson-2024-full', year: 2024, mileage: 'صفر کیلومتر',
              firstDownPayment: 3500000000, totalPrice: 6000000000, imageUrl: '/assets/models/tucson-2024-blue.jpg', order: 1, isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 530000000 },
                { durationMonths: 24, monthlyAmount: 290000000 },
                { durationMonths: 36, monthlyAmount: 210000000 },
                { durationMonths: 48, monthlyAmount: 172000000 },
                { durationMonths: 60, monthlyAmount: 150000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 132000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'toyota',
          vehicle: { title: 'تویوتا کمری', slug: 'toyota-camry', order: 1, isFeatured: true },
          models: [
            {
              title: 'کمری هیبرید ۲۰۲۴', slug: 'camry-hybrid-2024', year: 2024, mileage: 'صفر کیلومتر',
              firstDownPayment: 4000000000, totalPrice: 7000000000, imageUrl: '/assets/models/camry-hybrid-pearl.jpg', order: 1, isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 620000000 },
                { durationMonths: 24, monthlyAmount: 338000000 },
                { durationMonths: 36, monthlyAmount: 246000000 },
                { durationMonths: 48, monthlyAmount: 200000000 },
                { durationMonths: 60, monthlyAmount: 175000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 154000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'suzuki',
          vehicle: { title: 'سوزوکی گرند ویتارا', slug: 'suzuki-grand-vitara', order: 1 },
          models: [
            {
              title: 'گرند ویتارا ۲۰۲۴ هیبرید', slug: 'grand-vitara-2024-hybrid', year: 2024, mileage: 'صفر کیلومتر',
              firstDownPayment: 2800000000, totalPrice: 5000000000, imageUrl: '/assets/models/grand-vitara-2024-silver.jpg', order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 445000000 },
                { durationMonths: 24, monthlyAmount: 243000000 },
                { durationMonths: 36, monthlyAmount: 176000000 },
                { durationMonths: 48, monthlyAmount: 144000000 },
                { durationMonths: 60, monthlyAmount: 125000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 110000000 },
              ],
            },
          ],
        },
      ];

      let totalVehicles = 0, totalModels = 0, totalPlans = 0;

      for (const data of allVehiclesData) {
        const brand = await brandRepo.findOne({ where: { slug: data.brandSlug } });
        if (!brand) continue;

        const vehicle = await vehicleRepo.save(vehicleRepo.create({ ...data.vehicle, isActive: true, brand }));
        totalVehicles++;

        for (const modelData of data.models) {
          const { plans, ...modelFields } = modelData;
          const model = await modelRepo.save(modelRepo.create({ ...modelFields, isActive: true, vehicle }));
          totalModels++;


        const savedPlans = await planRepo.save(
          plans.map((p) => {
            const secondDownPaymentMonth = p.durationMonths <= 36 ? 2 : 7;
            const totalInstallments = p.monthlyAmount * p.durationMonths;

            return planRepo.create({
              durationMonths: p.durationMonths,
              monthlyAmount: p.monthlyAmount,
              totalInstallments: totalInstallments,
              firstDownPayment: modelData.firstDownPayment, 
              totalPrice: modelData.totalPrice, 
              
              secondDownPaymentMonth: secondDownPaymentMonth,
              isHighlighted: p.isHighlighted || false,
              order: p.durationMonths,
              isActive: true,
              model,
            });
          })
        );
        totalPlans += savedPlans.length;
        }
      }
      console.log(`✅ ثبت شد: ${totalVehicles} خودرو، ${totalModels} مدل، ${totalPlans} ردیف اقساط.`);
    }

    // ==========================================
    // ۸. ساخت کلید API برای کارفرما
    // ==========================================
    console.log('🔹 در حال بررسی/ساخت کلید API برای کارفرما...');
    const existingClient = await apiClientRepo.findOne({ where: { name: 'Mobinkhodro_Employer' } });
    if (!existingClient) {
      const apiSecret = process.env.API_KEY_SECRET || 'fallback-secret';
      const rawApiKey = randomBytes(32).toString('hex');
      const hash = createHmac('sha256', apiSecret).update(rawApiKey).digest('hex');

      await apiClientRepo.save(apiClientRepo.create({
        name: 'Mobinkhodro_Employer',
        apiKeyHash: hash,
        isActive: true,
      }));

      console.log('===========================================================');
      console.log('🔑 کلید اختصاصی کارفرما (Bulk Update API):');
      console.log(`\n${rawApiKey}\n`);
      console.log('⚠️ این کلید فقط یک بار نمایش داده می‌شود. آن را در جای امنی ذخیره کنید.');
      console.log('===========================================================');
    }

    console.log('🎉 فرآیند Seed با موفقیت و بدون خطا تکمیل شد!');
  } catch (error) {
    console.error('❌ خطا در فرآیند Seed:', error);
    throw error;
  }
}

// اجرای مستقل
if (require.main === module) {
  (async () => {
    const { config } = require('dotenv');
    config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
    const { default: AppDataSource } = require('../data-source');
    await AppDataSource.initialize();
    console.log('Connected to database.');
    await runSeed(AppDataSource);
    await AppDataSource.destroy();
    process.exit(0);
  })();
}