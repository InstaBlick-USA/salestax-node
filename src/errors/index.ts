export { SalesTaxError, type SalesTaxErrorOptions } from './base.js';
export {
  ApiError,
  AuthenticationError,
  PermissionError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ServerError,
  RateLimitError,
  type ApiErrorOptions,
} from './api-error.js';
export { ConnectionError, TimeoutError } from './connection-error.js';

import { ApiError, AuthenticationError, PermissionError, ValidationError,
         NotFoundError, ConflictError, RateLimitError, ServerError } from './api-error.js';

const STATUS_MAP: Record<number, typeof ApiError> = {
  400: ValidationError,
  401: AuthenticationError,
  403: PermissionError,
  404: NotFoundError,
  409: ConflictError,
  422: ValidationError,
};

export interface ErrorResponseBody {
  code?: string;
  message?: string;
  param?: string;
}

export function errorFromResponse(
  status: number,
  body: ErrorResponseBody,
  requestId?: string,
  retryAfterMs?: number,
): ApiError {
  const code = body.code ?? `HTTP_${status}`;
  const message = body.message ?? `Request failed with status ${status}`;

  if (status === 429) {
    return new RateLimitError(code, message, {
      statusCode: status,
      requestId,
      param: body.param,
      retryAfterMs,
    });
  }
  if (status >= 500) {
    return new ServerError(code, message, {
      statusCode: status,
      requestId,
      param: body.param,
      retryable: true,
    });
  }
  const Ctor = STATUS_MAP[status] ?? ApiError;
  return new Ctor(code, message, {
    statusCode: status,
    requestId,
    param: body.param,
  });
}