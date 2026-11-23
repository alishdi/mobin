import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 150, description: 'تعداد کل رکوردها' })
  total: number;

  @ApiProperty({ example: 1, description: 'صفحه فعلی' })
  page: number;

  @ApiProperty({ example: 10, description: 'تعداد آیتم در هر صفحه' })
  limit: number;

  @ApiProperty({ example: 15, description: 'تعداد کل صفحات' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'آیا صفحه بعدی وجود دارد؟' })
  hasNextPage: boolean;

  @ApiProperty({ example: false, description: 'آیا صفحه قبلی وجود دارد؟' })
  hasPrevPage: boolean;

  @ApiProperty({ example: 2, nullable: true, description: 'شماره صفحه بعدی' })
  nextPage: number | null;

  @ApiProperty({ example: null, nullable: true, description: 'شماره صفحه قبلی' })
  prevPage: number | null;

  constructor(total: number, page: number, limit: number) {
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPrevPage = page > 1;
    this.nextPage = this.hasNextPage ? page + 1 : null;
    this.prevPage = this.hasPrevPage ? page - 1 : null;
  }
}