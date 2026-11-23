// بخش ۱: معرفی + لوگو + تگ‌ها
export interface BrandContent {
  logoUrl: string;
  slogan: string; // "خیابان‌های شهر منتظرن!"
  description: string;
  features: string[]; // ["تحویل یکسانه", "بدون ضمانت", "اقساط ۷۲ ماهه"]
}

// بخش ۲ و ۳: لیست لینک‌دار (برندها و خودروها)
export interface LinkListContent {
  items: Array<{
    title: string;
    url: string;
  }>;
  viewMore: {
    text: string; // "مشاهده بیشتر"
    url: string;
  };
}

// بخش ۴: شعب
export interface BranchesContent {
  branches: Array<{
    name: string; // "شعبه قیطریه"
    address: string;
    phone: string; // "021-78118"
    icon?: string;
  }>;
}

// بخش ۵: CTA
export interface CtaContent {
  title: string; // "برای خرید اقساطی خودرو آماده‌اید؟"
  description: string;
  helpText: string; // "فرم درخواست مشاوره را تکمیل کنید..."
  button: {
    text: string; // "درخواست مشاوره خرید"
    url: string;
  };
}

// بخش ۶: شبکه‌های اجتماعی
export interface SocialContent {
  links: Array<{
    platform: string; // "email", "instagram"
    url: string;
    icon: string;
  }>;
}

// بخش ۷: کپی‌رایت
export interface CopyrightContent {
  company: string;
  registrationNumber: string;
  rightsText: string;
  developer: {
    name: string;
    url: string;
  };
  brandName: string; // "MOBIN KHODRO"
}