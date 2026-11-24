import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac } from 'crypto';
import { ApiClient } from '../../../database/entities/api-client/api-client.entity'; 

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiClient) private readonly clientRepo: Repository<ApiClient>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawApiKey = request.headers['x-api-key'];

    if (!rawApiKey || typeof rawApiKey !== 'string') {
      throw new UnauthorizedException('کلید API ارسال نشده است');
    }

    // هش کردن کلید ارسالی برای مقایسه با دیتابیس
    const hash = createHmac('sha256', process.env.API_KEY_SECRET || 'fallback-secret')
      .update(rawApiKey)
      .digest('hex');

    const client = await this.clientRepo.findOne({
      where: { apiKeyHash: hash, isActive: true },
    });

    if (!client) {
      throw new UnauthorizedException('کلید API نامعتبر است');
    }

    if (client.expiresAt && client.expiresAt < new Date()) {
      throw new UnauthorizedException('کلید API منقضی شده است');
    }

    request.apiClient = client; // ذخیره اطلاعات کارفرما در ریکوئست
    return true;
  }
}