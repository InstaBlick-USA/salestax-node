// src/errors/index.ts
export * from './base';
export * from './api-error';
export * from './connection-error';

import { ApiError, AuthenticationError, PermissionError, ValidationError,
         NotFoundError, ConflictError, RateLimitError, ServerError } from './api-error';

const STATUS_MAP: Record<number, typeof ApiError> = {
  400: ValidationError, 401: AuthenticationError, 403: PermissionError,
  404: NotFoundError, 409: ConflictError, 422: ValidationError,
};

export function errorFromResponse(
  status: number,
  body: { code?: string; message?: string; param?: string },
  requestId?: string,
  retryAfterMs?: number,
): ApiError {
  const code = body.code ?? `HTTP_${status}`;
  const message = body.message ?? `Request failed with status ${status}`;
  const opts = { statusCode: status, requestId, param: body.param };

  if (status === 429) return new RateLimitError(code, message, { ...opts, retryAfterMs });
  if (status >= 500) return new ServerError(code, message, { ...opts, retryable: true });
  const Ctor = STATUS_MAP[status] ?? ApiError;
  return new Ctor(code, message, opts);
}