import type { WebErrorBody } from "./types"

const API_TIMEOUT_MS = 35_000

export class ApiError extends Error {
  status: number
  code?: string
  codes?: string[]
  body?: unknown

  constructor(
    message: string,
    options: {
      status: number
      code?: string
      codes?: string[]
      body?: unknown
    },
  ) {
    super(message)
    this.name = "ApiError"
    this.status = options.status
    this.code = options.code
    this.codes = options.codes
    this.body = options.body
  }
}

export async function api<T>(
  path: `/api/${string}`,
  init: RequestInit = {},
): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(path, {
      ...init,
      credentials: "include",
      signal: controller.signal,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    })
    const text = await response.text()
    let body: unknown = null

    if (text) {
      try {
        body = JSON.parse(text)
      } catch {
        throw new ApiError("응답 형식을 확인할 수 없습니다.", {
          status: response.status,
        })
      }
    }

    if (!response.ok) {
      const errorBody = (body ?? {}) as WebErrorBody
      throw new ApiError(
        errorBody.error?.message ??
          (errorBody.codes?.length
            ? `입력 오류: ${errorBody.codes.join(", ")}`
            : "요청을 처리하지 못했습니다."),
        {
          status: response.status,
          code: errorBody.error?.code,
          codes: errorBody.codes,
          body,
        },
      )
    }

    if (body === null) {
      throw new ApiError("응답을 확인할 수 없습니다.", {
        status: response.status,
      })
    }
    return body as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "처리 결과가 확정되지 않았습니다. 같은 요청으로 다시 확인해 주세요.",
        { status: 0, code: "timeout" },
      )
    }
    throw new ApiError("서버에 연결할 수 없습니다.", {
      status: 0,
      code: "network_error",
    })
  } finally {
    window.clearTimeout(timeout)
  }
}
