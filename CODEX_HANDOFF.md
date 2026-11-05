# 오케퐁 Codex 인계 문서

이 저장소는 React + Vite 프런트엔드입니다. 화면과 Mock 상호작용은 완성되어 있고, 실제 FastAPI 연결 경계는 `src/lib/api/`에 분리되어 있습니다.

## 바로 연결하는 방법

1. `.env.example`을 `.env.local`로 복사합니다.
2. `BACKEND_ORIGIN`에 FastAPI 주소를 입력합니다. 이 값은 브라우저 번들에 들어가지 않습니다.
3. FastAPI를 실행합니다. 브라우저는 동일 출처 `/api`만 호출하고 Vite가 개발 중 프록시합니다.
4. `src/App.tsx`의 로컬 Mock 상태 변경 핸들러를 아래 API 모듈 호출로 교체합니다.
5. `pnpm build`로 타입 및 프로덕션 빌드를 확인합니다.

운영 배포에서는 웹 서버/게이트웨이가 같은 출처의 `/api`를 FastAPI로 전달해야 합니다.

## API 모듈

| 기능 | 모듈 | 함수 |
| --- | --- | --- |
| 로그인·세션·최초 변경·로그아웃 | `src/lib/api/auth.ts` | `login`, `me`, `changePassword`, `logout` |
| 질문 route 5종 | `src/lib/api/ask.ts` | `submit` |
| 내 문의 | `src/lib/api/requests.ts` | `listMine` |
| 티켓 목록·수정 | `src/lib/api/admin-tickets.ts` | `list`, `update` |
| 직원·계정·발급·활성·초기화 | `src/lib/api/admin-users.ts` | `listEmployees`, `listAccounts`, `create`, `setActive`, `resetPassword` |
| 긴급 알림 | `src/lib/api/admin-alerts.ts` | `list` |

공통 클라이언트 `src/lib/api/client.ts`는 다음 계약을 이미 처리합니다.

- 상대 경로 `/api`
- `credentials: include`
- 브라우저→FastAPI 35초 제한
- 자동 재전송 없음
- `{error:{code,message}}`
- HTTP 400 `{codes:[...]}`
- 비JSON, timeout, 네트워크 오류

## 확정 DTO

`src/lib/api/types.ts`에 로그인, 사용자, 질문 응답, 관리자 직원/계정, 티켓 PATCH, 알림 DTO가 있습니다. 다음 두 목록 단건의 상세 위치만 OpenAPI에 맞춰 어댑터를 확정해야 합니다.

1. `InquiryView.result` / `InquiryView.ticket`
2. `TicketView.reply` 등 목록의 선택 필드

미확정 필드는 현재 `unknown` 확장을 허용하지만, OpenAPI를 받으면 정확한 타입으로 좁혀야 합니다.

## App 연결 지점

`src/App.tsx`에서 다음 핸들러를 API 호출로 교체하십시오.

- 세션 확인 `useEffect` → `authApi.me`
- `LoginScreen.submit` → `authApi.login`
- `ChangePasswordScreen.submit` → `authApi.changePassword`
- `logout` → `authApi.logout`
- `AskScreen.submit` / `submitFollowUp` → `askApi.submit`
- 내 문의 새로고침 → `requestsApi.listMine`
- `TicketAdminScreen` 로드/저장 → `adminTicketsApi.list/update`
- `AccountAdminScreen` 로드/액션 → `adminUsersApi.*`
- `AlertsScreen` 새로고침 → `adminAlertsApi.list`

401이면 로그인으로, 403의 `password_change_required`이면 비밀번호 변경으로 이동합니다. 일반 직원의 관리자 403에서는 데이터 없이 권한 안내를 표시합니다.

## 직원 원본

- 이준호 · 영업팀
- 박서연 · 재무팀
- 최유진 · 인사팀
- 한지훈 · 개발팀
- 김민지 · IT팀 · 관리자
- 정우성 · IT팀 · 관리자

담당자는 IT팀 직원 ID만 전송하며 화면 표시 이름과 API의 정수 `employees.id`를 혼동하지 않습니다.

## 완료 기준

- 로그인 응답은 `{user:{id,name,dept,role,must_change_password}}`
- `me`는 user 필드를 바로 반환
- 첫 변경 전 보호 API 403 `password_change_required`
- 직원 `/ask`, 관리자 `/admin/tickets`
- 질문 route 5종 및 보완 attempt/context
- 티켓 `open/in_progress/resolved` ↔ `접수/처리 중/완료`
- 긴급도 `normal/high` ↔ `보통/긴급`
- 티켓 없는 알림 유지
- 계정 성공 후 비밀번호 입력 제거
- 비활성화·초기화 후 기존 세션 폐기 확인
- `pnpm format`
- `pnpm build`

비밀번호, 쿠키, API 키, 실제 연락처는 코드·로그·화면 캡처에 남기지 않습니다.
