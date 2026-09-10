---
name: content-ops
description: Run this Korean blog's content pipeline — topic suggestion → content creation → review → SEO optimization → publish — end to end, or just the step(s) the user asks for. Use when the user runs /content-ops, or asks in natural language for any part of it ("다음에 뭐 쓸까", "이 주제로 글 써줘", "이 글 검수해줘", "SEO 점검해줘", "이거 발행해줘").
---

# content-ops

`blog/` 한국어 블로그의 콘텐츠 제작을 4개의 전문 서브에이전트로 조율하는
워크플로입니다. 각 에이전트는 `blog/.claude/agents/`에 정의되어 있습니다:

| 에이전트 | 역할 | 모델 |
|---|---|---|
| `topic-suggester` | 온사이트 데이터 + GA4 기반 토픽 추천 | haiku |
| `content-creator` | 스타일 가이드 기반 초안 작성 | sonnet |
| `content-reviewer` | 맞춤법·팩트체크·논리 검수 | sonnet |
| `seo-manager` | SEO 필드 최적화 (초안 또는 기존 글 전체) | haiku |

각 단계는 이전 단계의 결과(특히 `blog/content-drafts/<slug>.md` 파일 경로)를
다음 단계에 넘기는 방식으로 이어집니다. 단계마다 사람이 확인할 수 있게,
Agent 호출은 **순차적으로(foreground)** 실행하세요 — 다음 단계가 이전 단계의
출력에 의존하기 때문입니다.

## 요청 해석

사용자의 요청을 보고 아래 중 어디에 해당하는지 판단하세요:

1. **전체 파이프라인** — `/content-ops`를 인자 없이 실행했거나, "새 글 하나
   만들어줘" 같은 포괄적인 요청. → 아래 "전체 흐름" 실행.
2. **토픽 추천만** — "다음에 뭐 쓸까", "토픽 추천해줘". → `topic-suggester`만
   호출.
3. **작성만** — 주제가 이미 정해진 채로 "이 주제로 글 써줘". →
   `content-creator`만 호출.
4. **검수만** — "이 글 검수해줘", "맞춤법 봐줘" + 파일 경로(또는 최근 초안).
   → `content-reviewer`만 호출.
5. **SEO만** — "SEO 최적화해줘"(초안 하나) 또는 "SEO 일괄 점검해줘"/"기존 글
   훑어줘"(사이트 전체). → `seo-manager`만 호출 (모드는 seo-manager가 요청
   내용을 보고 스스로 판단합니다).
6. **발행** — "이거 발행해줘", "게시해줘". → 아래 "발행" 절차.

## 전체 흐름

1. **토픽 제안**: `topic-suggester` 에이전트를 호출해 후보를 뽑고, 사용자에게
   보여준 뒤 하나를 선택받으세요. (사용자가 이미 주제를 정해 왔다면 이 단계는
   건너뛰고 바로 2번으로.)
2. **작성**: 선택된 주제(제목/글 종류/카테고리/메모)를 `content-creator`
   에이전트에게 전달하세요. 결과로 `blog/content-drafts/<slug>.md` 초안 파일
   경로를 받습니다.
3. **검수**: 그 파일 경로를 `content-reviewer` 에이전트에게 전달하세요. 맞춤법/
   논리/팩트체크가 반영되고 `status: reviewed`로 갱신됩니다.
4. **SEO 최적화**: 같은 파일 경로를 `seo-manager` 에이전트에게 전달하세요.
   `status: seo-ready`로 갱신되면 발행 준비 완료입니다.
5. **발행 확인**: 최종 초안(제목/설명/태그/시리즈/SEO 필드)을 사용자에게
   요약해서 보여주고 발행 여부와 즉시 공개(published: true) 여부를 물어보세요.
   사용자가 승인하면 아래 "발행" 절차를 따르세요. 승인 전에는 절대 발행
   스크립트를 실행하지 마세요 — 초안 파일은 이미 git으로 추적되므로 승인
   대기 상태로 남겨둬도 안전합니다.

## 발행

사용자가 명시적으로 승인했을 때만:

```bash
cd blog && npm run content:publish -- content-drafts/<slug>.md
```

이 스크립트(`blog/scripts/publish-draft.ts`)는 frontmatter를 읽어 실제
`posts` 테이블에 넣고 태그·시리즈를 연결합니다. `DATABASE_URL`이 실제 Neon
DB를 가리키고 있어야 합니다 (`.env.local`). 성공하면 게시글 경로
(`/type/slug`)를 사용자에게 알려주세요. 사이트맵/RSS/OG 이미지는 이후
자동으로 반영됩니다.

## 부분 실행 시 주의

- 각 서브에이전트는 새 컨텍스트에서 시작하므로, Agent를 호출할 때 필요한
  정보(파일 경로, 주제, 글 종류/카테고리 등)를 프롬프트에 명시적으로
  포함하세요. "이전에 얘기한 그거"처럼 암묵적으로 넘기지 마세요.
- `seo-manager`에게 "기존 글 전체 점검"을 맡길 때는 이미 발행된 글을
  수정하는 것이므로, seo-manager가 제안한 수정값을 사용자가 승인한 뒤에만
  적용하도록 안내되어 있습니다 (에이전트 자체 규칙). 이 스킬에서 임의로
  건너뛰지 마세요.
