# 내 블로그

Next.js + Neon PostgreSQL + Drizzle ORM + Vercel 조합으로 만든, 검색엔진 최적화(SEO)에 신경 쓴
한국어 블로그입니다. 뉴트럴리즘(Neo-Brutalism) 스타일과 Pretendard 폰트를 사용합니다.
**모든 구성 요소를 무료 요금제로 운영할 수 있도록 설계했습니다.**

## 기술 스택

| 역할        | 도구                |
| ----------- | ------------------- |
| 웹사이트 틀 | Next.js 16 (App Router) |
| 데이터 저장소 | Neon PostgreSQL (서버리스, 무료 티어) |
| 데이터 연결 | Drizzle ORM |
| 인터넷 공개 | Vercel (무료 Hobby 플랜) |
| 디자인      | Neo-Brutalism (Tailwind CSS v4) |
| 글꼴        | Pretendard (self-hosted variable font) |

## 로컬 개발 시작하기

1. 의존성 설치

   ```bash
   npm install
   ```

2. 환경변수 설정

   ```bash
   cp .env.example .env.local
   ```

   `.env.local`을 열어 아래 값을 채웁니다.

   - `DATABASE_URL`: Neon 프로젝트의 connection string
   - `NEXT_PUBLIC_SITE_URL`: 로컬은 `http://localhost:3000`
   - `ADMIN_PASSWORD`: `/admin`에 로그인할 비밀번호
   - `AUTH_SECRET`: `openssl rand -hex 32` 로 생성한 임의의 문자열

3. 데이터베이스 테이블 생성 (마이그레이션 적용)

   ```bash
   npm run db:migrate
   ```

   `drizzle/` 폴더의 SQL 마이그레이션 파일들을 순서대로 적용합니다. 이후 스키마
   (`src/db/schema.ts`)를 바꿀 때는 `npm run db:generate`로 새 마이그레이션
   파일을 만들고, `npm run db:migrate`로 적용하세요.

