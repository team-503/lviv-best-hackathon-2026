import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { TypeORMError } from 'typeorm';

@Catch(TypeORMError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const isConnectionError = this.isConnectionError(exception);
    const statusCode = isConnectionError ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(`TypeORM [${exception.constructor.name}]: ${exception.message}`, exception.stack);

    response.status(statusCode).json({
      statusCode,
      error: isConnectionError ? 'Service Unavailable' : 'Internal Server Error',
      message: isConnectionError ? 'Database is temporarily unavailable. Please try again later.' : 'A database error occurred.',
    });
  }

  private isConnectionError(err: Error): boolean {
    return (
      err.message.includes('ECONNREFUSED') ||
      err.message.includes('ENOTFOUND') ||
      err.message.includes('connect ETIMEDOUT') ||
      err.message.includes('Connection terminated') ||
      err.constructor.name === 'CannotExecuteNotConnectedError' ||
      err.constructor.name === 'CannotConnectAlreadyConnectedError'
    );
  }
}
