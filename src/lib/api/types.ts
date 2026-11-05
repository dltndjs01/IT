export type Role = "employee" | "admin"

export type UserSummary = {
  id: number
  name: string
  dept: string
  role: Role
  must_change_password: boolean
}

export type LoginResponse = { user: UserSummary }
export type OkResponse = { ok: true }
export type ItemsResponse<T> = { items: T[] }

export type Source = {
  doc: string
  section: string
  score?: number
}

export type SupportTicket = {
  ticket_id: string
  priority: "normal" | "high"
  duplicate?: boolean
}

export type AskRequest = {
  question: string
  request_id?: string
  attempt?: number
  context?: string
}

export type AskRoute = "자동 답변" | "보완 질문" | "담당자 이관" | "권한 없음" | "차단"

export type AskResponse = {
  request_id: string
  route: AskRoute
  answer: string
  sources: Source[]
  ticket: SupportTicket | null
  agents?: string[]
  security?: Record<string, unknown>
  reason?: string
}

// The repository marks the nested result/ticket details as adapter-owned until
// OpenAPI is supplied. Known fields remain typed while unknown fields are kept.
export type InquiryView = {
  request_id: string
  question: string
  attempt: number
  result?: AskResponse | Record<string, unknown> | null
  ticket?: SupportTicket | Record<string, unknown> | null
  created_at: string
  [key: string]: unknown
}

export type TicketStatus = "open" | "in_progress" | "resolved"

export type TicketView = {
  id: number
  ticket_id: string
  request_id?: string | null
  requester: string
  title: string
  category: string
  priority: "normal" | "high"
  status: TicketStatus | string
  assignee: number | null
  reply?: string | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export type TicketPatch = {
  status: TicketStatus
  assignee?: number | null
  reply?: string | null
}

export type EmployeeAdminView = {
  id: number
  name: string
  dept: string
  user_id: number | null
}

export type AccountView = {
  id: number
  employee_id: number
  login_id: string
  name: string
  dept: string
  role: Role
  is_active: boolean
  must_change_password: boolean
}

export type CreateAccountRequest = {
  employee_id: number
  login_id: string
  temporary_password: string
}

export type AlertView = {
  id: number
  ticket_id: string | null
  workflow: string
  node: string
  message: string
  severity: string
  created_at: string
}

export type WebErrorBody = {
  error?: {
    code?: string
    message?: string
  }
  codes?: string[]
}
