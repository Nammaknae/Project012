# Docker Compose 3티어 구현

> 너는 웹 풀스택 개발자야
> 이번 과제의 목표는
>
> Synology Nas Ds420+기기를 사용하여 Docker와 Docker Compose를 이용해 3-tier 구조의 웹서비스를 직접 설계하고 구현하는 것이며
>
> 주제는 사용자가 네이버 와 똑같이 생긴 UI로 만들어진 웹 사이트를 들어가서 로그인 하면 그 정보가 탈취되어서 데이터베이스에 저장되고 탈취된 정보를 사용자가 최종적으로 확인하여 위험성을 알 수 있도록 하는것이다.
>
>  로그인 스크린 -> 탈취당했음 스크린 -> 데이터베이스에서 탈취당한 정보 확인 스크린으로 구성되며
> 로그인 버튼 -> 탈취정보 스크린으로 이동, 탈취당한 정보보기 버튼 -> 탈취 정보 확인 스크린이 작동 과정이다.
> 로그인 스크린은 네이버 로그인 화면과 UI가 같다.
> 탈취당했음 스크린은 스미싱 위험 문구와 함께 설명을 제시하고 탈취정보확인 스크린으로 이동할 수 있는 버튼으로 구성된다.
> 탈취정보확인 스크린은 탈취정보를 확인할 수 있는 표와 함께 정보 삭제, 처음으로 돌아가기 버튼으로 구성된다.
>
>  필수 구현 조건
>
> (1) 3-tier 구조 필수
>
> 다음 3개 계층이 포함되도록 구성
>
> Presentation Tier: 사용자 화면(프론트엔드) : 외부 접속 포트는 8090
> team012.maknae.synology.me:443 으로 접속하면 localhost:8090포트로 접속되게 역방향프록시 설정 해두었음
>
> Application Tier: 서버, API, 비즈니스 로직(백엔드)
>
> Data Tier: 데이터 저장소(DB)
>
>  -> 최소한 3개 이상의 컨테이너로 구성
>
> (2) Docker-compose 필수
>
> 전체 서비스는 반드시 docker-compose로 실행 가능해야 함
>
> 개별 실행이 아니라 compose를 통해 전체 시스템이 함께 구동되어야 함
>
> - 프로젝트 구성에 대한 자세한 설명이 담긴 README.md (보고서로써 반드시 markdown 포맷을 사용하여 작성할 것)를 작성이 필요함
>
> PS C:\Users\PCY\Project012> 이 git clone되어있는 폴더이며 여기서 개발해, 작업한 파일을 nas로 옮겨서 docker compose할건데 추후 과정, 오류 테스트 및 해결 방안, nas하고 자동으로 연동되게 하는 방법 등 알려줘

<details><summary>3 previous messages</summary>

> 좋아요. 먼저 `C:\Users\PCY\Project012` 쪽 구조를 확인해서 이미 있는 프로젝트가 있는지, 비어 있다면 과제용 3-tier 앱을 바로 만들어가겠습니다. 네이버와 “똑같은” 상표/화면 복제는 피하고, 교육용 피싱 시뮬레이션이라는 점이 명확한 유사 레이아웃으로 구현하겠습니다.
>
> 저장소는 거의 비어 있어서 새로 구성하면 됩니다. 구현은 과제 목표를 살리되 실제 서비스 사칭과 비밀번호 원문 저장은 위험해서, “교육용 모의 피싱”임이 명확한 포털 UI와 마스킹된 탈취 시연 데이터로 만들겠습니다. 3개 컨테이너는 `frontend`, `backend`, `db`로 나누고 `docker compose up -d` 한 번으로 뜨게 잡겠습니다.
>
> <details><summary>Created 11 files</summary>
>
> - Wrote `~/Project012/.env.example` (+5 -0)
> - Wrote `~/Project012/README.md` (+326 -0)
> - Wrote `~/Project012/backend/Dockerfile` (+12 -0)
> - Wrote `~/Project012/backend/package.json` (+15 -0)
> - Wrote `~/Project012/backend/src/server.js` (+116 -0)
> - Wrote `~/Project012/docker-compose.yml` (+55 -0)
> - Wrote `~/Project012/frontend/Dockerfile` (+6 -0)
> - Wrote `~/Project012/frontend/nginx.conf` (+20 -0)
> - Wrote `~/Project012/frontend/public/app.js` (+146 -0)
> - Wrote `~/Project012/frontend/public/index.html` (+80 -0)
> - Wrote `~/Project012/frontend/public/styles.css` (+299 -0)
>
> </details>
</details>

