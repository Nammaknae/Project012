# Project012 - 3-Tier 피싱 위험성 교육 웹서비스

Synology NAS DS420+ 환경에서 Docker와 Docker Compose를 이용해 실행하는 3-tier 구조의 교육용 웹서비스입니다. 사용자가 포털 로그인과 비슷한 화면에서 정보를 입력하면, 실제 피싱 상황에서 어떤 정보가 노출될 수 있는지 확인하고 삭제할 수 있도록 구성했습니다.

> 주의: 본 프로젝트는 보안 교육 목적의 모의 피싱 시뮬레이션입니다. 실제 네이버 상표, 로고, 문구를 복제하지 않으며 비밀번호 원문도 저장하지 않습니다. 데이터베이스에는 사용자 식별자, 비밀번호 길이, 마스킹된 미리보기, 접속 정보만 저장됩니다.

## 1. 프로젝트 목표

- Docker Compose 기반으로 전체 서비스를 한 번에 실행
- Presentation, Application, Data 계층을 분리한 3-tier 구조 구현
- 로그인 입력 → 위험 안내 → 저장된 모의 노출 정보 확인 흐름 구현
- NAS 배포 및 오류 대응이 쉬운 구조 제공

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

Synology 역방향 프록시에서 `team012.maknae.synology.me:443` → NAS 내부 `localhost:8090`으로 연결하면 프론트엔드 컨테이너로 접속됩니다.

## 4. 실행 방법

### Windows 개발 PC

```powershell
cd C:\Users\PCY\Project012
copy .env.example .env
docker compose up -d --build
```

접속 주소:

```text
http://localhost:8090
```

로그 확인:

```powershell
docker compose logs -f
```

종료:

```powershell
docker compose down
```

DB 볼륨까지 삭제:

```powershell
docker compose down -v
```

### Synology NAS

1. NAS에 SSH 접속
2. 프로젝트를 저장할 폴더 생성

```bash
mkdir -p /volume1/docker/project012
```

3. GitHub 저장소를 NAS에 clone하거나 PC에서 파일 업로드

```bash
cd /volume1/docker
git clone <본인_저장소_URL> project012
cd project012
cp .env.example .env
```

4. `.env`에서 DB 비밀번호 변경

```bash
vi .env
```

5. Docker Compose 실행

```bash
docker compose up -d --build
```

6. Synology DSM 역방향 프록시 확인

```text
소스: https://team012.maknae.synology.me:443
대상: http://localhost:8090
```

## 5. 주요 기능

### 로그인 스크린

- 포털 로그인처럼 보이는 교육용 화면
- 아이디와 비밀번호 입력
- 로그인 버튼 클릭 시 백엔드 API로 모의 노출 정보 저장
- 실제 서비스 사칭을 막기 위해 교육용 문구와 가상 브랜드 사용

### 탈취당했음 스크린

- 스미싱/피싱 위험 안내
- 입력 정보가 어떤 식으로 공격자에게 전달될 수 있는지 설명
- 탈취 정보 확인 화면으로 이동하는 버튼 제공

### 탈취 정보 확인 스크린

- DB에 저장된 모의 노출 기록 표 표시
- 비밀번호는 원문 대신 마스킹된 값과 길이만 표시
- 전체 정보 삭제 버튼
- 처음으로 돌아가기 버튼

## 6. API 명세

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

## 7. 오류 테스트 및 해결 방안

### 컨테이너 상태 확인

```bash
docker compose ps
```

`backend` 또는 `db`가 `unhealthy`이면 로그를 확인합니다.

```bash
docker compose logs backend
docker compose logs db
```

### 8090 포트 충돌

증상:

```text
Bind for 0.0.0.0:8090 failed: port is already allocated
```

해결:

```bash
docker ps
```

8090을 쓰는 컨테이너를 중지하거나 `docker-compose.yml`의 포트를 다른 값으로 변경합니다.

```yaml
ports:
  - "8091:80"
```

단, Synology 역방향 프록시 대상 포트도 같이 변경해야 합니다.

### DB 연결 실패

증상:

```text
database system is starting up
connect ECONNREFUSED
```

해결:

```bash
docker compose restart backend
docker compose logs -f backend
```

Compose에 DB healthcheck가 들어 있어 보통 자동 복구되지만, NAS가 느릴 때는 백엔드 재시작이 필요할 수 있습니다.

### 화면은 뜨지만 API가 실패하는 경우

브라우저 개발자 도구 Network 탭에서 `/api/health` 요청을 확인합니다.

```bash
curl http://localhost:8090/api/health
```

정상 응답:

```json
{"status":"ok"}
```

실패하면 프론트엔드 nginx 프록시 설정과 백엔드 컨테이너 상태를 확인합니다.

### NAS에서 변경사항이 반영되지 않는 경우

이미지 캐시를 제거하고 다시 빌드합니다.

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 8. NAS와 자동 연동하는 방법

### 방법 A: GitHub 저장소를 NAS에서 직접 pull

NAS에 clone한 뒤 업데이트할 때마다:

```bash
cd /volume1/docker/project012
git pull
docker compose up -d --build
```

가장 단순하고 안정적인 방식입니다.

### 방법 B: GitHub Actions + NAS SSH 자동 배포

GitHub에 push하면 NAS가 자동으로 pull/build/up 하게 만들 수 있습니다.

1. NAS에서 배포용 SSH 키 생성

```bash
ssh-keygen -t ed25519 -C "project012-deploy"
```

2. 공개키를 GitHub 저장소 Deploy Key에 등록
3. GitHub Secrets에 NAS 접속 정보 등록

```text
NAS_HOST
NAS_USER
NAS_SSH_KEY
NAS_PROJECT_PATH=/volume1/docker/project012
```

4. GitHub Actions 워크플로 예시

```yaml
name: Deploy to Synology NAS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.NAS_HOST }}
          username: ${{ secrets.NAS_USER }}
          key: ${{ secrets.NAS_SSH_KEY }}
          script: |
            cd ${{ secrets.NAS_PROJECT_PATH }}
            git pull
            docker compose up -d --build
```

### 방법 C: Synology Task Scheduler 사용

DSM 작업 스케줄러에서 주기적으로 아래 명령을 실행하게 할 수 있습니다.

```bash
cd /volume1/docker/project012
git pull
docker compose up -d --build
```

단, 너무 짧은 주기는 권장하지 않습니다. 5분 이상 간격을 권장합니다.

## 9. 보안 및 윤리적 제한

- 실제 네이버 UI, 로고, 상표를 복제하지 않습니다.
- 실제 계정 탈취 목적으로 사용할 수 없습니다.
- 입력된 비밀번호 원문은 저장하지 않습니다.
- 교육 후에는 `정보 삭제` 버튼 또는 `docker compose down -v`로 데이터를 삭제합니다.

## 10. 제출 시 설명 포인트

- Docker Compose로 3개 컨테이너가 동시에 실행됨
- 프론트엔드는 8090 포트로 외부 접속 가능
- 백엔드와 DB는 Docker 내부 네트워크에서만 통신
- DB에는 모의 피싱 노출 정보가 저장되고 화면에서 확인 가능
- 실제 피싱 악용을 막기 위해 원문 비밀번호 저장과 실제 브랜드 복제를 제한함
