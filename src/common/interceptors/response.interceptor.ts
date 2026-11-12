import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';
import { redactSensitiveData } from '../utils/redaction.util';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((payload: any) => {
        const sanitized = redactSensitiveData(payload);
        if (
          sanitized &&
          typeof sanitized === 'object' &&
          'data' in sanitized &&
          'meta' in sanitized
        ) {
          return {
            success: true as const,
            message: sanitized.message || 'Operation completed successfully',
            data: sanitized.data,
            meta: sanitized.meta || {},
          };
        }
        return {
          success: true as const,
          message:
            (sanitized && typeof sanitized === 'object' && sanitized.message) ||
            'Operation completed successfully',
          data: sanitized ?? ({} as T),
          meta:
            (sanitized && typeof sanitized === 'object' && sanitized.meta) ||
            {},
        };
      }),
    );
  }
}
