export type AppErrorCode =
  | 'not_found'
  | 'validation'
  | 'conflict'
  | 'unauthorized'
  | 'permission_denied'
  | 'storage'
  | 'file'
  | 'unknown';

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

export const DEFAULT_ERROR_MESSAGE = 'Beklenmeyen bir hata oluştu. Lütfen tekrar dene.';

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  return DEFAULT_ERROR_MESSAGE;
}
