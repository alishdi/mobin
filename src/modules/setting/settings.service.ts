import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { Setting } from '../../database/entities/setting.entity';
import { Slider } from '../../database/entities/slider.entity';
import { Footer } from '../../database/entities/footer.entity';

import { CreateSliderDto } from './dto/slider/create-slider.dto'; 
import { UpdateSliderDto } from './dto/slider/update-slider.dto';
import { CreateFooterDto } from './dto/footer/create-footer.dto'; 
import { UpdateFooterDto } from './dto/footer/update-footer.dto'; 
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly CACHE_PREFIX = 'settings:';
  private readonly CACHE_TTL = 3600;

  constructor(
    @InjectRepository(Setting) private readonly settingRepo: Repository<Setting>,
    @InjectRepository(Slider) private readonly sliderRepo: Repository<Slider>,
    @InjectRepository(Footer) private readonly footerRepo: Repository<Footer>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // ==================== تنظیمات عمومی (شامل لوگو) ====================

  async getPublicSettings(group?: string): Promise<Record<string, any>> {
    const cacheKey = `${this.CACHE_PREFIX}public:${group || 'all'}`;
    const cached = await this.cacheManager.get<Record<string, any>>(cacheKey);
    if (cached) return cached;

    const where: any = { isPublic: true };
    if (group) where.group = group;

    const settings = await this.settingRepo.find({ where });
    const result: Record<string, any> = {};

    for (const setting of settings) {
      result[setting.key] = this.parseValue(setting.value, setting.type);
    }

    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const cacheKey = `${this.CACHE_PREFIX}all`;
    const cached = await this.cacheManager.get<Record<string, any>>(cacheKey);
    if (cached) return cached;

    const settings = await this.settingRepo.find();
    const result: Record<string, any> = {};

    for (const setting of settings) {
      result[setting.key] = this.parseValue(setting.value, setting.type);
    }

    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async updateSetting(key: string, dto: UpdateSettingDto): Promise<Setting> {
    const setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`تنظیم با کلید ${key} یافت نشد`);
    }

    setting.value = typeof dto.value === 'object' ? JSON.stringify(dto.value) : String(dto.value);
    const saved = await this.settingRepo.save(setting);

    await this.cacheManager.del(`${this.CACHE_PREFIX}public:${saved.group}`);
    await this.cacheManager.del(`${this.CACHE_PREFIX}public:all`);
    await this.cacheManager.del(`${this.CACHE_PREFIX}all`);

    this.logger.log(`✅ تنظیم "${key}" به‌روزرسانی و کش مربوطه پاک شد`);
    return saved;
  }

  // ==================== اسلایدرها ====================

  async getActiveSliders(location: string = 'home'): Promise<Slider[]> {
    const cacheKey = `${this.CACHE_PREFIX}sliders:${location}`;
    const cached = await this.cacheManager.get<Slider[]>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const sliders = await this.sliderRepo.find({
      where: { location, isActive: true },
      order: { order: 'ASC' },
    });

    const activeSliders = sliders.filter(s => {
      const isStarted = !s.startDate || new Date(s.startDate).getTime() <= now.getTime();
      const isNotEnded = !s.endDate || new Date(s.endDate).getTime() >= now.getTime();
      return isStarted && isNotEnded;
    });

    await this.cacheManager.set(cacheKey, activeSliders, this.CACHE_TTL);
    return activeSliders;
  }

  async createSlider(dto: CreateSliderDto): Promise<Slider> {
    const slider = this.sliderRepo.create(dto);
    const saved = await this.sliderRepo.save(slider);
    await this.cacheManager.del(`${this.CACHE_PREFIX}sliders:${saved.location}`);
    return saved;
  }

  async updateSlider(id: string, dto: UpdateSliderDto): Promise<Slider> {
    const slider = await this.sliderRepo.findOne({ where: { id } });
    if (!slider) throw new NotFoundException('اسلایدر مورد نظر یافت نشد');

    Object.assign(slider, dto);
    const saved = await this.sliderRepo.save(slider);
    await this.cacheManager.del(`${this.CACHE_PREFIX}sliders:${saved.location}`);
    return saved;
  }

  async deleteSlider(id: string): Promise<void> {
    const slider = await this.sliderRepo.findOne({ where: { id } });
    if (!slider) throw new NotFoundException('اسلایدر مورد نظر یافت نشد');

    const location = slider.location;
    await this.sliderRepo.remove(slider);
    await this.cacheManager.del(`${this.CACHE_PREFIX}sliders:${location}`);
  }

  // ==================== فوتر ====================

  async getFooters(): Promise<Footer[]> {
    const cacheKey = `${this.CACHE_PREFIX}footers`;
    const cached = await this.cacheManager.get<Footer[]>(cacheKey);
    if (cached) return cached;

    const footers = await this.footerRepo.find({
      where: { isActive: true },
      order: { order: 'ASC', section: 'ASC' },
    });

    await this.cacheManager.set(cacheKey, footers, this.CACHE_TTL);
    return footers;
  }

  async createFooter(dto: CreateFooterDto): Promise<Footer> {
    const footer = this.footerRepo.create(dto);
    const saved = await this.footerRepo.save(footer);
    await this.cacheManager.del(`${this.CACHE_PREFIX}footers`);
    return saved;
  }

  async updateFooter(id: string, dto: UpdateFooterDto): Promise<Footer> {
    const footer = await this.footerRepo.findOne({ where: { id } });
    if (!footer) throw new NotFoundException('بخش فوتر مورد نظر یافت نشد');

    Object.assign(footer, dto);
    const saved = await this.footerRepo.save(footer);
    await this.cacheManager.del(`${this.CACHE_PREFIX}footers`);
    return saved;
  }

  async deleteFooter(id: string): Promise<void> {
    const footer = await this.footerRepo.findOne({ where: { id } });
    if (!footer) throw new NotFoundException('بخش فوتر مورد نظر یافت نشد');

    await this.footerRepo.remove(footer);
    await this.cacheManager.del(`${this.CACHE_PREFIX}footers`);
  }

  // ==================== متد کمکی ====================

  private parseValue(value: string | null, type: string): any {
    if (!value) return null;

    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'json':
        try {
          return JSON.parse(value);
        } catch (error) {
          this.logger.warn(`خطا در پارس کردن JSON برای مقدار: ${value}`);
          return value;
        }
      default:
        return value;
    }
  }
}