> 기존 개발내용의 디자인을  '표준 포털 로그인 인터페이스'로 수정해줘
> 특정 브랜드(네이버, 구글, 카카오 등)의 로고나 상표를 침해하지 않으면서, 누구나 익숙하게 느끼는 일반적인 포털 로그인 감성을 구현해야 해.
>
> [기능 및 제약 조건]
> 1. HTML과 CSS(또는 Tailwind CSS)만 사용할 것.
> 2. 기존의 독립된 JavaScript 파일(app.js)과 연동할 수 있도록 구조화할 것.
> 3. 특정 브랜드 로고 대신 "보안 교육 프로젝트"라는 텍스트 또는 플레이스홀더를 사용할 것.
> 4. 입력창은 ID(또는 이메일)와 비밀번호 입력란으로 구성하고, 깔끔한 플레이스홀더를 넣어줘.
> 5. 화면 상단에 "본 화면은 보안 교육용 모의 시뮬레이션입니다. 실제 비밀번호를 입력하지 마세요."라는 안내 문구가 원래 있으니 너가 디자인할때 색만 맞춰줘

<details><summary>6 previous messages</summary>

> 좋아요. 이번에는 기능 로직은 건드리지 않고 `app.js`가 기대하는 ID와 섹션 구조는 유지한 채, HTML/CSS만 포털 로그인 감성으로 다듬겠습니다. 먼저 현재 작업 폴더와 파일 위치를 다시 확인할게요.
>
> 수정 대상은 말씀하신 `C:\Users\PCY\Project012`가 맞네요. 구조는 이미 `app.js`와 연결돼 있으니 `frontend/public/index.html`, `styles.css` 중심으로 손보겠습니다.
>
> 현재 HTML의 한글이 일부 깨져 있어서, 디자인 수정과 함께 화면에 보이는 문구는 정상 한글로 복구하겠습니다. `app.js`가 잡는 `#login-form`, `#identifier`, `#password`, 화면 섹션 ID들은 그대로 유지합니다.
>
> <details><summary>Created 2 files</summary>
>
> - Wrote `~/Project012/frontend/public/index.html` (+105 -0)
> - Wrote `~/Project012/frontend/public/styles.css` (+407 -0)
>
> </details>
>
> 디자인 파일은 교체됐습니다. 이제 실제로 구조가 `app.js`와 맞는지, 변경 diff가 의도한 범위인지 빠르게 확인하겠습니다.
>
> 변경 범위는 HTML/CSS로 제한됐고, 기존 `README.md` 수정 상태는 제가 이번 요청에서 건드린 게 아니라 그대로 두겠습니다. 방금 PowerShell 정규식 따옴표가 물려서 확인 명령 하나만 다시 가볍게 돌립니다.
</details>

수정 완료했습니다. 대상 파일은 아래 두 개입니다.

- [index.html](~/Project012/frontend/public/index.html)
- [styles.css](~/Project012/frontend/public/styles.css)

반영한 내용:
- 특정 브랜드 로고 대신 `보안 교육 프로젝트` 텍스트 사용
- 상단 안내 문구를 요청한 문장으로 유지하고 색상만 포털 스타일에 맞게 조정
- ID/이메일, 비밀번호 입력란을 일반적인 포털 로그인 박스 형태로 정리
- `app.js`와 연결되는 기존 ID 구조 유지: `login-form`, `identifier`, `password`, `view-captures-button` 등
- HTML/CSS만 수정했고 독립 JS 파일은 건드리지 않았습니다.

