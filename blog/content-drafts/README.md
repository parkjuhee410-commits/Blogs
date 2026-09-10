# content-drafts

`/content-ops` 파이프라인(및 관련 서브에이전트)이 생성·검수하는 게시글
초안이 저장되는 폴더입니다. 각 파일은 frontmatter + Markdown 본문으로 되어
있으며, 실제 사이트의 `posts` 테이블 컬럼과 1:1로 대응합니다.

```markdown
---
title: "제목"
slug: "english-slug"
description: "요약 (선택)"
type: insight # insight | faq | glossary | daily
category: ai_tech # food | ai_tech | real_estate
tags: ["태그1", "태그2"]
seriesTitle: "" # 연재물이면 시리즈 제목
seriesOrder: null # 연재물이면 회차 번호
coverImageUrl: ""
metaTitle: ""
metaDescription: ""
noindex: false
published: false
status: draft # draft -> reviewed -> seo-ready
---

본문 Markdown...
```

`status`는 이 폴더 안에서만 쓰이는 워크플로 메모입니다 (DB 컬럼 아님):

1. `content-creator`가 만들면 `draft`
2. `content-reviewer`가 손보면 `reviewed`
3. `seo-manager`가 최적화하면 `seo-ready` — 이 상태가 되면 발행 준비 완료

발행은 사람이 승인한 뒤 저장소 루트가 아니라 `blog/`에서 실행합니다:

```bash
npm run content:publish -- content-drafts/<slug>.md
```

발행되면 DB의 `posts` 테이블에 들어가며, 이 폴더의 파일은 기록으로 남습니다
(원하면 지워도 무방합니다 — 발행 여부는 DB가 기준입니다).
