import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientUnknownRequestError, Prisma.PrismaClientInitializationError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = this.getStatusCode(exception);
    const isServiceUnavailable = statusCode === HttpStatus.SERVICE_UNAVAILABLE;

    this.logger.error(`Prisma [${exception.constructor.name}]: ${exception.message}`, exception.stack);

    response.status(statusCode).json({
      statusCode,
      error: isServiceUnavailable ? 'Service Unavailable' : 'Internal Server Error',
      message: isServiceUnavailable
        ? 'Database is temporarily unavailable. Please try again later.'
        : 'A database error occurred.',
    });
  }

  private getStatusCode(err: Error): HttpStatus {
    if (err instanceof Prisma.PrismaClientInitializationError) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return HttpStatus.CONFLICT;
      if (err.code === 'P2025') return HttpStatus.NOT_FOUND;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
