# Project012 - 3-Tier 피싱 위험성 교육 웹서비스

Synology NAS DS420+ 환경에서 Docker와 Docker Compose를 이용해 실행하는 3-tier 구조의 교육용 웹서비스입니다. 사용자가 포털 로그인과 비슷한 화면에서 정보를 입력하면, 실제 피싱 상황에서 어떤 정보가 노출될 수 있는지 확인하고 삭제할 수 있도록 구성했습니다. 현재 `team012.maknae.synology.me:443`로 접속하여 로그인, 경고확인, 탈취된 정보 확인이 가능합니다.

> 주의: 본 프로젝트는 보안 교육 목적의 모의 피싱 시뮬레이션입니다. 실제 상표, 로고, 문구를 복제하지 않으며 비밀번호 원문도 저장하지 않습니다. 데이터베이스에는 사용자 식별자, 비밀번호 길이, 마스킹된 미리보기, 접속 정보만 저장됩니다.

## 1. 프로젝트 목표

- Docker Compose 기반으로 전체 서비스를 한 번에 실행
- Presentation, Application, Data 계층을 분리한 3-tier 구조 구현
- 로그인 입력 → 위험 안내 → 저장된 모의 노출 정보 확인 흐름 구현

## 2. 전체 구조

```text
Project012/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── public/
│       ├── app.js
│       ├── index.html
│       └── styles.css
├── docker-compose.yml
├── .env.example
└── README.md
```

## 3. 3-Tier 구성

| 계층 | 컨테이너 | 역할 | 내부 포트 | 외부 포트 |
| --- | --- | --- | --- | --- |
| Presentation Tier | `project012-frontend` | 사용자 화면 제공, API 프록시 | 80 | 8090 |
| Application Tier | `project012-backend` | API, 저장/조회/삭제 로직 | 3000 | 외부 노출 없음 |
| Data Tier | `project012-db` | PostgreSQL 데이터 저장소 | 5432 | 외부 노출 없음 |

Synology 역방향 프록시로 `team012.maknae.synology.me:443`로 연결하면
  → NAS 내부 `localhost:8090`으로 연결되어 프론트엔드 컨테이너로 접속됩니다.

## 4. 주요 기능

### 로그인 스크린

- 아이디와 비밀번호 입력
- 로그인 버튼 클릭 시 백엔드 API로 모의 노출 정보 저장
- 실제 서비스 사칭을 막기 위해 교육용 문구 사용

### 탈취당함 스크린
- 스미싱/피싱 위험 안내
- 입력 정보가 어떤 식으로 공격자에게 전달될 수 있는지 설명
- 탈취 정보 확인 화면으로 이동하는 버튼 제공

### 탈취 정보 확인 스크린

- DB에 저장된 모의 노출 기록 표 표시
- 비밀번호는 원문 대신 마스킹된 값과 길이만 표시
- 전체 정보 삭제 버튼
- 처음으로 돌아가기 버튼

## 5. API 명세

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/api/health` | 백엔드 상태 확인 |
| `POST` | `/api/captures` | 모의 노출 정보 저장 |
| `GET` | `/api/captures` | 저장된 모의 노출 정보 조회 |
| `DELETE` | `/api/captures` | 저장된 정보 전체 삭제 |

저장 데이터 예시:

```json
{
  "identifier": "student@example.com",
  "password_mask": "pa******",
  "password_length": 8,
  "user_agent": "Mozilla/5.0 ...",
  "ip_address": "::ffff:172.18.0.1",
  "created_at": "2026-05-17T12:00:00.000Z"
}
```
## 6. 보안 및 윤리적 제한
- 실제로 사용하고 있는 사이트의 UI를 복제하지 않습니다.
- 실제 계정 탈취 목적으로 사용하지 않습니다.
- 입력된 비밀번호 원문은 저장하지 않습니다.
- 교육 후에는 `정보 삭제` 버튼 또는 `docker compose down -v`로 데이터를 삭제합니다.