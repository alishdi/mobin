import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

const SENSITIVE_FIELDS = ['password', 'passwordHash', 'hashedPassword', 'secret', 'currentRefreshToken'];

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        
        const sanitizedData = this.sanitize(data);

        return {
          statusCode: response.statusCode,
          message: data?.message || 'عملیات با موفقیت انجام شد',
          data: data?.data !== undefined ? (sanitizedData.data ?? sanitizedData) : sanitizedData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

 
  private sanitize(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (SENSITIVE_FIELDS.includes(key)) {
            continue; 
          }
          sanitized[key] = this.sanitize(obj[key]); 
        }
      }
      return sanitized;
    }

    return obj;
  }
}