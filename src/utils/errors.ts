export class AppError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(
    message: string,
    options: { code?: string; status?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code;
    this.status = options.status;
  }
}

type ErrorLike = {
  message?: unknown;
  code?: unknown;
  status?: unknown;
};

export function toAppError(error: unknown, fallback = "Something went wrong"): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof Error) {
    const candidate = error as Error & ErrorLike;
    return new AppError(error.message || fallback, {
      code: typeof candidate.code === "string" ? candidate.code : undefined,
      status: typeof candidate.status === "number" ? candidate.status : undefined,
      cause: error,
    });
  }

  if (error && typeof error === "object") {
    const candidate = error as ErrorLike;
    return new AppError(
      typeof candidate.message === "string" ? candidate.message : fallback,
      {
        code: typeof candidate.code === "string" ? candidate.code : undefined,
        status: typeof candidate.status === "number" ? candidate.status : undefined,
        cause: error,
      },
    );
  }

  return new AppError(fallback, { cause: error });
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  return toAppError(error, fallback).message;
}

export function isRetryableError(error: unknown) {
  const appError = toAppError(error);

  if (appError.status === 408 || appError.status === 429) return true;
  if (appError.status && appError.status >= 500) return true;

  return ["ECONNABORTED", "ECONNRESET", "NETWORK_ERROR", "PGRST000", "PGRST002"].includes(
    appError.code ?? "",
  );
}

export async function withAppError<T>(
  operation: () => Promise<T>,
  fallback: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw toAppError(error, fallback);
  }
}
