export interface ErrorPayload<T = any> {
  code: string;
  message?: string;
  details?: T;
  statusCode?: number;
}

export interface SuccessPayload<T = any> {
  data: T;
}

export function sendError({ statusCode = 400, ...payload }: ErrorPayload) {
  const ctx = strapi.requestContext.get();
  ctx.status = statusCode;
  ctx.body = { error: payload };
}

export function sendValidationError(props: Pick<ErrorPayload, 'details' | 'message'>) {
  return sendError({
    code: 'INVALID_PAYLOAD',
    statusCode: 400,
    ...props,
  });
}

export function sendNotFoundError(props: Pick<ErrorPayload, 'details' | 'message'>) {
  return sendError({
    code: 'NOT_FOUND',
    statusCode: 409,
    ...props,
  });
}

export function sendResponse<T>(data: T, status: number = 200) {
  const ctx = strapi.requestContext.get();
  ctx.status = status;
  ctx.body = { data };
}
