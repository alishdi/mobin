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
import { Category } from '../entities/category/category.entity';
import { Brand } from '../entities/category/brand.entity';
import { InstallmentPlan } from '../entities/installment/installment-plan.entity';
import { Vehicle } from '../entities/vehicles/vehicle.entity';
import { VehicleModel } from '../entities/vehicles/vehicle-model.entity';

export async function runSeed(dataSource: DataSource) {
    console.log('🌱 شروع فرآیند Seed دیتابیس...');

    const roleRepo = dataSource.getRepository(Role);
    const permissionRepo = dataSource.getRepository(Permission);
    const userRepo = dataSource.getRepository(User);
    const settingRepo = dataSource.getRepository(Setting);
    const menuRepo = dataSource.getRepository(Menu);
    const submenuRepo = dataSource.getRepository(Submenu);
    const megamenuRepo = dataSource.getRepository(Megamenu);
    const footerRepo = dataSource.getRepository(Footer)
    const categoryRepo = dataSource.getRepository(Category)
    const brandRepo = dataSource.getRepository(Brand)
    const planRepo=dataSource.getRepository(InstallmentPlan)
    const vehicleRepo=dataSource.getRepository(Vehicle)
    const modelRepo=dataSource.getRepository(VehicleModel)

    try {

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
                    [
                        PermissionResource.MENUS,
                        PermissionResource.SUBMENUS,
                        PermissionResource.MEGAMENUS,
                        PermissionResource.SLIDERS,
                        PermissionResource.FOOTERS,
                        PermissionResource.SETTINGS,
                    ].includes(p.resource),
                ),
            },
            {
                name: RoleName.SALES_CONSULTANT,
                displayName: 'مشاور فروش',
                description: 'ثبت خودرو و مدیریت قراردادها',
                perms: permissions.filter(p =>
                    [PermissionResource.VEHICLES, PermissionResource.CONTRACTS].includes(p.resource),
                ),
            },
            {
                name: RoleName.ACCOUNTANT,
                displayName: 'حسابدار',
                description: 'مشاهده پرداخت‌ها و گزارشات مالی',
                perms: permissions.filter(p =>
                    [PermissionResource.PAYMENTS, PermissionResource.REPORTS].includes(p.resource),
                ),
            },
            {
                name: RoleName.USER,
                displayName: 'کاربر عادی',
                description: 'دسترسی محدود به پنل کاربری',
                perms: permissions.filter(
                    p => p.resource === PermissionResource.USERS && p.action === PermissionAction.READ,
                ),
            },
        ];

        const savedRoles: Role[] = [];
        for (const def of roleDefs) {
            let role = await roleRepo.findOne({ where: { name: def.name }, relations: { permissions: true } });
            if (!role) {
                role = roleRepo.create({
                    name: def.name,
                    displayName: def.displayName,
                    description: def.description,
                    permissions: def.perms,
                });
                role = await roleRepo.save(role);
            } else {
                role.permissions = def.perms;
                await roleRepo.save(role);
            }
            savedRoles.push(role);
        }
        console.log(`✅ ${savedRoles.length} نقش آماده است.`);


        console.log('🔹 در حال بررسی/ساخت کاربر Super Admin...');
        const superAdminRole = savedRoles.find(r => r.name === RoleName.SUPER_ADMIN);

        const superAdminPhone = process.env.SUPER_ADMIN_PHONE || '09120000000';
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345';
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@mobinkhodro.com';
        const superAdminFirstName = process.env.SUPER_ADMIN_FIRST_NAME || 'مدیر';
        const superAdminLastName = process.env.SUPER_ADMIN_LAST_NAME || 'کل';

        let adminUser = await userRepo.findOne({
            where: { phone: superAdminPhone },
            relations: { roles: true },
        });

        if (!adminUser) {
            const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
            adminUser = userRepo.create({
                phone: superAdminPhone,
                password: hashedPassword,
                firstName: superAdminFirstName,
                lastName: superAdminLastName,
                email: superAdminEmail,
                isVerified: true,
                isActive: true,
                roles: superAdminRole ? [superAdminRole] : [],
            });
            await userRepo.save(adminUser);
            console.log('✅ کاربر Super Admin ساخته شد:');
            console.log(`   📱 شماره: ${superAdminPhone}`);
            console.log(`   🔑 رمز عبور: ${superAdminPassword}`);
            console.log(`   📧 ایمیل: ${superAdminEmail}`);
        } else {
            console.log(`ℹ️  کاربر Super Admin با شماره ${superAdminPhone} از قبل وجود دارد.`);
        }

        // ==========================================
        // ۴. تنظیمات پیش‌فرض (شامل لوگو)
        // ==========================================
        console.log('🔹 در حال بررسی/ساخت تنظیمات پیش‌فرض...');
        const defaultSettings = [
            {
                key: 'site_name',
                value: 'مبین خودرو',
                type: SettingType.STRING,
                group: 'general',
                displayName: 'نام سایت',
                isPublic: true,
            },
            {
                key: 'site_logo',
                value: 'https://via.placeholder.com/150x50?text=Mobin+Khodro',
                type: SettingType.IMAGE,
                group: 'general',
                displayName: 'لینک لوگوی سایت',
                isPublic: true,
            },
            {
                key: 'contact_phone',
                value: '021-12345678',
                type: SettingType.STRING,
                group: 'contact',
                displayName: 'شماره تماس پشتیبانی',
                isPublic: true,
            },
            {
                key: 'contact_address',
                value: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
                type: SettingType.STRING,
                group: 'contact',
                displayName: 'آدرس دفتر مرکزی',
                isPublic: true,
            },
            {
                key: 'contact_email',
                value: 'info@mobinkhodro.com',
                type: SettingType.STRING,
                group: 'contact',
                displayName: 'ایمیل پشتیبانی',
                isPublic: true,
            },
            {
                key: 'seo_description',
                value: 'فروش اقساطی انواع خودروهای داخلی و خارجی با بهترین شرایط',
                type: SettingType.STRING,
                group: 'seo',
                displayName: 'توضیحات متا (SEO)',
                isPublic: true,
            },
            {
                key: 'seo_keywords',
                value: 'فروش اقساطی خودرو, مبین خودرو, خرید خودرو, اقساط خودرو',
                type: SettingType.STRING,
                group: 'seo',
                displayName: 'کلمات کلیدی (SEO)',
                isPublic: true,
            },
        ];

        for (const def of defaultSettings) {
            const exists = await settingRepo.findOne({ where: { key: def.key } });
            if (!exists) {
                await settingRepo.save(settingRepo.create(def));
            }
        }
        console.log('✅ تنظیمات پیش‌فرض ثبت شد.');


        // ==========================================
        // ۶. فوتر سایت (مطابق اسکرین‌شات مبین خودرو)
        // ==========================================
        console.log('🔹 در حال بررسی/ساخت فوتر...');
        const footerCount = await footerRepo.count();

        if (footerCount === 0) {
            const footerSections: Array<{
                section: FooterSection;
                title: string;
                order: number;
                content: string;
                isActive: boolean;
            }> = [
                    // بخش ۱: معرفی + لوگو + تگ‌ها
                    {
                        section: FooterSection.BRAND,
                        title: 'معرفی مبین خودرو',
                        order: 1,
                        content: JSON.stringify({
                            logoUrl: '/assets/logo.svg',
                            slogan: 'خیابان‌های شهر منتظرن!',
                            description:
                                'تجربه خرید اقساطی خودرو با شرایط شفاف، تحویل یکسانه، بدون ضمانت و اقساط تا ۷۲ ماه.',
                            features: ['تحویل یکسانه', 'بدون ضمانت', 'اقساط ۷۲ ماهه'],
                        }),
                        isActive: true,
                    },

                    // بخش ۲: جدول اقساط برندها
                    {
                        section: FooterSection.INSTALLMENT_BRANDS,
                        title: 'جدول اقساط برندها',
                        order: 2,
                        content: JSON.stringify({
                            items: [
                                { title: 'فروش اقساطی ایران خودرو', url: '/installment/iran-khodro' },
                                { title: 'فروش اقساطی سایپا', url: '/installment/saipa' },
                                { title: 'فروش اقساطی فونیکس تیگو', url: '/installment/fownix-tigo' },
                                { title: 'فروش اقساطی کرمان موتور', url: '/installment/kerman-motor' },
                                { title: 'فروش اقساطی گروه بهمن', url: '/installment/bahman-group' },
                                { title: 'فروش اقساطی آریزو', url: '/installment/arizo' },
                                { title: 'فروش اقساطی ام وی ام', url: '/installment/mvm' },
                            ],
                            viewMore: { text: 'مشاهده بیشتر', url: '/installment/brands' },
                        }),
                        isActive: true,
                    },

                    // بخش ۳: خودروها
                    {
                        section: FooterSection.VEHICLES,
                        title: 'خودروها',
                        order: 3,
                        content: JSON.stringify({
                            items: [
                                { title: 'فروش اقساطی دنا', url: '/vehicles/dena' },
                                { title: 'فروش اقساطی دنا پلاس', url: '/vehicles/dena-plus' },
                                { title: 'فروش اقساطی دنا پلاس توربو', url: '/vehicles/dena-plus-turbo' },
                                { title: 'فروش اقساطی تارا', url: '/vehicles/tara' },
                                { title: 'فروش اقساطی تاکسی ۳۰۰', url: '/vehicles/taxi-300' },
                                { title: 'فروش اقساطی ۲۰۷ اتومات', url: '/vehicles/207-automatic' },
                                { title: 'فروش اقساطی ۲۰۷ دنده', url: '/vehicles/207-manual' },
                            ],
                            viewMore: { text: 'مشاهده بیشتر', url: '/vehicles' },
                        }),
                        isActive: true,
                    },

                    // بخش ۴: شعب مبین خودرو
                    {
                        section: FooterSection.BRANCHES,
                        title: 'شعب مبین خودرو',
                        order: 4,
                        content: JSON.stringify({
                            branches: [
                                {
                                    name: 'شعبه قیطریه',
                                    address:
                                        'تهران، ابتدای بلوار قیطریه (جنوب به شمال)، نبش خیابان توابعی، پلاک ۱۵',
                                    phone: '021-78118',
                                    icon: 'location-pin',
                                },
                                {
                                    name: 'شعبه یونک',
                                    address:
                                        'تهران، بزرگراه ستاری شمال، بلوار میرزابابایی، بعد از ایران زمین شمالی، پلاک ۱۶۸/۱',
                                    phone: '021-48280',
                                    icon: 'location-pin',
                                },
                                {
                                    name: 'شعبه البرز',
                                    address: 'استان البرز، عظیمیه، بلوار ۴۵ متری کاج، پلاک ۱۹',
                                    phone: '026-33113',
                                    icon: 'location-pin',
                                },
                            ],
                        }),
                        isActive: true,
                    },

                    // بخش ۵: CTA مشاوره
                    {
                        section: FooterSection.CTA,
                        title: 'برای خرید اقساطی خودرو آماده‌اید؟',
                        order: 5,
                        content: JSON.stringify({
                            title: 'برای خرید اقساطی خودرو آماده‌اید؟',
                            description:
                                'فرم درخواست مشاوره را تکمیل کنید تا کارشناسان در ساعات اداری با شما تماس بگیرند.',
                            helpText:
                                'فرم درخواست مشاوره را تکمیل کنید تا کارشناسان در ساعات اداری با شما تماس بگیرند.',
                            button: {
                                text: 'درخواست مشاوره خرید',
                                url: '/consultation',
                            },
                        }),
                        isActive: true,
                    },

                    // بخش ۶: شبکه‌های اجتماعی
                    {
                        section: FooterSection.SOCIAL,
                        title: 'شبکه‌های اجتماعی',
                        order: 6,
                        content: JSON.stringify({
                            links: [
                                { platform: 'email', url: 'mailto:info@mobinkhodro.com', icon: 'mail' },
                                { platform: 'instagram', url: 'https://instagram.com/mobinkhodro', icon: 'instagram' },
                            ],
                        }),
                        isActive: true,
                    },

                    // بخش ۷: کپی‌رایت
                    {
                        section: FooterSection.COPYRIGHT,
                        title: 'کپی‌رایت',
                        order: 7,
                        content: JSON.stringify({
                            company: 'مبین خودرو ماندگار',
                            registrationNumber: '۵۳۷۶۷۱',
                            rightsText: 'تمامی حقوبرای مبین خودرو ماندگار محفوظ است',
                            developer: {
                                name: 'ali shahidi',
                                url: 'https://alishdi.ir',
                            },
                            brandName: 'MOBIN KHODRO',
                        }),
                        isActive: true,
                    },
                ];

            for (const section of footerSections) {
                await footerRepo.save(footerRepo.create(section));
            }

            console.log(`✅ ${footerSections.length} بخش فوتر ثبت شد.`);
        } else {
            console.log('ℹ️  فوتر از قبل وجود دارد.');
        }


        // ==========================================
        // ۷. دسته‌بندی‌ها و برندهای خودرو
        // ==========================================
        console.log('🔹 در حال بررسی/ساخت دسته‌بندی‌ها و برندها...');
        const categoryCount = await categoryRepo.count();

        if (categoryCount === 0) {
            // ---- دسته‌بندی ۱: خودروهای داخلی ----
            const domesticCategory = await categoryRepo.save(
                categoryRepo.create({
                    title: 'خودروهای داخلی',
                    slug: 'domestic',
                    description: 'فروش اقساطی خودروهای داخلی با بهترین شرایط',
                    imageUrl: '/assets/categories/domestic.jpg',
                    order: 1,
                    isActive: true,
                }),
            );

            // ---- دسته‌بندی ۲: خودروهای خارجی ----
            const foreignCategory = await categoryRepo.save(
                categoryRepo.create({
                    title: 'خودروهای خارجی',
                    slug: 'foreign',
                    description: 'فروش اقساطی خودروهای وارداتی و مونتاژی',
                    imageUrl: '/assets/categories/foreign.jpg',
                    order: 2,
                    isActive: true,
                }),
            );

            // ---- برندهای داخلی ----
            const domesticBrands = [
                { title: 'ایران خودرو', slug: 'iran-khodro', logoUrl: '/assets/brands/iran-khodro.svg', order: 1 },
                { title: 'سایپا', slug: 'saipa', logoUrl: '/assets/brands/saipa.svg', order: 2 },
                { title: 'فونیکس', slug: 'fownix', logoUrl: '/assets/brands/fownix.svg', order: 3 },
                { title: 'کرمان موتور', slug: 'kerman-motor', logoUrl: '/assets/brands/kerman-motor.svg', order: 4 },
                { title: 'لوکسانو', slug: 'luxano', logoUrl: '/assets/brands/luxano.svg', order: 5 },
                { title: 'چری آریزو', slug: 'chery-arizo', logoUrl: '/assets/brands/chery.svg', order: 6 },
                { title: 'گروه بهمن', slug: 'bahman-group', logoUrl: '/assets/brands/bahman.svg', order: 7 },
                { title: 'لاماری', slug: 'lamari', logoUrl: '/assets/brands/lamari.svg', order: 8 },
                { title: 'تانک', slug: 'tank', logoUrl: '/assets/brands/tank.svg', order: 9 },
                { title: 'ام وی ام', slug: 'mvm', logoUrl: '/assets/brands/mvm.svg', order: 10 },
            ];

            for (const brand of domesticBrands) {
                await brandRepo.save(
                    brandRepo.create({
                        ...brand,
                        category: domesticCategory, // ✅ پاس دادن آبجکت
                        isActive: true,
                    }),
                );
            }

            // ---- برندهای خارجی ----
            const foreignBrands = [
                { title: 'کیا', slug: 'kia', logoUrl: '/assets/brands/kia.svg', order: 1 },
                { title: 'هیوندای', slug: 'hyundai', logoUrl: '/assets/brands/hyundai.svg', order: 2 },
                { title: 'بی ام و', slug: 'bmw', logoUrl: '/assets/brands/bmw.svg', order: 3 },
                { title: 'مرسدس بنز', slug: 'mercedes-benz', logoUrl: '/assets/brands/mercedes.svg', order: 4 },
                { title: 'رنو', slug: 'renault', logoUrl: '/assets/brands/renault.svg', order: 5 },
                { title: 'نیسان', slug: 'nissan', logoUrl: '/assets/brands/nissan.svg', order: 6 },
                { title: 'فولکس واگن', slug: 'volkswagen', logoUrl: '/assets/brands/volkswagen.svg', order: 7 },
                { title: 'تویوتا', slug: 'toyota', logoUrl: '/assets/brands/toyota.svg', order: 8 },
                { title: 'سانگ یانگ', slug: 'ssangyong', logoUrl: '/assets/brands/ssangyong.svg', order: 9 },
                { title: 'لکسوس', slug: 'lexus', logoUrl: '/assets/brands/lexus.svg', order: 10 },
                { title: 'سوزوکی', slug: 'suzuki', logoUrl: '/assets/brands/suzuki.svg', order: 11 },
                { title: 'میتسوبیشی', slug: 'mitsubishi', logoUrl: '/assets/brands/mitsubishi.svg', order: 12 },
            ];

            for (const brand of foreignBrands) {
                await brandRepo.save(
                    brandRepo.create({
                        ...brand,
                        category: foreignCategory, // ✅ پاس دادن آبجکت
                        isActive: true,
                    }),
                );
            }

            console.log('✅ دسته‌بندی‌ها و برندها ثبت شد:');
            console.log('   📂 ۲ دسته‌بندی (داخلی / خارجی)');
            console.log('   🚗 ۱۰ برند داخلی');
            console.log('   🌍 ۱۲ برند خارجی');
        } else {
            console.log('ℹ️  دسته‌بندی‌ها از قبل وجود دارند.');
        }
        // ==========================================
        // ۵. منوی پیش‌فرض (ساختار چندسطحی کامل)
        // ==========================================
        console.log('🔹 در حال بررسی/ساخت منوی پیش‌فرض...');
        const menuCount = await menuRepo.count();

        if (menuCount === 0) {
            // ---- منوی اصلی ۱: صفحه اصلی ----
            const homeMenu = menuRepo.create({
                title: 'صفحه اصلی',
                url: '/',
                order: 1,
                isActive: true,
            });
            await menuRepo.save(homeMenu);

            // ---- منوی اصلی ۲: محصولات (مگا منو) ----
            const productsMenu = menuRepo.create({
                title: 'محصولات',
                url: null,
                order: 2,
                isActive: true,
            });
            const savedProductsMenu = await menuRepo.save(productsMenu);

            // ✅ ساب‌منو: خودروهای داخلی (استفاده از آبجکت menu به جای menuId)
            const domesticSubmenu = submenuRepo.create({
                title: 'خودروهای داخلی',
                url: '/vehicles/domestic',
                order: 1,
                isActive: true,
                menu: savedProductsMenu, // ← تغییر حیاتی: پاس دادن آبجکت
            });
            const savedDomesticSubmenu = await submenuRepo.save(domesticSubmenu);

            // ✅ مگا منوهای زیر خودروهای داخلی (استفاده از آبجکت submenu)
            const domesticBrands = [
                { title: 'فروش اقساطی ایران خودرو', url: '/vehicles/iran-khodro', order: 1 },
                { title: 'فروش اقساطی سایپا', url: '/vehicles/saipa', order: 2 },
                { title: 'فروش اقساطی فونیکس تیگو', url: '/vehicles/fox-tigo', order: 3 },
                { title: 'فروش اقساطی لوکسانو', url: '/vehicles/luxano', order: 4 },
                { title: 'فروش اقساطی لاماری', url: '/vehicles/lamari', order: 5 },
            ];

            for (const brand of domesticBrands) {
                await megamenuRepo.save(
                    megamenuRepo.create({
                        ...brand,
                        submenu: savedDomesticSubmenu, // ← تغییر حیاتی: پاس دادن آبجکت
                    }),
                );
            }

            // ✅ ساب‌منو: خودروهای وارداتی
            const importedSubmenu = submenuRepo.create({
                title: 'خودروهای وارداتی',
                url: '/vehicles/imported',
                order: 2,
                isActive: true,
                menu: savedProductsMenu, // ← تغییر حیاتی: پاس دادن آبجکت
            });
            const savedImportedSubmenu = await submenuRepo.save(importedSubmenu);

            // ✅ مگا منوهای زیر خودروهای وارداتی
            const importedBrands = [
                { title: 'فروش اقساطی تویوتا', url: '/vehicles/toyota', order: 1 },
                { title: 'فروش اقساطی هیوندای', url: '/vehicles/hyundai', order: 2 },
                { title: 'فروش اقساطی کیا', url: '/vehicles/kia', order: 3 },
                { title: 'فروش اقساطی ام وی ام', url: '/vehicles/mvm', order: 4 },
            ];

            for (const brand of importedBrands) {
                await megamenuRepo.save(
                    megamenuRepo.create({
                        ...brand,
                        submenu: savedImportedSubmenu, // ← تغییر حیاتی: پاس دادن آبجکت
                    }),
                );
            }

            // ---- منوهای اصلی دیگر ----
            const otherMenus = [
                { title: 'خدمات', url: '/services', order: 3 },
                { title: 'مقالات', url: '/articles', order: 4 },
                { title: 'درباره ما', url: '/about', order: 5 },
                { title: 'تماس با ما', url: '/contact', order: 6 },
            ];

            for (const m of otherMenus) {
                await menuRepo.save(menuRepo.create({ ...m, isActive: true }));
            }

            console.log('✅ منوی پیش‌فرض با ساختار چندسطحی ثبت شد:');
            console.log('   📁 ۶ منوی اصلی');
            console.log('   📂 ۲ ساب‌منو (خودروهای داخلی/وارداتی)');
            console.log('   📄 ۹ مگا منو (برندهای خودرو)');
        } else {
            console.log('ℹ️  منو از قبل وجود دارد.');
        }

        console.log('🎉 فرآیند Seed با موفقیت و بدون خطا تکمیل شد!');
    } catch (error) {
        console.error('❌ خطا در فرآیند Seed:', error);
        throw error;
    }

    // ==========================================
    // ۸. خودروها، مدل‌ها و جداول اقساط (برای هر برند)
    // ==========================================
    console.log('🔹 در حال بررسی/ساخت خودروها، مدل‌ها و جداول اقساط...');
    const vehicleCount = await vehicleRepo.count();

    if (vehicleCount === 0) {
      // ========================================
      // خودروهای داخلی
      // ========================================
      const domesticVehiclesData = [
        {
          brandSlug: 'iran-khodro',
          vehicle: { title: 'تارا', slug: 'tara', order: 1, isFeatured: true },
          models: [
            {
              title: 'اتوماتیک V4',
              slug: 'tara-automatic-v4',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 1487200000,
              secondDownPayment2Months: 2139400000,
              secondDownPayment7Months: 2139400000,
              totalPrice: 1500000000,
              imageUrl: '/assets/models/tara-v4-white.jpg',
              order: 1,
              isFeatured: true,
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
              title: 'اتوماتیک توربو',
              slug: 'tara-automatic-turbo',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 1619200000,
              secondDownPayment2Months: 2139400000,
              secondDownPayment7Months: 2139400000,
              totalPrice: 1650000000,
              imageUrl: '/assets/models/tara-turbo-black.jpg',
              order: 2,
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
              title: 'شاهین G (دستی)',
              slug: 'shahin-g-manual',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 420000000,
              secondDownPayment2Months: 600000000,
              secondDownPayment7Months: 600000000,
              totalPrice: 720000000,
              imageUrl: '/assets/models/shahin-g-silver.jpg',
              order: 1,
              isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 65000000 },
                { durationMonths: 24, monthlyAmount: 35000000 },
                { durationMonths: 36, monthlyAmount: 25000000 },
                { durationMonths: 48, monthlyAmount: 20000000 },
                { durationMonths: 60, monthlyAmount: 17500000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 15500000 },
              ],
            },
            {
              title: 'شاهین اتوماتیک',
              slug: 'shahin-automatic',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 520000000,
              secondDownPayment2Months: 720000000,
              secondDownPayment7Months: 720000000,
              totalPrice: 820000000,
              imageUrl: '/assets/models/shahin-auto-white.jpg',
              order: 2,
              plans: [
                { durationMonths: 12, monthlyAmount: 75000000 },
                { durationMonths: 24, monthlyAmount: 40000000 },
                { durationMonths: 36, monthlyAmount: 29000000 },
                { durationMonths: 48, monthlyAmount: 23000000 },
                { durationMonths: 60, monthlyAmount: 20000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 17500000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'fownix',
          vehicle: { title: 'تیگو ۸ پرو', slug: 'tigo-8-pro', order: 1, isFeatured: true },
          models: [
            {
              title: 'تیگو ۸ پرو مکس',
              slug: 'tigo-8-pro-max',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 1500000000,
              secondDownPayment2Months: 2000000000,
              secondDownPayment7Months: 2000000000,
              totalPrice: 2500000000,
              imageUrl: '/assets/models/tigo8-pro-max-red.jpg',
              order: 1,
              isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 220000000 },
                { durationMonths: 24, monthlyAmount: 120000000 },
                { durationMonths: 36, monthlyAmount: 87000000 },
                { durationMonths: 48, monthlyAmount: 71000000 },
                { durationMonths: 60, monthlyAmount: 62000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 55000000 },
              ],
            },
            {
              title: 'تیگو ۷ پرو',
              slug: 'tigo-7-pro',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 1200000000,
              secondDownPayment2Months: 1600000000,
              secondDownPayment7Months: 1600000000,
              totalPrice: 2000000000,
              imageUrl: '/assets/models/tigo7-pro-blue.jpg',
              order: 2,
              plans: [
                { durationMonths: 12, monthlyAmount: 175000000 },
                { durationMonths: 24, monthlyAmount: 96000000 },
                { durationMonths: 36, monthlyAmount: 70000000 },
                { durationMonths: 48, monthlyAmount: 57000000 },
                { durationMonths: 60, monthlyAmount: 50000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 44000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'kerman-motor',
          vehicle: { title: 'کیا سراتو', slug: 'kia-cerato-kerman', order: 1, isFeatured: true },
          models: [
            {
              title: 'سراتو ۲۰۰۰ آپشنال',
              slug: 'cerato-2000-optional',
              year: 1403,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 1100000000,
              secondDownPayment2Months: 1500000000,
              secondDownPayment7Months: 1500000000,
              totalPrice: 1800000000,
              imageUrl: '/assets/models/cerato-2000-white.jpg',
              order: 1,
              isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 160000000 },
                { durationMonths: 24, monthlyAmount: 87000000 },
                { durationMonths: 36, monthlyAmount: 63000000 },
                { durationMonths: 48, monthlyAmount: 51000000 },
                { durationMonths: 60, monthlyAmount: 45000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 39000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'luxano',
          vehicle: { title: 'لوکسانو X33 کراس', slug: 'luxano-x33-cross', order: 1 },
          models: [
            {
              title: 'X33 کراس اتوماتیک',
              slug: 'x33-cross-automatic',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 900000000,
              secondDownPayment2Months: 1200000000,
              secondDownPayment7Months: 1200000000,
              totalPrice: 1500000000,
              imageUrl: '/assets/models/x33-cross-gray.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 130000000 },
                { durationMonths: 24, monthlyAmount: 72000000 },
                { durationMonths: 36, monthlyAmount: 52000000 },
                { durationMonths: 48, monthlyAmount: 42000000 },
                { durationMonths: 60, monthlyAmount: 37000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 32000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'chery-arizo',
          vehicle: { title: 'آریزو ۶ پرو', slug: 'arizo-6-pro', order: 1 },
          models: [
            {
              title: 'آریزو ۶ پرو IE',
              slug: 'arizo-6-pro-ie',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 1000000000,
              secondDownPayment2Months: 1400000000,
              secondDownPayment7Months: 1400000000,
              totalPrice: 1700000000,
              imageUrl: '/assets/models/arizo6-pro-black.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 150000000 },
                { durationMonths: 24, monthlyAmount: 82000000 },
                { durationMonths: 36, monthlyAmount: 59000000 },
                { durationMonths: 48, monthlyAmount: 48000000 },
                { durationMonths: 60, monthlyAmount: 42000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 37000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'bahman-group',
          vehicle: { title: 'دیگنیتی پرستیژ', slug: 'dignity-prestige', order: 1 },
          models: [
            {
              title: 'دیگنیتی پرستیژ اتوماتیک',
              slug: 'dignity-prestige-automatic',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 1300000000,
              secondDownPayment2Months: 1800000000,
              secondDownPayment7Months: 1800000000,
              totalPrice: 2200000000,
              imageUrl: '/assets/models/dignity-prestige-gold.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 195000000 },
                { durationMonths: 24, monthlyAmount: 106000000 },
                { durationMonths: 36, monthlyAmount: 77000000 },
                { durationMonths: 48, monthlyAmount: 63000000 },
                { durationMonths: 60, monthlyAmount: 55000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 48000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'lamari',
          vehicle: { title: 'لاماری ایما', slug: 'lamari-eama', order: 1, isFeatured: true },
          models: [
            {
              title: 'لاماری ایما HEV (هیبرید)',
              slug: 'lamari-eama-hev',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 1400000000,
              secondDownPayment2Months: 1900000000,
              secondDownPayment7Months: 1900000000,
              totalPrice: 2300000000,
              imageUrl: '/assets/models/lamari-eama-orange.jpg',
              order: 1,
              isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 205000000 },
                { durationMonths: 24, monthlyAmount: 112000000 },
                { durationMonths: 36, monthlyAmount: 81000000 },
                { durationMonths: 48, monthlyAmount: 66000000 },
                { durationMonths: 60, monthlyAmount: 58000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 50000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'tank',
          vehicle: { title: 'تانک ۳۰۰', slug: 'tank-300', order: 1 },
          models: [
            {
              title: 'تانک ۳۰۰ هیبرید',
              slug: 'tank-300-hybrid',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 2000000000,
              secondDownPayment2Months: 2700000000,
              secondDownPayment7Months: 2700000000,
              totalPrice: 3500000000,
              imageUrl: '/assets/models/tank-300-green.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 310000000 },
                { durationMonths: 24, monthlyAmount: 170000000 },
                { durationMonths: 36, monthlyAmount: 123000000 },
                { durationMonths: 48, monthlyAmount: 100000000 },
                { durationMonths: 60, monthlyAmount: 88000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 77000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'mvm',
          vehicle: { title: 'ام وی ام X55 پرو', slug: 'mvm-x55-pro', order: 1 },
          models: [
            {
              title: 'X55 پرو IE',
              slug: 'x55-pro-ie',
              year: 1405,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 700000000,
              secondDownPayment2Months: 950000000,
              secondDownPayment7Months: 950000000,
              totalPrice: 1200000000,
              imageUrl: '/assets/models/x55-pro-red.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 105000000 },
                { durationMonths: 24, monthlyAmount: 58000000 },
                { durationMonths: 36, monthlyAmount: 42000000 },
                { durationMonths: 48, monthlyAmount: 34000000 },
                { durationMonths: 60, monthlyAmount: 30000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 26000000 },
              ],
            },
          ],
        },
      ];

      // ========================================
      // خودروهای خارجی
      // ========================================
      const foreignVehiclesData = [
        {
          brandSlug: 'kia',
          vehicle: { title: 'کیا سراتو', slug: 'kia-cerato', order: 1, isFeatured: true },
          models: [
            {
              title: 'سراتو ۲۰۲۴ آپشنال',
              slug: 'cerato-2024-optional',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 2500000000,
              secondDownPayment2Months: 3500000000,
              secondDownPayment7Months: 3500000000,
              totalPrice: 4500000000,
              imageUrl: '/assets/models/cerato-2024-white.jpg',
              order: 1,
              isFeatured: true,
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
              title: 'توسان ۲۰۲۴ فول',
              slug: 'tucson-2024-full',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 3500000000,
              secondDownPayment2Months: 4800000000,
              secondDownPayment7Months: 4800000000,
              totalPrice: 6000000000,
              imageUrl: '/assets/models/tucson-2024-blue.jpg',
              order: 1,
              isFeatured: true,
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
          brandSlug: 'bmw',
          vehicle: { title: 'بی ام و سری ۳', slug: 'bmw-series-3', order: 1 },
          models: [
            {
              title: 'BMW 320i 2024',
              slug: 'bmw-320i-2024',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 5000000000,
              secondDownPayment2Months: 7000000000,
              secondDownPayment7Months: 7000000000,
              totalPrice: 9000000000,
              imageUrl: '/assets/models/bmw-320i-black.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 800000000 },
                { durationMonths: 24, monthlyAmount: 435000000 },
                { durationMonths: 36, monthlyAmount: 315000000 },
                { durationMonths: 48, monthlyAmount: 258000000 },
                { durationMonths: 60, monthlyAmount: 225000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 198000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'mercedes-benz',
          vehicle: { title: 'مرسدس بنز C200', slug: 'mercedes-c200', order: 1 },
          models: [
            {
              title: 'C200 AMG Line 2024',
              slug: 'c200-amg-2024',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 7000000000,
              secondDownPayment2Months: 9500000000,
              secondDownPayment7Months: 9500000000,
              totalPrice: 12000000000,
              imageUrl: '/assets/models/mercedes-c200-silver.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 1060000000 },
                { durationMonths: 24, monthlyAmount: 580000000 },
                { durationMonths: 36, monthlyAmount: 420000000 },
                { durationMonths: 48, monthlyAmount: 343000000 },
                { durationMonths: 60, monthlyAmount: 300000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 264000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'renault',
          vehicle: { title: 'رنو کولیوس', slug: 'renault-koleos', order: 1, isFeatured: true },
          models: [
            {
              title: 'کولیوس ۲۰۲۵',
              slug: 'koleos-2025',
              year: 2025,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 4845000000,
              secondDownPayment2Months: 6930000000,
              secondDownPayment7Months: 6930000000,
              totalPrice: 7000000000,
              imageUrl: '/assets/models/koleos-2025-gray.jpg',
              order: 1,
              isFeatured: true,
              plans: [
                { durationMonths: 12, monthlyAmount: 713280000 },
                { durationMonths: 24, monthlyAmount: 391890000 },
                { durationMonths: 36, monthlyAmount: 286150000 },
                { durationMonths: 48, monthlyAmount: 234310000 },
                { durationMonths: 60, monthlyAmount: 204000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 179410000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'nissan',
          vehicle: { title: 'نیسان ایکس‌تریل', slug: 'nissan-xtrail', order: 1 },
          models: [
            {
              title: 'ایکس‌تریل ۲۰۲۴',
              slug: 'xtrail-2024',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 3000000000,
              secondDownPayment2Months: 4200000000,
              secondDownPayment7Months: 4200000000,
              totalPrice: 5500000000,
              imageUrl: '/assets/models/xtrail-2024-red.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 490000000 },
                { durationMonths: 24, monthlyAmount: 267000000 },
                { durationMonths: 36, monthlyAmount: 194000000 },
                { durationMonths: 48, monthlyAmount: 158000000 },
                { durationMonths: 60, monthlyAmount: 138000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 121000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'volkswagen',
          vehicle: { title: 'فولکس واگن تیگوان', slug: 'vw-tiguan', order: 1 },
          models: [
            {
              title: 'تیگوان R-Line 2024',
              slug: 'tiguan-rline-2024',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 4500000000,
              secondDownPayment2Months: 6200000000,
              secondDownPayment7Months: 6200000000,
              totalPrice: 8000000000,
              imageUrl: '/assets/models/tiguan-rline-white.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 710000000 },
                { durationMonths: 24, monthlyAmount: 387000000 },
                { durationMonths: 36, monthlyAmount: 281000000 },
                { durationMonths: 48, monthlyAmount: 229000000 },
                { durationMonths: 60, monthlyAmount: 200000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 176000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'toyota',
          vehicle: { title: 'تویوتا کمری', slug: 'toyota-camry', order: 1, isFeatured: true },
          models: [
            {
              title: 'کمری هیبرید ۲۰۲۴',
              slug: 'camry-hybrid-2024',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 4000000000,
              secondDownPayment2Months: 5500000000,
              secondDownPayment7Months: 5500000000,
              totalPrice: 7000000000,
              imageUrl: '/assets/models/camry-hybrid-pearl.jpg',
              order: 1,
              isFeatured: true,
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
          brandSlug: 'ssangyong',
          vehicle: { title: 'سانگ یانگ کوراندو', slug: 'ssangyong-korando', order: 1 },
          models: [
            {
              title: 'کوراندو ۲۰۲۴',
              slug: 'korando-2024',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 2200000000,
              secondDownPayment2Months: 3000000000,
              secondDownPayment7Months: 3000000000,
              totalPrice: 4000000000,
              imageUrl: '/assets/models/korando-2024-blue.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 355000000 },
                { durationMonths: 24, monthlyAmount: 194000000 },
                { durationMonths: 36, monthlyAmount: 141000000 },
                { durationMonths: 48, monthlyAmount: 115000000 },
                { durationMonths: 60, monthlyAmount: 100000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 88000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'lexus',
          vehicle: { title: 'لکسوس NX', slug: 'lexus-nx', order: 1 },
          models: [
            {
              title: 'NX 350h 2024',
              slug: 'nx-350h-2024',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 6000000000,
              secondDownPayment2Months: 8200000000,
              secondDownPayment7Months: 8200000000,
              totalPrice: 10000000000,
              imageUrl: '/assets/models/lexus-nx-black.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 890000000 },
                { durationMonths: 24, monthlyAmount: 485000000 },
                { durationMonths: 36, monthlyAmount: 352000000 },
                { durationMonths: 48, monthlyAmount: 287000000 },
                { durationMonths: 60, monthlyAmount: 250000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 220000000 },
              ],
            },
          ],
        },
        {
          brandSlug: 'suzuki',
          vehicle: { title: 'سوزوکی گرند ویتارا', slug: 'suzuki-grand-vitara', order: 1 },
          models: [
            {
              title: 'گرند ویتارا ۲۰۲۴ هیبرید',
              slug: 'grand-vitara-2024-hybrid',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 2800000000,
              secondDownPayment2Months: 3800000000,
              secondDownPayment7Months: 3800000000,
              totalPrice: 5000000000,
              imageUrl: '/assets/models/grand-vitara-2024-silver.jpg',
              order: 1,
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
        {
          brandSlug: 'mitsubishi',
          vehicle: { title: 'میتسوبیشی اوتلندر', slug: 'mitsubishi-outlander', order: 1 },
          models: [
            {
              title: 'اوتلندر PHEV 2024',
              slug: 'outlander-phev-2024',
              year: 2024,
              mileage: 'صفر کیلومتر',
              firstDownPayment: 4200000000,
              secondDownPayment2Months: 5700000000,
              secondDownPayment7Months: 5700000000,
              totalPrice: 7500000000,
              imageUrl: '/assets/models/outlander-phev-2024-white.jpg',
              order: 1,
              plans: [
                { durationMonths: 12, monthlyAmount: 665000000 },
                { durationMonths: 24, monthlyAmount: 363000000 },
                { durationMonths: 36, monthlyAmount: 264000000 },
                { durationMonths: 48, monthlyAmount: 215000000 },
                { durationMonths: 60, monthlyAmount: 188000000, isHighlighted: true },
                { durationMonths: 72, monthlyAmount: 165000000 },
              ],
            },
          ],
        },
      ];

      // ========================================
      // اجرای ساخت برای همه برندها
      // ========================================
      const allVehiclesData = [...domesticVehiclesData, ...foreignVehiclesData];
      let totalVehicles = 0;
      let totalModels = 0;
      let totalPlans = 0;

      for (const data of allVehiclesData) {
        const brand = await brandRepo.findOne({ where: { slug: data.brandSlug } });
        if (!brand) {
          console.warn(`⚠️  برند ${data.brandSlug} یافت نشد، رد می‌شود`);
          continue;
        }

        // ساخت Vehicle
        const vehicle = await vehicleRepo.save(
          vehicleRepo.create({
            ...data.vehicle,
            isActive: true,
            brand,
          }),
        );
        totalVehicles++;

        // ساخت Modelها برای این Vehicle
        for (const modelData of data.models) {
          const { plans, ...modelFields } = modelData;
          const model = await modelRepo.save(
            modelRepo.create({
              ...modelFields,
              isActive: true,
              vehicle,
            }),
          );
          totalModels++;

          // ساخت پلن‌های اقساط برای این Model
          const savedPlans = await planRepo.save(
            plans.map((p) =>
              planRepo.create({
                ...p,
                order: p.durationMonths,
                isActive: true,
                model,
              }),
            ),
          );
          totalPlans += savedPlans.length;
        }
      }

      console.log('✅ خودروها، مدل‌ها و جداول اقساط ثبت شد:');
      console.log(`   🚗 ${totalVehicles} خودرو (یکی برای هر برند)`);
      console.log(`   🔧 ${totalModels} مدل (هر خودرو ۱-۲ مدل با عکس متفاوت)`);
      console.log(`   📊 ${totalPlans} ردیف اقساط`);
    } else {
      console.log('ℹ️  خودروها از قبل وجود دارند.');
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