4. 개발 서버 실행

   ```bash
   npm run dev
   ```

   [http://localhost:3000](http://localhost:3000) 에서 블로그를, `/admin` 에서 글쓰기 화면을 확인하세요.

## 무료로 배포하기 (Neon + Vercel)

### 1) Neon (데이터베이스, 무료)

1. [neon.tech](https://neon.tech) 에서 무료 계정을 만들고 새 프로젝트를 생성합니다.
2. 프로젝트 대시보드의 **Connection string**(`postgres://...` 형태)을 복사합니다. 이 값이 `DATABASE_URL` 입니다.

### 2) GitHub

이 저장소를 GitHub에 push 합니다 (이미 되어 있다면 생략).

### 3) Vercel (호스팅, 무료 Hobby 플랜)

1. [vercel.com](https://vercel.com) 에서 GitHub 저장소를 Import 합니다.
2. **Root Directory**를 이 프로젝트 폴더(`blog`)로 지정합니다.
3. 아래 환경변수를 Vercel 프로젝트 설정 > Environment Variables 에 등록합니다.

   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL` (배포될 도메인, 예: `https://your-blog.vercel.app`)
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET`
   - `GOOGLE_SITE_VERIFICATION` (선택)
   - `NAVER_SITE_VERIFICATION` (선택)

4. Deploy를 누릅니다. 배포가 끝나면 로컬에서처럼 `npm run db:migrate`를 실행해 배포용 Neon DB에도
   마이그레이션을 적용해야 합니다 (로컬 `.env.local`의 `DATABASE_URL`을 잠깐 Neon 프로덕션 값으로
   바꿔서 실행하면 됩니다).

Neon 무료 티어와 Vercel Hobby 플랜만으로 개인 블로그 트래픽은 충분히 감당할 수 있어, **월 비용 0원**으로
운영할 수 있습니다.

## 콘텐츠 구조

모든 글은 **글 종류(type)** 하나와 **카테고리(category)** 하나를 반드시 가집니다.

**글 종류** (URL 경로를 결정합니다)

| 글 종류      | 경로          | 설명 |
| ------------ | ------------- | ---- |
| 인사이트     | `/insight`    | 생각과 분석을 담은 일반 글 |
| 자주 묻는 질문 (FAQ) | `/faq` | 질문 하나당 글 하나. 제목=질문, 본문=답변 |
| 용어 사전    | `/glossary`   | 용어 하나당 글 하나. 제목=용어, 본문=설명 |
| 일상         | `/daily`      | 일상을 기록한 글 |

**카테고리** (모든 글 종류에 공통으로 적용되는 주제 분류)

- 맛집탐방
- AI/기술
- 부동산

각 글 종류 목록 페이지(`/insight`, `/faq`, `/glossary`, `/daily`)에서 카테고리별로 필터링해
볼 수 있습니다. FAQ는 `FAQPage` 구조화 데이터를, 용어 사전은 `DefinedTerm` 구조화 데이터를
자동으로 생성해 검색결과 노출에 유리합니다.

## 글 작성하기

`/admin` 페이지에서 비밀번호로 로그인하면 글 목록, 새 글 작성, 수정, 삭제를 할 수 있습니다.

- **글 종류**와 **카테고리**를 먼저 선택하세요. 글 종류에 따라 제목/본문 입력란의 라벨이
  바뀝니다 (예: FAQ는 "질문"/"답변", 용어 사전은 "용어"/"설명").
- **슬러그**는 글의 URL이 됩니다 (예: 인사이트 글은 `/insight/이-슬러그`). 영문 소문자, 숫자,
  하이픈만 사용하세요.
- **본문**은 Markdown 문법을 지원합니다 (제목, 목록, 코드블록, 표, 인용 등).
- **요약**을 비워두면 본문에서 자동으로 만들어집니다 (검색결과 설명문으로 사용됨).
- 체크박스를 켜야 실제로 공개됩니다. 꺼두면 임시저장 상태로 나만 볼 수 있습니다.

## 태그 · 시리즈

- **태그**: 글마다 여러 개를 붙일 수 있고(`/tags`, `/tags/[slug]`), 관리자
  글쓰기 화면에서 쉼표로 구분해 입력하면 자동으로 생성/재사용됩니다.
- **시리즈(연재물)**: 관리자 화면에서 시리즈 제목과 회차 번호를 입력하면
  자동으로 시리즈가 생성/연결됩니다(`/series`, `/series/[slug]`). 글 상세
  페이지에 이전/다음 화 이동 박스가 표시됩니다.
- 글마다 `metaTitle`/`metaDescription`/`noindex`로 자동 생성되는 SEO 값을
  덮어쓸 수 있습니다 (관리자 글쓰기 화면의 "SEO" 항목).

## 콘텐츠 자동화 (content-ops)

Claude Code에서 이 저장소를 열면 `/content-ops` 스킬로 토픽 추천 → 초안 작성
→ 검수 → SEO 최적화 → 발행까지 이어지는 파이프라인을 실행할 수 있습니다
(`.claude/skills/content-ops/`, `.claude/agents/`). 각 단계만 따로
("이 글 검수해줘", "SEO 일괄 점검해줘") 요청할 수도 있습니다.

| 에이전트 | 역할 | 모델 |
| --- | --- | --- |
| `topic-suggester` | 조회수·태그·시리즈 등 온사이트 데이터 기반 토픽 추천 | Haiku |
| `content-creator` | 스타일 가이드에 맞춘 초안 작성 (`content-drafts/`) | Sonnet |
| `content-reviewer` | 맞춤법·논리·팩트체크 | Sonnet |
| `seo-manager` | SEO 필드 최적화 (초안 1건 또는 기존 글 전체 점검) | Haiku |

관련 스크립트: `npm run content:signals`(토픽 데이터), `npm run content:publish`
(초안 발행), `npm run content:seo-audit`(기존 글 SEO 점검, 읽기 전용),
`npm run content:seo-update`(기존 글 SEO 필드만 수정). 자세한 내용은
`content-drafts/README.md`를 참고하세요.

## SEO(검색 노출) 체크리스트

이 프로젝트에는 아래 SEO 요소가 기본으로 구현되어 있습니다.

- 페이지별 메타 타이틀/설명, Open Graph, Twitter 카드 (`generateMetadata`)
- `사이트맵` (`/sitemap.xml`) 및 `robots.txt` (`/robots.txt`) 자동 생성
- 글 종류에 맞는 구조화 데이터(JSON-LD) 자동 삽입 — 인사이트/일상은 `BlogPosting`, FAQ는
  `FAQPage`, 용어 사전은 `DefinedTerm` → 검색결과 리치 스니펫에 도움
- RSS 피드 (`/rss.xml`)
- 시맨틱 HTML, 명확한 제목 계층 구조
- Pretendard 폰트를 자체 호스팅해 외부 요청 없이 빠르게 로드 (Core Web Vitals에 유리)

배포 후 반드시 아래 두 곳에 사이트를 등록하세요 (한국은 네이버 검색 비중이 매우 높습니다).

1. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console))
   - 소유권 확인 후 `https://your-domain/sitemap.xml` 을 제출하세요.
   - 확인 메타태그를 쓰는 방식을 선택했다면 발급받은 값을 `GOOGLE_SITE_VERIFICATION` 환경변수에 넣고
     재배포하세요.
2. **네이버 서치어드바이저** ([searchadvisor.naver.com](https://searchadvisor.naver.com))
   - 사이트 등록 후 사이트맵(`/sitemap.xml`)을 제출하세요.
   - 확인 메타태그 값을 `NAVER_SITE_VERIFICATION` 환경변수에 넣고 재배포하세요.

둘 다 무료이며, 등록해두면 새 글을 검색엔진이 훨씬 빠르게 찾아갑니다.

## 프로젝트 구조

```
.claude/
  agents/              # content-ops 파이프라인 서브에이전트 정의
  skills/content-ops/  # /content-ops 스킬 정의
content-drafts/        # content-ops가 만드는 게시글 초안 (frontmatter + Markdown)
scripts/                # content-ops용 CLI 스크립트 (topic-signals/publish-draft/seo-*)
drizzle/                # Drizzle 마이그레이션 SQL + 스냅샷 (db:generate로 생성)
src/
  app/                 # 페이지 (App Router)
    admin/             # 비밀번호로 보호된 글쓰기 화면
    [type]/            # 글 종류별 목록 (/insight, /faq, /glossary, /daily)
    [type]/[slug]/     # 글 상세 페이지 (글 종류에 따라 다르게 렌더링)
    tags/, series/      # 태그·시리즈 목록/상세 페이지
    api/                 # 태그·시리즈·게시글 조회 API
    sitemap.ts         # 사이트맵
    robots.ts          # robots.txt
    rss.xml/           # RSS 피드
  components/          # UI 컴포넌트 (article-view/faq-view/glossary-view 등)
  db/                  # Drizzle 스키마 및 DB 클라이언트
  lib/                 # 데이터 조회 함수, 글 종류·카테고리 정의(taxonomy), 인증
    services/          # 태그·시리즈 서비스 레이어
  proxy.ts             # /admin 접근 제어 (로그인 여부 확인)
```
