import {
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from "react"

type Screen = "질문하기" | "내 문의" | "티켓 관리" | "긴급 알림" | "계정 관리"
type TicketStatus = "처리 중" | "완료" | "접수" | "이관 실패"
type AuthView = "session" | "login" | "change-password" | "app"
type AskRoute = "자동 답변" | "보완 질문" | "담당자 이관" | "권한 없음" | "차단"

type Ticket = {
  id: string
  title: string
  question: string
  answer?: string
  source?: string
  askedAt: string
  answeredAt?: string
  status: TicketStatus
  category: string
  assignee?: string
  requester?: string
}

type Account = {
  id: number
  employeeId: string
  name: string
  dept: string
  loginId: string
  role: "admin" | "employee"
  active: boolean
  mustChangePassword: boolean
}

const initialTickets: Ticket[] = [
  {
    id: "T-2001",
    title: "VPN 접속이 안돼요. 어떻게 해야 하나요?",
    question: "VPN 접속이 자꾸 끊겨요. 재부팅해도 동일한 현상이 발생합니다.",
    answer:
      "재택근무 시 VPN 접속이 되지 않는 경우, 먼저 사내 네트워크 연결 상태를 확인해주세요. 이후에도 동일한 현상이 있다면 기기 재부팅 후 다시 시도해 주세요.",
    source: "재택근무 · VPN 규정 (제3조, 접속 방법 및 주의사항)",
    askedAt: "2025.11.04 (화) 14:32",
    answeredAt: "2025.11.04 (화) 14:40",
    status: "처리 중",
    category: "보통",
    assignee: "김민지",
    requester: "박서연",
  },
  {
    id: "T-1998",
    title: "사내 메신저 오류가 나요",
    question: "사내 메신저를 실행하면 연결 오류 메시지가 표시됩니다.",
    answer: "메신저 캐시 초기화 후 다시 로그인해 주세요.",
    source: "사내 메신저 이용 가이드",
    askedAt: "2025.11.03 (월) 10:21",
    answeredAt: "2025.11.03 (월) 11:05",
    status: "완료",
    category: "일반",
    assignee: "정우성",
    requester: "이준호",
  },
  {
    id: "T-1992",
    title: "노트북 비밀번호를 변경하고 싶어요",
    question: "업무용 노트북의 로그인 비밀번호를 변경하고 싶습니다.",
    askedAt: "2025.10.29 (수) 16:17",
    status: "접수",
    category: "보안",
    requester: "최유진",
  },
  {
    id: "T-1984",
    title: "회의실 예약 방법을 알려주세요",
    question: "회의실 예약 시스템 이용 방법을 알고 싶습니다.",
    askedAt: "2025.10.27 (월) 09:50",
    answeredAt: "2025.10.27 (월) 10:12",
    status: "이관 실패",
    category: "시설",
    requester: "한지훈",
  },
]

const initialAccounts: Account[] = [
  {
    id: 1,
    employeeId: "E-1001",
    name: "김민지",
    dept: "IT팀",
    loginId: "minji.kim",
    role: "admin",
    active: true,
    mustChangePassword: false,
  },
  {
    id: 2,
    employeeId: "E-1002",
    name: "박서연",
    dept: "재무팀",
    loginId: "seoyeon.park",
    role: "employee",
    active: true,
    mustChangePassword: true,
  },
  {
    id: 3,
    employeeId: "E-1003",
    name: "이준호",
    dept: "영업팀",
    loginId: "junho.lee",
    role: "employee",
    active: false,
    mustChangePassword: false,
  },
  {
    id: 4,
    employeeId: "E-1006",
    name: "정우성",
    dept: "IT팀",
    loginId: "woosung.jung",
    role: "admin",
    active: true,
    mustChangePassword: false,
  },
]

const employees = [
  { id: "E-1001", name: "김민지", dept: "IT팀" },
  { id: "E-1002", name: "박서연", dept: "재무팀" },
  { id: "E-1003", name: "이준호", dept: "영업팀" },
  { id: "E-1004", name: "최유진", dept: "인사팀" },
  { id: "E-1005", name: "한지훈", dept: "개발팀" },
  { id: "E-1006", name: "정우성", dept: "IT팀" },
]

const alerts = [
  {
    id: 1,
    severity: "긴급",
    workflow: "oke-handoff",
    node: "create-ticket",
    message: "VPN 문의가 긴급 티켓으로 분류되었습니다.",
    createdAt: "오늘 14:42",
    ticketId: "T-2001",
  },
  {
    id: 2,
    severity: "주의",
    workflow: "oke-handoff",
    node: "save-ticket",
    message: "문의는 보존되었지만 티켓 생성 결과를 확인할 수 없습니다.",
    createdAt: "오늘 11:18",
    ticketId: null,
  },
  {
    id: 3,
    severity: "안내",
    workflow: "ticket-monitor",
    node: "pending-check",
    message: "접수 후 24시간이 지난 문의를 확인해 주세요.",
    createdAt: "어제 16:05",
    ticketId: "T-1992",
  },
]

const navItems: Array<[string, Screen]> = [
  ["ticket", "티켓 관리"],
  ["alert", "긴급 알림"],
  ["user", "계정 관리"],
  ["message", "내 문의"],
]

const employeeNavItems: Array<[string, Screen]> = [
  ["ask", "질문하기"],
  ["message", "내 문의"],
]

function passwordPolicyError(password: string, name: string, loginId: string) {
  const groups = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length
  if (password.length < 12 || groups < 3) {
    return "비밀번호는 12자 이상이며 영문 대·소문자, 숫자, 특수문자 중 3종 이상을 포함해야 합니다."
  }
  if (
    password.toLowerCase().includes(loginId.toLowerCase()) ||
    password.toLowerCase().includes(name.toLowerCase())
  ) {
    return "비밀번호에 이름이나 로그인 ID를 포함할 수 없습니다."
  }
  return ""
}

type IconProps = {
  name: string
  className?: string
}

function Icon({ name, className = "" }: IconProps) {
  return (
    <img
      className={`icon ${className}`}
      src={`/assets/${name}.svg`}
      alt=""
      aria-hidden="true"
    />
  )
}

function PageHeading({
  icon,
  title,
  description,
  children,
}: {
  icon: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="screen-heading">
      <div className="screen-heading__copy">
        <span className="screen-heading__mark">
          <Icon name={icon} />
        </span>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      {children && <div className="screen-heading__actions">{children}</div>}
    </div>
  )
}

function TicketRow({
  ticket,
  isExpanded,
  onToggle,
}: {
  ticket: Ticket
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <article className={`ticket ${isExpanded ? "ticket--expanded" : ""}`}>
      <button
        className="ticket__summary"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className="ticket__round-icon">
          <Icon name={isExpanded ? "message-active" : "message"} />
        </span>
        <span className="ticket__main">
          <strong>{ticket.title}</strong>
          <span className="ticket__dates">
            문의일시 <b>{ticket.askedAt}</b>
            {ticket.answeredAt && (
              <>
                <i /> 답변일시 <b>{ticket.answeredAt}</b>
              </>
            )}
          </span>
        </span>
        <span className={`status status--${ticket.status.replace(" ", "")}`}>
          {ticket.status}
        </span>
        {isExpanded && <span className="priority">{ticket.category}</span>}
        <Icon
          name="chevron"
          className={isExpanded ? "chevron chevron--up" : "chevron"}
        />
      </button>
      {isExpanded && (
        <div className="ticket__body">
          <section className="answer-panel">
            <div className="answer-row">
              <Icon name="document" />
              <div>
                <h3>문의 내용</h3>
                <p>{ticket.question}</p>
              </div>
            </div>
            {ticket.answer && (
              <>
                <div className="divider" />
                <div className="answer-row answer-row--reply">
                  <Icon name="reply" />
                  <div>
                    <h3>답변 내용</h3>
                    <p>{ticket.answer}</p>
                  </div>
                </div>
              </>
            )}
          </section>
          <footer className="ticket__footer">
            <span>
              <Icon name="document" />
              <b>근거 문서</b>
              <em>{ticket.source ?? "근거 문서를 확인하고 있어요."}</em>
            </span>
            <span className="footer-divider" />
            <span>
              <Icon name="ticket" />
              <b>티켓 상태</b>
              <em>
                {ticket.id} · {ticket.status}
              </em>
            </span>
          </footer>
        </div>
      )}
    </article>
  )
}

function AskScreen({
  onCreate,
  onGoRequests,
  recentTickets,
}: {
  onCreate: (
    question: string,
    status: TicketStatus,
    category: string,
    answer: string,
    source?: string,
  ) => Ticket
  onGoRequests: () => void
  recentTickets: Ticket[]
}) {
  const [question, setQuestion] = useState("")
  const [followUp, setFollowUp] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [attempt, setAttempt] = useState(1)
  const [requestId, setRequestId] = useState("")
  const [result, setResult] = useState<{
    route: AskRoute
    answer: string
    sources: string[]
    ticket: Ticket | null
  } | null>(null)

  function resolveQuestion(value: string, nextAttempt: number) {
    let route: AskRoute = "자동 답변"
    let answer =
      "사내 IT 가이드의 점검 순서를 확인해 주세요. 문제가 계속되면 새 문의로 IT팀에 알려주세요."
    let sources = ["IT 서비스 이용 가이드 · 기본 점검"]
    let status: TicketStatus = "완료"
    let category = "보통"

    if (value.includes("무시") || value.includes("프롬프트")) {
      route = "차단"
      answer = "허용되지 않은 요청입니다."
      sources = []
    } else if (value.includes("권한") || value.includes("급여")) {
      route = "권한 없음"
      answer = "이 자료를 조회할 권한이 없습니다."
      sources = []
    } else if (
      value.includes("고장") ||
      value.includes("긴급") ||
      nextAttempt >= 3
    ) {
      route = "담당자 이관"
      answer = value.includes("티켓 장애")
        ? "티켓 접수 상태를 확인할 수 없습니다. 내 문의에서 처리 상태를 다시 확인해 주세요."
        : "IT팀에 문의를 접수했습니다."
      sources = []
      status = value.includes("티켓 장애") ? "이관 실패" : "접수"
      category = value.includes("긴급") ? "긴급" : "보통"
    } else if (value.includes("VPN") && nextAttempt === 1) {
      route = "보완 질문"
      answer = "사용 중인 운영체제와 화면에 표시되는 오류 코드를 알려 주세요."
      sources = []
      status = "처리 중"
    } else if (value.includes("VPN")) {
      answer =
        "VPN 오류 코드를 확인했습니다. 네트워크를 다시 연결한 뒤 VPN 인증을 재시도해 주세요."
      sources = ["재택근무 · VPN 규정 · 접속 오류"]
    }

    const createdRequest = onCreate(value, status, category, answer, sources[0])
    const ticket =
      route === "담당자 이관" && !value.includes("티켓 장애")
        ? createdRequest
        : null
    setResult({ route, answer, sources, ticket })
    setBusy(false)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = question.trim()
    if (value.length < 1 || value.length > 500) {
      setError("질문은 1~500자로 입력해 주세요.")
      return
    }
    setBusy(true)
    setError("")
    const id = requestId || `req-${Date.now().toString(36)}`
    setRequestId(id)
    window.setTimeout(() => {
      resolveQuestion(value, attempt)
    }, 650)
  }

  function submitFollowUp(event: FormEvent) {
    event.preventDefault()
    const value = followUp.trim()
    if (!value) {
      setError("보완 내용을 입력해 주세요.")
      return
    }
    const nextAttempt = attempt + 1
    setAttempt(nextAttempt)
    setBusy(true)
    setError("")
    setQuestion(`${question}\n보완: ${value}`)
    setFollowUp("")
    setRequestId(`req-${Date.now().toString(36)}`)
    window.setTimeout(
      () => resolveQuestion(`${question} ${value}`, nextAttempt),
      650,
    )
  }

  function reset() {
    setQuestion("")
    setFollowUp("")
    setResult(null)
    setError("")
    setAttempt(1)
    setRequestId("")
  }

  return (
    <>
      <PageHeading
        icon="message-fill"
        title="질문하기"
        description="업무 중 마주친 IT 문제를 알려주시면 가장 빠른 해결 방법을 찾아드려요."
      />
      <div className="ask-repo-layout">
        <div className="ask-repo-main">
          <form className="workspace-card ask-form" onSubmit={submit}>
            <div className="card-kicker">IT 문의</div>
            <h2>문제 상황을 알려주세요</h2>
            <p>
              질문은 1~500자로 입력할 수 있으며, 한 번만 안전하게 전송됩니다.
            </p>
            <label>
              문의 내용
              <span className="textarea-box">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  maxLength={500}
                  rows={7}
                  placeholder="예) 재택근무 중 VPN에 연결하면 인증 오류가 반복됩니다."
                />
                <small>{question.length} / 500</small>
              </span>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="form-footer">
              <span>처리 중에는 중복 전송할 수 없어요.</span>
              <button className="primary-button" disabled={busy}>
                {busy ? "답변 확인 중…" : "질문 보내기"}
              </button>
            </div>
          </form>
          <section
            className={`workspace-card repo-answer ${result ? "is-ready" : ""}`}
          >
            <div className="repo-card-head">
              <div>
                <span className="card-kicker">규정에서 찾은 안내</span>
                <h2>{result ? result.route : "답변을 기다리고 있어요"}</h2>
              </div>
              {result?.sources.length ? (
                <span className="source-badge">근거 확인</span>
              ) : null}
            </div>
            {!result ? (
              <div className="repo-empty">
                <Icon name="document" />
                <p>질문을 보내면 답변과 근거 문서가 여기에 표시됩니다.</p>
              </div>
            ) : (
              <>
                <p className="answer-copy">{result.answer}</p>
                {result.sources.length > 0 && (
                  <div className="source-panel">
                    <b>근거</b>
                    {result.sources.map((source) => (
                      <span key={source}>{source}</span>
                    ))}
                  </div>
                )}
                {result.route === "보완 질문" && (
                  <form className="follow-up-form" onSubmit={submitFollowUp}>
                    <label>
                      보완 답변
                      <textarea
                        rows={3}
                        value={followUp}
                        onChange={(event) => setFollowUp(event.target.value)}
                        placeholder="운영체제와 오류 코드 등 추가 정보를 입력해 주세요."
                      />
                    </label>
                    <button className="primary-button" disabled={busy}>
                      보완 보내기
                    </button>
                  </form>
                )}
                {result.route === "담당자 이관" && (
                  <div className="handoff-panel">
                    {result.ticket ? (
                      <>
                        <b>{result.ticket.id}</b>
                        <span>{result.ticket.category} · 기존 접수 아님</span>
                      </>
                    ) : (
                      <span>
                        티켓 접수 여부가 확정되지 않았습니다. 내 문의에서 다시
                        확인해 주세요.
                      </span>
                    )}
                  </div>
                )}
                <div className="result-actions">
                  <button className="secondary-button" onClick={reset}>
                    새 문의
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
        <aside className="ask-repo-side">
          <section className="workspace-card side-summary">
            <div className="side-summary__head">
              <div>
                <span className="card-kicker">MY REQUESTS</span>
                <h2>내 문의</h2>
              </div>
              <button onClick={onGoRequests}>전체 보기</button>
            </div>
            {recentTickets.slice(0, 3).map((ticket) => (
              <div className="mini-request" key={ticket.id}>
                <b>{ticket.title}</b>
                <span>
                  {ticket.status} · {ticket.id}
                </span>
              </div>
            ))}
          </section>
          <section className="workspace-card side-summary it-result">
            <span className="card-kicker">IT팀 처리 결과</span>
            <h2>
              {
                recentTickets.filter((ticket) => ticket.status === "완료")
                  .length
              }
              건 완료
            </h2>
            <p>담당자가 처리한 답변은 내 문의에서 확인할 수 있어요.</p>
          </section>
        </aside>
      </div>
    </>
  )
}

function MyRequestsScreen({
  tickets,
  expanded,
  setExpanded,
  onAsk,
}: {
  tickets: Ticket[]
  expanded: string
  setExpanded: (id: string) => void
  onAsk?: () => void
}) {
  const [refreshed, setRefreshed] = useState(false)
  return (
    <>
      <PageHeading
        icon="message-fill"
        title="내 문의"
        description="오케퐁 IT Help Desk에 문의한 내용과 처리 현황을 확인할 수 있어요."
      >
        <button className="secondary-button" onClick={() => setRefreshed(true)}>
          <Icon name="refresh" />
          {refreshed ? "새로고침 완료" : "새로고침"}
        </button>
        {onAsk && (
          <button className="dark-button" onClick={onAsk}>
            <Icon name="edit" />
            질문하기
          </button>
        )}
      </PageHeading>
      <div className="ticket-list">
        {tickets.map((ticket) => (
          <TicketRow
            key={ticket.id}
            ticket={ticket}
            isExpanded={expanded === ticket.id}
            onToggle={() =>
              setExpanded(expanded === ticket.id ? "" : ticket.id)
            }
          />
        ))}
      </div>
    </>
  )
}

function TicketAdminScreen({
  tickets,
  selectedId,
  onSelect,
  onSave,
  onGoAlerts,
}: {
  tickets: Ticket[]
  selectedId: string
  onSelect: (id: string) => void
  onSave: (
    id: string,
    status: TicketStatus,
    assignee: string,
    answer: string,
  ) => void
  onGoAlerts: () => void
}) {
  const selected =
    tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0]
  const [status, setStatus] = useState<TicketStatus>(selected.status)
  const [assignee, setAssignee] = useState(selected.assignee ?? "")
  const [answer, setAnswer] = useState(selected.answer ?? "")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setStatus(selected.status)
    setAssignee(selected.assignee ?? "")
    setAnswer(selected.answer ?? "")
    setSaved(false)
  }, [selected])

  function save(event: FormEvent) {
    event.preventDefault()
    onSave(selected.id, status, assignee, answer)
    setSaved(true)
  }

  function reloadSelected() {
    setStatus(selected.status)
    setAssignee(selected.assignee ?? "")
    setAnswer(selected.answer ?? "")
    setSaved(false)
  }

  return (
    <>
      <PageHeading
        icon="ticket"
        title="티켓 관리"
        description="접수된 문의의 담당자, 처리 상태와 답변을 관리할 수 있어요."
      >
        <span className="count-chip">전체 {tickets.length}건</span>
      </PageHeading>
      <div className="ticket-summary-grid">
        <div>
          <span>선택한 문의</span>
          <b>{selected.id}</b>
          <small>{selected.requester ?? "직원"}</small>
        </div>
        <div>
          <span>처리 상태</span>
          <b>{selected.status}</b>
          <small>현재 저장 상태</small>
        </div>
        <div>
          <span>긴급도</span>
          <b>{selected.category}</b>
          <small>
            {selected.category === "긴급" ? "우선 확인 필요" : "일반 처리 순서"}
          </small>
        </div>
      </div>
      <div className="admin-grid">
        <section className="workspace-card table-card">
          <div className="section-title">
            <div>
              <span>HELP DESK QUEUE</span>
              <h2>문의 티켓</h2>
            </div>
            <button
              className="icon-button"
              aria-label="선택 티켓 다시 불러오기"
              onClick={reloadSelected}
            >
              <Icon name="refresh" />
            </button>
          </div>
          <div className="admin-list">
            {tickets.map((ticket) => (
              <button
                className={`admin-list-row ${
                  selected.id === ticket.id ? "is-selected" : ""
                }`}
                onClick={() => onSelect(ticket.id)}
                key={ticket.id}
              >
                <span className="ticket-code">{ticket.id}</span>
                <span className="row-copy">
                  <b>{ticket.title}</b>
                  <small>
                    {ticket.requester ?? "직원"} · {ticket.askedAt}
                  </small>
                </span>
                <span
                  className={`status status--${ticket.status.replace(" ", "")}`}
                >
                  {ticket.status}
                </span>
              </button>
            ))}
          </div>
        </section>
        <form className="workspace-card editor-card" onSubmit={save}>
          <div className="section-title">
            <div>
              <span>SELECTED TICKET</span>
              <h2>{selected.id}</h2>
            </div>
            <span className={`priority priority--${selected.category}`}>
              {selected.category}
            </span>
          </div>
          <div className="question-preview">
            <b>{selected.title}</b>
            <p>{selected.question}</p>
          </div>
          <div className="field-row">
            <label>
              처리 상태
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TicketStatus)
                }
              >
                <option>접수</option>
                <option>처리 중</option>
                <option>완료</option>
                <option>이관 실패</option>
              </select>
            </label>
            <label>
              담당자
              <select
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
              >
                <option value="">담당자 미지정</option>
                <option>김민지</option>
                <option>정우성</option>
              </select>
            </label>
          </div>
          <label>
            직원에게 전달할 답변
            <textarea
              rows={6}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="사용자에게 전달할 답변을 입력해 주세요."
            />
          </label>
          {saved && (
            <p className="success-message">변경 사항이 저장되었습니다.</p>
          )}
          <button className="primary-button save-button">처리 내용 저장</button>
        </form>
      </div>
      <section className="workspace-card ticket-alert-summary">
        <div>
          <span className="card-kicker">긴급 알림</span>
          <h2>
            확인이 필요한 알림{" "}
            {alerts.filter((alert) => alert.severity === "긴급").length}건
          </h2>
        </div>
        <p>{alerts[0].message}</p>
        <button className="secondary-button" type="button" onClick={onGoAlerts}>
          긴급 알림에서 확인
        </button>
      </section>
    </>
  )
}

