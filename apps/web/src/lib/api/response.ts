import { NextResponse } from "next/server";

type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  ok: false;
  error: ApiError;
};

export type ApiSuccessResponse<T extends Record<string, unknown>> = {
  ok: true;
} & T;

export type ApiResponse<T extends Record<string, unknown>> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status, headers: NO_STORE_HEADERS }
  );
}

export function jsonOk<T extends Record<string, unknown>>(
  data: T,
  init?: ResponseInit
) {
  return NextResponse.json(
    { ok: true, ...data },
    {
      ...init,
      headers: {
        ...NO_STORE_HEADERS,
        ...(init?.headers ?? {}),
      },
    }
  );
}
