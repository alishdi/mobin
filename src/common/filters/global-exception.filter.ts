import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, TypeORMError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'خطای سرور';
    let error: any = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        message = (res as any).message || exception.message;
        error = (res as any).error || null; 
      }
      
      if (!error && message) {
        error = Array.isArray(message) ? message[0] : message;
      }
    } else if (exception instanceof QueryFailedError) {
      this.logger.error('QueryFailedError:', exception.message);
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'خطای پایگاه داده';
      error = exception.message; 
    } else if (exception instanceof TypeORMError) {
      this.logger.error('TypeORMError:', exception.message);
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = exception.message;
    } else if (exception instanceof Error) {
      this.logger.error('Error:', exception.message);
      message = exception.message;
      error = exception.message; 
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error, 
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}