function AccountAdminScreen({
  accounts,
  setAccounts,
}: {
  accounts: Account[]
  setAccounts: Dispatch<SetStateAction<Account[]>>
}) {
  const [employeeId, setEmployeeId] = useState(employees[0].id)
  const [loginId, setLoginId] = useState("")
  const [temporaryPassword, setTemporaryPassword] = useState("")
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts[0]?.id ?? 0,
  )
  const [resetTemporaryPassword, setResetTemporaryPassword] = useState("")
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  function createAccount(event: FormEvent) {
    event.preventDefault()
    const employee = employees.find((item) => item.id === employeeId)
    if (!employee || !loginId.trim() || !temporaryPassword) {
      setError("직원, 로그인 ID와 임시 비밀번호를 모두 입력해 주세요.")
      return
    }
    const policyError = passwordPolicyError(
      temporaryPassword,
      employee.name,
      loginId.trim(),
    )
    if (policyError) {
      setError(policyError)
      return
    }
    if (accounts.some((account) => account.loginId === loginId.trim())) {
      setError("이미 사용 중인 로그인 ID입니다.")
      return
    }
    setAccounts((current) => [
      ...current,
      {
        id: Math.max(...current.map((item) => item.id)) + 1,
        employeeId,
        name: employee.name,
        dept: employee.dept,
        loginId: loginId.trim(),
        role: "employee",
        active: true,
        mustChangePassword: true,
      },
    ])
    setTemporaryPassword("")
    setLoginId("")
    const nextEmployee = employees.find(
      (item) =>
        item.id !== employeeId &&
        !accounts.some((account) => account.employeeId === item.id),
    )
    setEmployeeId(nextEmployee?.id ?? "")
    setError("")
    setNotice(`${employee.name}님의 계정이 발급되었습니다.`)
  }

  function toggleAccount(id: number) {
    setAccounts((current) =>
      current.map((account) =>
        account.id === id ? { ...account, active: !account.active } : account,
      ),
    )
    setNotice("계정 상태가 변경되었습니다.")
  }

  function resetPassword(id: number) {
    if (!resetTemporaryPassword) {
      setError("초기화에 사용할 임시 비밀번호를 입력해 주세요.")
      return
    }
    const target = accounts.find((account) => account.id === id)
    const policyError = target
      ? passwordPolicyError(resetTemporaryPassword, target.name, target.loginId)
      : ""
    if (policyError) {
      setError(policyError)
      return
    }
    setAccounts((current) =>
      current.map((account) =>
        account.id === id ? { ...account, mustChangePassword: true } : account,
      ),
    )
    setResetTemporaryPassword("")
    setError("")
    setNotice("비밀번호가 초기화되었으며 다음 로그인 시 변경이 필요합니다.")
  }

  const availableEmployees = employees.filter(
    (employee) =>
      !accounts.some((account) => account.employeeId === employee.id),
  )
  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) ?? accounts[0]

  return (
    <>
      <PageHeading
        icon="user"
        title="계정 관리"
        description="직원 계정을 발급하고 활성 상태와 비밀번호 초기화를 관리할 수 있어요."
      >
        <span className="count-chip">
          활성 {accounts.filter((item) => item.active).length}명
        </span>
      </PageHeading>
      <div className="account-layout">
        <form
          className="workspace-card create-account"
          onSubmit={createAccount}
        >
          <div className="card-kicker">NEW ACCOUNT</div>
          <h2>직원 계정 발급</h2>
          <p>제공된 직원 정보에 로그인 계정을 연결합니다.</p>
          <label>
            직원 선택
            <select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
            >
              {availableEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} · {employee.dept} ({employee.id})
                </option>
              ))}
            </select>
          </label>
          <label>
            로그인 ID
            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              placeholder="영문 로그인 ID"
            />
          </label>
          <label>
            임시 비밀번호
            <input
              type="password"
              value={temporaryPassword}
              onChange={(event) => setTemporaryPassword(event.target.value)}
              placeholder="임시 비밀번호 입력"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button">계정 발급하기</button>
        </form>
        <section className="workspace-card accounts-card">
          <div className="section-title">
            <div>
              <span>EMPLOYEE ACCOUNTS</span>
              <h2>직원 계정</h2>
            </div>
            <span>{accounts.length}명</span>
          </div>
          {notice && <p className="success-message">{notice}</p>}
          <div className="account-list">
            {accounts.map((account) => (
              <article
                className={`account-row ${
                  selectedAccount?.id === account.id ? "is-selected" : ""
                }`}
                key={account.id}
              >
                <span className="account-avatar">
                  {account.name.slice(0, 1)}
                </span>
                <div className="account-copy">
                  <b>
                    {account.name}
                    <span>{account.active ? "활성" : "비활성"}</span>
                  </b>
                  <small>
                    {account.dept} ·{" "}
                    {account.role === "admin" ? "관리자" : "직원"} ·{" "}
                    {account.loginId}
                  </small>
                  {account.mustChangePassword && (
                    <em>다음 로그인 시 비밀번호 변경</em>
                  )}
                </div>
                <div className="row-actions">
                  <button
                    className="secondary-button"
                    onClick={() => setSelectedAccountId(account.id)}
                  >
                    계정 선택
                  </button>
                </div>
              </article>
            ))}
          </div>
          {selectedAccount && (
            <div className="account-action-panel">
              <div>
                <span className="card-kicker">선택한 계정</span>
                <b>
                  {selectedAccount.name} · {selectedAccount.loginId}
                </b>
              </div>
              <label>
                초기화 임시 비밀번호
                <input
                  type="password"
                  value={resetTemporaryPassword}
                  onChange={(event) =>
                    setResetTemporaryPassword(event.target.value)
                  }
                  placeholder="임시 비밀번호 입력"
                />
              </label>
              <div>
                <button
                  className="secondary-button"
                  onClick={() => resetPassword(selectedAccount.id)}
                >
                  비밀번호 초기화
                </button>
                <button
                  className={
                    selectedAccount.active
                      ? "danger-button"
                      : "secondary-button"
                  }
                  onClick={() => toggleAccount(selectedAccount.id)}
                >
                  {selectedAccount.active ? "비활성화" : "활성화"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

function AlertsScreen({
  onOpenTicket,
}: {
  onOpenTicket: (ticketId: string) => void
}) {
  const [filter, setFilter] = useState("전체")
  const [refreshed, setRefreshed] = useState(false)
  const visible =
    filter === "전체"
      ? alerts
      : alerts.filter((alert) => alert.severity === filter)
  return (
    <>
      <PageHeading
        icon="alert"
        title="긴급 알림"
        description="워크플로우 처리 중 확인이 필요한 긴급·저장 실패 알림을 모아볼 수 있어요."
      >
        <button className="secondary-button" onClick={() => setRefreshed(true)}>
          <Icon name="refresh" />
          {refreshed ? "새로고침 완료" : "새로고침"}
        </button>
      </PageHeading>
      <section className="workspace-card alerts-card">
        <div className="alert-toolbar">
          <div>
            <span className="card-kicker">SYSTEM ALERTS</span>
            <h2>관리 알림</h2>
          </div>
          <div className="filter-tabs">
            {["전체", "긴급", "주의", "안내"].map((item) => (
              <button
                className={filter === item ? "is-active" : ""}
                onClick={() => setFilter(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="alert-list">
          {visible.map((alert) => (
            <article className="alert-row" key={alert.id}>
              <span
                className={`severity-dot severity-dot--${alert.severity}`}
              />
              <div className="alert-copy">
                <span
                  className={`severity-label severity-label--${alert.severity}`}
                >
                  {alert.severity}
                </span>
                <h3>{alert.message}</h3>
                <p>
                  {alert.workflow} · {alert.node}
                </p>
                <small>{alert.createdAt}</small>
              </div>
              {alert.ticketId ? (
                <button
                  className="secondary-button"
                  onClick={() => onOpenTicket(alert.ticketId!)}
                >
                  {alert.ticketId} 보기
                </button>
              ) : (
                <span className="no-ticket">연결된 티켓 없음</span>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function SessionScreen() {
  return (
    <main className="auth-shell">
      <section className="session-card" aria-live="polite">
        <img src="/assets/okepong-logo.svg" alt="오케퐁" />
        <span className="session-spinner" />
        <h1>안전하게 연결하고 있어요</h1>
        <p>로그인 상태와 계정 권한을 확인하는 중입니다.</p>
      </section>
    </main>
  )
}

function AuthAside() {
  return (
    <section className="auth-visual">
      <img src="/assets/okepong-logo.svg" alt="오케퐁" />
      <div className="auth-visual__copy">
        <span>OKE-PONG IT HELPDESK</span>
        <h2>
          IT 문제,
          <br />
          혼자 찾아 헤매지 않도록.
        </h2>
        <p>
          질문하고, 근거를 확인하고, IT팀의 처리 결과까지 한곳에서 확인하세요.
        </p>
      </div>
      <div className="auth-features">
        <span>
          <Icon name="message-active" />
          <b>질문하기</b>
        </span>
        <span>
          <Icon name="ticket" />
          <b>근거 확인</b>
        </span>
        <span>
          <Icon name="settings" />
          <b>처리 결과 확인</b>
        </span>
      </div>
    </section>
  )
}

function LoginScreen({
  accounts,
  onLogin,
}: {
  accounts: Account[]
  onLogin: (account: Account) => void
}) {
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!loginId.trim() || !password) {
      setError("로그인 ID와 비밀번호를 입력해 주세요.")
      return
    }
    setBusy(true)
    setError("")
    window.setTimeout(() => {
      const account = accounts.find(
        (item) => item.loginId.toLowerCase() === loginId.trim().toLowerCase(),
      )
      if (!account) {
        setError("로그인 ID 또는 비밀번호를 확인해 주세요.")
        setBusy(false)
        return
      }
      if (!account.active) {
        setError("비활성화된 계정입니다. IT 관리자에게 문의해 주세요.")
        setBusy(false)
        return
      }
      onLogin(account)
      setBusy(false)
    }, 650)
  }

  return (
    <main className="auth-layout">
      <AuthAside />
      <section className="auth-form-panel">
        <form className="auth-form" onSubmit={submit}>
          <span className="auth-eyebrow">오케퐁 직원 전용</span>
          <h1>로그인</h1>
          <p>관리자에게 발급받은 계정으로 접속해 주세요.</p>
          <label>
            로그인 ID
            <span className="auth-input">
              <Icon name="user" />
              <input
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                autoComplete="username"
                placeholder="로그인 ID 입력"
                autoFocus
              />
            </span>
          </label>
          <label>
            비밀번호
            <span className="auth-input">
              <Icon name="settings" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="비밀번호 입력"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "숨기기" : "보기"}
              </button>
            </span>
          </label>
          {error && (
            <div className="auth-error" role="alert">
              <Icon name="alert" />
              <span>{error}</span>
            </div>
          )}
          <button className="auth-submit" disabled={busy}>
            {busy ? (
              <>
                <span className="button-spinner" />
                로그인 확인 중
              </>
            ) : (
              "로그인"
            )}
          </button>
          <div className="auth-demo-note">
            <b>화면 확인용 계정</b>
            <span>관리자: minji.kim</span>
            <span>최초 변경: seoyeon.park</span>
            <small>데모에서는 비밀번호에 임의의 값을 입력할 수 있습니다.</small>
          </div>
        </form>
        <footer>
          계정 발급·비밀번호 초기화가 필요하면 IT팀에 문의해 주세요.
        </footer>
      </section>
    </main>
  )
}

function ChangePasswordScreen({
  account,
  onComplete,
  onLogout,
}: {
  account: Account
  onComplete: (accountId: number) => void
  onLogout: () => void
}) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [complete, setComplete] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.")
      return
    }
    if (currentPassword === newPassword) {
      setError("현재 비밀번호와 다른 비밀번호를 입력해 주세요.")
      return
    }
    const policyError = passwordPolicyError(
      newPassword,
      account.name,
      account.loginId,
    )
    if (policyError) {
      setError(policyError)
      return
    }
    setBusy(true)
    setError("")
    window.setTimeout(() => {
      setBusy(false)
      setComplete(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      onComplete(account.id)
      window.setTimeout(onLogout, 900)
    }, 700)
  }

  return (
    <main className="auth-layout">
      <AuthAside />
      <section className="auth-form-panel">
        {!complete ? (
          <form className="auth-form change-form" onSubmit={submit}>
            <span className="auth-step">최초 로그인 보안 설정</span>
            <h1>비밀번호 변경</h1>
            <p>
              안전한 서비스 이용을 위해 임시 비밀번호를 새 비밀번호로 변경해
              주세요.
            </p>
            <div className="signed-account">
              <span>{account.name.slice(0, 1)}</span>
              <div>
                <b>{account.name}</b>
                <small>
                  {account.dept} · {account.loginId}
                </small>
              </div>
            </div>
            <label>
              현재 비밀번호
              <span className="auth-input">
                <Icon name="settings" />
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="임시 비밀번호 입력"
                />
              </span>
            </label>
            <label>
              새 비밀번호
              <span className="auth-input">
                <Icon name="settings" />
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="새 비밀번호 입력"
                />
              </span>
            </label>
            <label>
              새 비밀번호 확인
              <span className="auth-input">
                <Icon name="settings" />
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="새 비밀번호 다시 입력"
                />
              </span>
            </label>
            <label className="show-passwords">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(event) => setShowPasswords(event.target.checked)}
              />
              입력한 비밀번호 보기
            </label>
            <div className="password-policy">
              <b>비밀번호 정책</b>
              <span>12자 이상</span>
              <span>영문 대·소문자, 숫자, 특수문자 중 3종 이상</span>
              <span>이름과 로그인 ID 포함 금지</span>
            </div>
            {error && (
              <div className="auth-error" role="alert">
                <Icon name="alert" />
                <span>{error}</span>
              </div>
            )}
            <button className="auth-submit" disabled={busy}>
              {busy ? (
                <>
                  <span className="button-spinner" />
                  변경 중
                </>
              ) : (
                "비밀번호 변경하기"
              )}
            </button>
            <button type="button" className="auth-logout" onClick={onLogout}>
              다른 계정으로 로그인
            </button>
          </form>
        ) : (
          <section className="auth-form auth-success">
            <span className="success-check">✓</span>
            <span className="auth-eyebrow">PASSWORD UPDATED</span>
            <h1>비밀번호가 변경되었어요</h1>
            <p>
              보안을 위해 변경된 비밀번호로 다시 로그인해 주세요. 입력한
              비밀번호는 브라우저에 저장되지 않습니다.
            </p>
            <button className="auth-submit" onClick={onLogout}>
              로그인 화면으로 이동
            </button>
          </section>
        )}
        <footer>
          비밀번호를 잊은 경우 IT 관리자에게 초기화를 요청해 주세요.
        </footer>
      </section>
    </main>
  )
}

export default function App() {
  const [tickets, setTickets] = useState(initialTickets)
  const [accounts, setAccounts] = useState(initialAccounts)
  const [authView, setAuthView] = useState<AuthView>("session")
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)
  const [activeScreen, setActiveScreen] = useState<Screen>("내 문의")
  const [expanded, setExpanded] = useState("T-2001")
  const [selectedTicketId, setSelectedTicketId] = useState("T-2001")

  useEffect(() => {
    const timer = window.setTimeout(() => setAuthView("login"), 650)
    return () => window.clearTimeout(timer)
  }, [])

  function createTicket(
    question: string,
    status: TicketStatus,
    category: string,
    answer: string,
    source?: string,
  ) {
    const id = `T-${2001 + tickets.length}`
    const now = new Date().toLocaleString("ko-KR", {
      dateStyle: "short",
      timeStyle: "short",
    })
    const created: Ticket = {
      id,
      title: question,
      question,
      answer,
      source,
      askedAt: now,
      answeredAt: now,
      status,
      category,
      requester: currentAccount?.name ?? "직원",
    }
    setTickets((current) => [created, ...current])
    setExpanded(id)
    setSelectedTicketId(id)
    return created
  }

  function updateTicket(
    id: string,
    status: TicketStatus,
    assignee: string,
    answer: string,
  ) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              status,
              assignee: assignee || undefined,
              answer: answer || undefined,
              answeredAt: answer ? "방금 전" : ticket.answeredAt,
            }
          : ticket,
      ),
    )
  }

  function openTicket(ticketId: string) {
    setSelectedTicketId(ticketId)
    setActiveScreen("티켓 관리")
  }

  function login(account: Account) {
    setCurrentAccount(account)
    if (account.mustChangePassword) {
      setAuthView("change-password")
      return
    }
    setActiveScreen(account.role === "admin" ? "티켓 관리" : "질문하기")
    setAuthView("app")
  }

  function completePasswordChange(accountId: number) {
    setAccounts((current) =>
      current.map((account) =>
        account.id === accountId
          ? { ...account, mustChangePassword: false }
          : account,
      ),
    )
  }

  function logout() {
    setCurrentAccount(null)
    setAuthView("login")
    setActiveScreen("내 문의")
  }

  if (authView === "session") return <SessionScreen />
  if (authView === "login")
    return <LoginScreen accounts={accounts} onLogin={login} />
  if (authView === "change-password" && currentAccount)
    return (
      <ChangePasswordScreen
        account={currentAccount}
        onComplete={completePasswordChange}
        onLogout={logout}
      />
    )

  const visibleNav =
    currentAccount?.role === "admin" ? navItems : employeeNavItems

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand brand--logo">
          <img src="/assets/okepong-logo.svg" alt="오케퐁" />
        </div>
        <nav aria-label="주 메뉴">
          {visibleNav.map(([icon, label]) => (
            <button
              className={`nav-item ${
                activeScreen === label ? "nav-item--active" : ""
              }`}
              onClick={() => setActiveScreen(label)}
              key={label}
            >
              <Icon
                name={
                  icon === "message" && activeScreen === label
                    ? "message-active"
                    : icon
                }
              />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="logout" onClick={logout}>
          <Icon name="logout" />
          로그아웃
        </button>
      </aside>

      <section className="content">
        <header className="topbar">
          <div className="user">
            <span className="avatar">
              <Icon name="user" />
            </span>
            <b>{currentAccount?.name ?? "사용자"} 님</b>
            <span className="team">
              {currentAccount?.dept} ·{" "}
              {currentAccount?.role === "admin" ? "관리자" : "직원"}
            </span>
            <Icon name="chevron" />
            <span className="topbar-line" />
            <Icon name="logout" />
            <button onClick={logout}>로그아웃</button>
          </div>
        </header>
        <div className="page screen-page">
          {activeScreen === "질문하기" && (
            <AskScreen
              onCreate={createTicket}
              onGoRequests={() => setActiveScreen("내 문의")}
              recentTickets={tickets}
            />
          )}
          {activeScreen === "내 문의" && (
            <MyRequestsScreen
              tickets={tickets}
              expanded={expanded}
              setExpanded={setExpanded}
              onAsk={
                currentAccount?.role === "employee"
                  ? () => setActiveScreen("질문하기")
                  : undefined
              }
            />
          )}
          {activeScreen === "티켓 관리" && (
            <TicketAdminScreen
              tickets={tickets}
              selectedId={selectedTicketId}
              onSelect={setSelectedTicketId}
              onSave={updateTicket}
              onGoAlerts={() => setActiveScreen("긴급 알림")}
            />
          )}
          {activeScreen === "계정 관리" && (
            <AccountAdminScreen accounts={accounts} setAccounts={setAccounts} />
          )}
          {activeScreen === "긴급 알림" && (
            <AlertsScreen onOpenTicket={openTicket} />
          )}
        </div>
      </section>
    </main>
  )
}
