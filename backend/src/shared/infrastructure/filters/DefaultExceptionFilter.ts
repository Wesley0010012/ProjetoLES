import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { MESSAGE_TRANSLATOR } from 'src/shared/application/protocols/translations/MessageTranslator';
import type { MessageTranslator } from 'src/shared/application/protocols/translations/MessageTranslator';
import { ErrorStatusEnum } from 'src/shared/domain/enums/ErrorStatusEnum';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { CustomError } from 'src/shared/domain/errors/CustomError';
import { MessageParams } from 'src/shared/domain/messages/Message';

type ErrorResponse = {
  statusCode: number;
  status: ErrorStatusEnum;
  code: MessageKeyEnum;
  message: string;
  path: string;
  timestamp: string;
};

type NormalizedError = {
  status: ErrorStatusEnum;
  messageKey: MessageKeyEnum;
  messageParams?: MessageParams;
};

const HTTP_STATUS_BY_ERROR_STATUS: Record<ErrorStatusEnum, HttpStatus> = {
  [ErrorStatusEnum.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorStatusEnum.BAD_REQUEST]: HttpStatus.BAD_REQUEST,
  [ErrorStatusEnum.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [ErrorStatusEnum.UNAUTHORIZED]: HttpStatus.FORBIDDEN,
  [ErrorStatusEnum.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorStatusEnum.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorStatusEnum.CONFLICT]: HttpStatus.CONFLICT,
};

@Catch()
export class DefaultExceptionFilter implements ExceptionFilter {
  public constructor(
    @Inject(MESSAGE_TRANSLATOR)
    private readonly _messageTranslator: MessageTranslator,
  ) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const languageHeader: unknown = request.headers['accept-language'];
    const acceptedLanguage =
      typeof languageHeader === 'string' ? languageHeader : undefined;
    const error = this.normalizeError(exception);
    const statusCode = HTTP_STATUS_BY_ERROR_STATUS[error.status];
    const body: ErrorResponse = {
      statusCode,
      status: error.status,
      code: error.messageKey,
      message: this._messageTranslator.translate(
        error.messageKey,
        error.messageParams,
        acceptedLanguage,
      ),
      path: request.originalUrl ?? request.url ?? '',
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }

  private normalizeError(exception: unknown): NormalizedError {
    if (exception instanceof CustomError) {
      return {
        status: exception.status,
        messageKey: exception.messageKey,
        messageParams: exception.messageParams,
      };
    }

    if (exception instanceof HttpException) {
      const status = this.errorStatusFromHttpStatus(exception.getStatus());

      return {
        status,
        messageKey: this.messageKeyFromErrorStatus(status),
      };
    }

    return {
      status: ErrorStatusEnum.INTERNAL_ERROR,
      messageKey: MessageKeyEnum.INTERNAL_SERVER_ERROR,
    };
  }

  private errorStatusFromHttpStatus(httpStatus: number): ErrorStatusEnum {
    switch (httpStatus) {
      case 400:
      case 422:
        return ErrorStatusEnum.BAD_REQUEST;
      case 401:
        return ErrorStatusEnum.UNAUTHENTICATED;
      case 403:
        return ErrorStatusEnum.UNAUTHORIZED;
      case 404:
        return ErrorStatusEnum.NOT_FOUND;
      case 409:
        return ErrorStatusEnum.CONFLICT;
      default:
        return ErrorStatusEnum.INTERNAL_ERROR;
    }
  }

  private messageKeyFromErrorStatus(status: ErrorStatusEnum): MessageKeyEnum {
    switch (status) {
      case ErrorStatusEnum.BAD_REQUEST:
        return MessageKeyEnum.INVALID_REQUEST;
      case ErrorStatusEnum.UNAUTHENTICATED:
        return MessageKeyEnum.AUTHENTICATION_REQUIRED;
      case ErrorStatusEnum.UNAUTHORIZED:
        return MessageKeyEnum.ACCESS_DENIED;
      case ErrorStatusEnum.NOT_FOUND:
        return MessageKeyEnum.RESOURCE_NOT_FOUND;
      case ErrorStatusEnum.CONFLICT:
        return MessageKeyEnum.RESOURCE_CONFLICT;
      default:
        return MessageKeyEnum.INTERNAL_SERVER_ERROR;
    }
  }
}
