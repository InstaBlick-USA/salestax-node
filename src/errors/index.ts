export { SalesTaxError, type SalesTaxErrorOptions } from './base'
export {
  ApiError, AuthenticationError, PermissionError, ValidationError,
  NotFoundError, ConflictError, ServerError, RateLimitError,
  type ApiErrorOptions,
} from './api-error'
export { ConnectionError, TimeoutError } from './connection-error'

import {
  ApiError, AuthenticationError, PermissionError, ValidationError,
  NotFoundError, ConflictError, RateLimitError, ServerError,
} from './api-error'

const STATUS_MAP: Record<number, typeof ApiError> = {
  400: ValidationError,
  401: AuthenticationError,
  403: PermissionError,
  404: NotFoundError,
  409: ConflictError,
  413: ValidationError,
  422: ValidationError,
}

export interface ErrorResponseBody {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  code?: string
  request_id?: string
  retryable?: boolean
  retry_after_seconds?: number
  errors?: Array<{ pointer?: string; message?: string }>
}

export function errorFromResponse(
  status: number,
  body: ErrorResponseBody,
  requestIdHeader?: string,
  retryAfterMsFromHeader?: number,
): ApiError {
  const code = body.code ?? `HTTP_${status}`
  const message = body.detail ?? body.title ?? `Request failed with status ${status}`
  const requestId = requestIdHeader ?? body.request_id
  const param = body.errors?.[0]?.pointer
  const retryAfterMs =
    retryAfterMsFromHeader ??
    (body.retry_after_seconds != null ? body.retry_after_seconds * 1000 : undefined)

  if (status === 429) {
    return new RateLimitError(code, message, {
      statusCode: status, requestId, param, retryAfterMs,
    })
  }
  if (status >= 500) {
    return new ServerError(code, message, {
      statusCode: status, requestId, param,
      retryable: body.retryable ?? true,
    })
  }
  const Ctor = STATUS_MAP[status] ?? ApiError
  return new Ctor(code, message, { statusCode: status, requestId, param })
}