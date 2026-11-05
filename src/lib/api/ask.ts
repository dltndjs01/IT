import { api } from "./client"
import type { AskRequest, AskResponse } from "./types"

export const askApi = {
  submit: (request: AskRequest) =>
    api<AskResponse>("/api/ask", {
      method: "POST",
      body: JSON.stringify(request),
    }),
}
