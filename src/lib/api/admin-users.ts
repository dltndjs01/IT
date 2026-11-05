import { api } from "./client"
import type {
  AccountView,
  CreateAccountRequest,
  EmployeeAdminView,
  ItemsResponse,
  OkResponse,
} from "./types"

export const adminUsersApi = {
  listEmployees: () =>
    api<ItemsResponse<EmployeeAdminView>>("/api/admin/employees"),
  listAccounts: () => api<ItemsResponse<AccountView>>("/api/admin/users"),
  create: (request: CreateAccountRequest) =>
    api<AccountView>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(request),
    }),
  setActive: (id: number, is_active: boolean) =>
    api<AccountView>(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active }),
    }),
  resetPassword: (id: number, temporary_password: string) =>
    api<OkResponse & { must_change_password: true }>(
      `/api/admin/users/${id}/reset-password`,
      {
        method: "POST",
        body: JSON.stringify({ temporary_password }),
      },
    ),
}
