import { BadRequestException } from '@nestjs/common';

export function handleError(error: unknown): never {
  if (error instanceof Error) {
    throw new BadRequestException(error.message);
  }
  throw new BadRequestException('An unexpected error occurred');
}
