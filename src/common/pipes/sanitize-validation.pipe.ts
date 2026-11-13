import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

export interface ValidationDetail {
  field: string;
  messages: string[];
}

function collectValidationDetails(
  errors: ValidationError[],
  parentField?: string,
): ValidationDetail[] {
  const details: ValidationDetail[] = [];

  for (const error of errors) {
    const field = parentField ? `${parentField}.${error.property}` : error.property;

    if (error.constraints) {
      details.push({ field, messages: Object.values(error.constraints) });
    }
    if (error.children && error.children.length > 0) {
      details.push(...collectValidationDetails(error.children, field));
    }
  }

  return details;
}

export function createGlobalValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        message: 'Validation failed for one or more fields',
        code: 'VALIDATION_ERROR',
        details: collectValidationDetails(errors),
      }),
  });
}
