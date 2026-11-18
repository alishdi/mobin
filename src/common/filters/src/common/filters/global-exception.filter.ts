import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'خطای داخلی سرور';
    let errorDetails = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = typeof res === 'string' ? res : res.message || 'خطای درخواست';
      errorDetails = res.error || null;
    } 
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'خطای پایگاه داده';
      if ((exception as any).detail) {
        message = (exception as any).detail;
      } else if ((exception as any).message.includes('unique constraint')) {
        message = 'این مقدار قبلاً ثبت شده است';
      }
    }
    else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'رکورد مورد نظر یافت نشد';
    }
    else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`خطای ناشناخته: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: errorDetails,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}