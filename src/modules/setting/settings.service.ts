import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slider } from '../../database/entities/slider.entity';
import { Footer } from '../../database/entities/footer/footer.entity';
import { CreateSliderDto } from './dto/slider/create-slider.dto'; 
import { UpdateSliderDto } from './dto/slider/update-slider.dto';
import { CreateFooterDto } from './dto/footer/create-footer.dto';
import { UpdateFooterDto } from './dto/footer/update-footer.dto'; 
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Slider) private readonly sliderRepo: Repository<Slider>,
    @InjectRepository(Footer) private readonly footerRepo: Repository<Footer>,
    private readonly cacheClearService: CacheClearService,
  ) {}

  async getActiveSliders(location: string): Promise<Slider[]> {
    return this.sliderRepo.find({
      where: { location, isActive: true },
      order: { order: 'ASC' },
    });
  }

  async getFooter(): Promise<Footer[]> {
    return this.footerRepo.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findAllSliders(q: AdminPaginationDto): Promise<PaginatedResponseDto<Slider>> {
    const [data, total] = await this.sliderRepo.findAndCount({
      select: {
        id: true, title: true, description: true, imageUrl: true,
        linkUrl: true, buttonText: true, location: true, order: true,
        startDate: true, endDate: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
      order: { [q.sortBy || 'createdAt']: q.sortOrder || 'DESC' },
      skip: q.skip,
      take: q.limit,
    });

    return PaginatedResponseDto.create(data, total, q.page!, q.limit!);
  }

  async findAllFooters(q: AdminPaginationDto): Promise<PaginatedResponseDto<Footer>> {
    const [data, total] = await this.footerRepo.findAndCount({
      select: {
        id: true, section: true, title: true, content: true,
        order: true, isActive: true, createdAt: true, updatedAt: true,
      },
      order: { [q.sortBy || 'order']: q.sortOrder || 'ASC' },
      skip: q.skip,
      take: q.limit,
    });

    return PaginatedResponseDto.create(data, total, q.page!, q.limit!);
  }

  async createSlider(dto: CreateSliderDto): Promise<Slider> {
    const saved = await this.sliderRepo.save(this.sliderRepo.create(dto));
    await this.cacheClearService.clearByPattern('cache:*settings*');
    await this.cacheClearService.clearByPattern('cache:*sliders*');
    return saved;
  }

  async updateSlider(id: string, dto: UpdateSliderDto): Promise<Slider> {
    const slider = await this.sliderRepo.findOne({ where: { id } });
    if (!slider) throw new NotFoundException('اسلایدر یافت نشد');

    Object.assign(slider, dto);
    const saved = await this.sliderRepo.save(slider);
    await this.cacheClearService.clearByPattern('cache:*settings*');
    await this.cacheClearService.clearByPattern('cache:*sliders*');
    return saved;
  }

  async deleteSlider(id: string): Promise<void> {
    const slider = await this.sliderRepo.findOne({ where: { id } });
    if (!slider) throw new NotFoundException('اسلایدر یافت نشد');

    await this.sliderRepo.remove(slider);
    await this.cacheClearService.clearByPattern('cache:*settings*');
    await this.cacheClearService.clearByPattern('cache:*sliders*');
  }

  async createFooter(dto: CreateFooterDto): Promise<Footer> {
    const saved = await this.footerRepo.save(this.footerRepo.create(dto));
    await this.cacheClearService.clearByPattern('cache:*settings*');
    await this.cacheClearService.clearByPattern('cache:*footers*');
    return saved;
  }

  async updateFooter(id: string, dto: UpdateFooterDto): Promise<Footer> {
    const footer = await this.footerRepo.findOne({ where: { id } });
    if (!footer) throw new NotFoundException('بخش فوتر یافت نشد');

    Object.assign(footer, dto);
    const saved = await this.footerRepo.save(footer);
    await this.cacheClearService.clearByPattern('cache:*settings*');
    await this.cacheClearService.clearByPattern('cache:*footers*');
    return saved;
  }

  async deleteFooter(id: string): Promise<void> {
    const footer = await this.footerRepo.findOne({ where: { id } });
    if (!footer) throw new NotFoundException('بخش فوتر یافت نشد');

    await this.footerRepo.remove(footer);
    await this.cacheClearService.clearByPattern('cache:*settings*');
    await this.cacheClearService.clearByPattern('cache:*footers*');
  }
}