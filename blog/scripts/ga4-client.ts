/**
 * Google Analytics Data API(GA4) 클라이언트. 서비스 계정 자격증명으로
 * 서버-서버 인증하므로 사람이 매번 로그인할 필요가 없다.
 *
 * 필요한 환경변수 (.env.local):
 *   GA4_PROPERTY_ID  - GA4 속성 ID (숫자만, "properties/" 접두사 없이)
 *   GA4_CLIENT_EMAIL - 서비스 계정 이메일
 *   GA4_PRIVATE_KEY  - 서비스 계정 개인 키 (JSON에서 그대로 복사, 줄바꿈은 \n으로)
 *
 * 설정 방법은 blog/README.md의 "GA4 연동" 절을 참고.
 */
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export function hasGa4Config() {
  return Boolean(
    process.env.GA4_PROPERTY_ID &&
      process.env.GA4_CLIENT_EMAIL &&
      process.env.GA4_PRIVATE_KEY,
  );
}

function getClient() {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA4_CLIENT_EMAIL,
      private_key: (process.env.GA4_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    },
  });
}

function propertyName() {
  const id = process.env.GA4_PROPERTY_ID ?? "";
  return id.startsWith("properties/") ? id : `properties/${id}`;
}

export type Ga4PageMetric = {
  path: string;
  pageViews: number;
  activeUsers: number;
  engagementRate: number;
};

/** 최근 N일간 조회수가 많은 페이지. 어떤 콘텐츠가 트래픽을 끌고 있는지 본다. */
export async function fetchTopPagesByViews(
  days = 28,
  limit = 15,
): Promise<Ga4PageMetric[]> {
  const client = getClient();
  const [response] = await client.runReport({
    property: propertyName(),
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "activeUsers" },
      { name: "engagementRate" },
    ],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit,
  });

  return (response.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    pageViews: Number(row.metricValues?.[0]?.value ?? 0),
    activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
    engagementRate: Number(row.metricValues?.[2]?.value ?? 0),
  }));
}

export type Ga4OrganicLandingPage = {
  path: string;
  sessions: number;
};

/**
 * 최근 N일간 "Organic Search" 채널로 유입된 세션이 많은 랜딩 페이지.
 * 실제로 검색을 통해 사람들을 데려오는 주제가 무엇인지 보여준다.
 */
export async function fetchTopOrganicLandingPages(
  days = 28,
  limit = 15,
): Promise<Ga4OrganicLandingPage[]> {
  const client = getClient();
  const [response] = await client.runReport({
    property: propertyName(),
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "landingPagePlusQueryString" }],
    metrics: [{ name: "sessions" }],
    dimensionFilter: {
      filter: {
        fieldName: "sessionDefaultChannelGroup",
        stringFilter: { value: "Organic Search" },
      },
    },
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit,
  });

  return (response.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
  }));
}
