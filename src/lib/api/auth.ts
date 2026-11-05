import { api } from "./client"
import type { LoginResponse, OkResponse, UserSummary } from "./types"

export const authApi = {
  login: (login_id: string, password: string) =>
    api<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login_id, password }),
    }),
  me: () => api<UserSummary>("/api/auth/me"),
  changePassword: (current_password: string, new_password: string) =>
    api<OkResponse>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),
  logout: () => api<OkResponse>("/api/auth/logout", { method: "POST" }),
}