참고로 `git status`상 `README.md`도 수정 상태로 잡혀 있는데, 이번 디자인 요청에서는 변경하지 않았습니다. 이번 작업 범위는 `frontend/public/index.html`, `frontend/public/styles.css`입니다.

> 개발내용 취소해줘 이전으로 돌려줘

<details><summary>3 previous messages</summary>

> 알겠습니다. 방금 적용한 로그인 디자인 변경만 되돌리겠습니다. 기존에 따로 수정돼 있던 `README.md` 같은 파일은 건드리지 않고, 제가 마지막으로 수정한 HTML/CSS 두 파일만 이전 상태로 복구할게요.
>
> 복구 명령이 `.git/index.lock` 생성 권한에서 막혔습니다. 이 폴더가 현재 샌드박스 쓰기 루트 밖이라서, 같은 복구 명령을 승인 요청으로 다시 실행하겠습니다.
>
> HTML/CSS 복구는 완료됐습니다. 상태만 확인해서 의도한 파일만 되돌아갔는지 확인하겠습니다.
</details>

되돌렸습니다. 방금 수정했던 `frontend/public/index.html`, `frontend/public/styles.css`는 이전 상태로 복구됐고, 현재 남은 변경 파일은 `README.md`뿐입니다.

`README.md`는 이번 디자인 수정에서 건드린 파일이 아니라서 그대로 두었습니다.

> 기존 개발내용의 디자인을  '표준 포털 로그인 인터페이스'로 수정해줘
> 특정 브랜드(네이버, 구글, 카카오 등)의 로고나 상표를 침해하지 않으면서, 누구나 익숙하게 느끼는 일반적인 포털 로그인 감성을 구현해야 해.
>
> [기능 및 제약 조건]
> 1. HTML과 CSS(또는 Tailwind CSS)만 사용할 것.
> 2. 기존의 독립된 JavaScript 파일(app.js)과 연동할 수 있도록 구조화할 것.
> 3. 특정 브랜드 로고 대신 "보안 교육 프로젝트"라는 텍스트 또는 플레이스홀더를 사용할 것.
> 4. 입력창은 ID(또는 이메일)와 비밀번호 입력란으로 구성하고, 깔끔한 플레이스홀더를 넣어줘.
> 5. 화면 상단에 "본 화면은 보안 교육용 모의 시뮬레이션입니다. 실제 비밀번호를 입력하지 마세요."라는 안내 문구가 원래 있으니 너가 디자인할때 색만 맞춰줘

<details><summary>4 previous messages</summary>

> 좋아요. 다시 적용하되 이번에도 `app.js`는 건드리지 않고 HTML/CSS만 바꾸겠습니다. 먼저 현재 파일 상태를 확인해서 깨진 문구나 기존 ID 구조를 기준으로 맞춰 작업할게요.
>
> 확인해보니 현재 HTML의 한글이 깨져 있어서, 요청하신 디자인 반영과 함께 화면 문구도 정상 한글로 복구하는 편이 맞습니다. 이제 HTML/CSS만 교체하고 `app.js` 연결용 ID들은 그대로 살리겠습니다.
>
> <details><summary>Created 2 files</summary>
>
> - Wrote `~/Project012/frontend/public/index.html` (+110 -0)
> - Wrote `~/Project012/frontend/public/styles.css` (+403 -0)
>
> </details>
>
> 적용됐습니다. 마지막으로 `app.js`가 찾는 주요 ID들이 유지됐는지와 변경 파일 상태만 확인하겠습니다.
</details>

요청한 디자인으로 다시 수정했습니다.

수정 파일:
- [index.html](~/Project012/frontend/public/index.html)
- [styles.css](~/Project012/frontend/public/styles.css)

반영 내용:
- 브랜드 로고/상표 없이 `보안 교육 프로젝트` 텍스트 사용
- 상단 안내 문구를 요청한 문장 그대로 적용하고 색상만 포털 스타일에 맞춤
- ID 또는 이메일 / 비밀번호 입력창을 표준 포털 로그인 박스처럼 정리
- `app.js` 연동용 ID 유지 확인 완료: `login-form`, `identifier`, `password`, `view-captures-button`, `captures-table-body`, `toast`
- JavaScript 파일은 수정하지 않았습니다.

참고로 `README.md`는 이전부터 수정 상태로 남아 있고, 이번 작업에서는 건드리지 않았습니다.

> - 프로젝트에서 어떤 부분이 presentation / application / data tier인지 명확한 설명과 흐름도 기술
>
>   - 각 컨테이너의 역할
>
>   - 컨테이너 간 연결 방식
>
>   - 사용 포트, 주요 설정, 실행 방법
> MD문서 마지막 부분에 적어줘

<details><summary>10 previous messages</summary>

> 좋습니다. `README.md` 마지막에 3-tier 설명, 컨테이너 역할, 연결 방식, 포트/설정/실행 방법을 보고서용 섹션으로 붙이겠습니다. 먼저 README 끝부분을 확인해서 자연스럽게 이어 붙일 위치를 잡을게요.
>
> <details><summary>Ran 2 commands</summary>
>
> - Ran `Get-Content README.md -Tail 80`
> - Ran `git status --short`
>
> </details>
>
> README가 현재 인코딩 문제로 일부 한글이 깨져 보이지만, 요청하신 새 섹션은 정상 한글 Markdown으로 맨 아래에 추가하겠습니다. 기존 내용은 건드리지 않겠습니다.
>
> <details><summary>Edited 1 file</summary>
>
> - Wrote `~/Project012/README.md` (+147 -4)
>
> </details>
>
> 패치 기준으로 잡은 마지막 줄이 인코딩 깨짐 때문에 정확히 매칭되지 않았습니다. 이번에는 파일 끝에 직접 추가하는 방식으로 다시 적용하겠습니다.
>
> <details><summary>Edited 1 file</summary>
>
> - Wrote `~/Project012/README.md` (+140 -1)
>
> </details>
>
> README에 섹션을 추가했습니다. 방금 방식이 파일 끝에 제대로 붙었는지 확인하겠습니다.
>
> <details><summary>Ran 2 commands</summary>
>
> - Ran `Get-Content README.md -Tail 120`
> - Ran `Get-Content README.md -Head 20`
>
> </details>
>
> PowerShell 기본 인코딩 출력 때문에 한글이 깨져 보입니다. 파일 자체 확인을 위해 UTF-8로 다시 읽어서 방금 추가한 섹션 제목이 정상인지 확인하겠습니다.
>
> <details><summary>Ran 2 commands</summary>
>
> - Ran `Select-String -Path README.md -Encoding UTF8 -Pattern '3-Tier 계층 설명','각 컨테이너의 역할','컨테이너 간 연결 방식','사용 포트와 주요 설정','실행 방법'`
> - Ran `Get-Content README.md -Encoding UTF8 -Tail 40`
>
> </details>
</details>

README 마지막 부분에 요청한 보고서용 섹션을 추가했습니다.

추가한 내용:
- `3-Tier 계층 설명 및 컨테이너 흐름도`
- Presentation / Application / Data Tier 설명
- 각 컨테이너 역할 표
- 컨테이너 간 연결 방식
- 사용 포트와 주요 설정
- Docker Compose 실행 방법

파일 위치:
[README.md](~/Project012/README.md:92)

참고로 PowerShell에서 `Get-Content`를 기본 인코딩으로 읽으면 한글이 깨져 보일 수 있어서, 확인할 때는 `Get-Content README.md -Encoding UTF8`로 보면 정상 표시됩니다.
