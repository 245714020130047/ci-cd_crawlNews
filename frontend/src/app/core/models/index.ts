export interface Article {
  id: number;
  slug: string;
  title: string;
  url: string;
  sourceName: string;
  sourceId: number;
  content: string;
  metadata: ArticleMetadata | null;
  summary: ArticleSummary | null;
  status: string;
  viewCount: number;
  crawledAt: string;
  summarizedAt: string;
  bookmarked: boolean;
}

export interface ArticleMetadata {
  category?: string;
  description?: string;
  thumbnail?: string;
  author?: string;
}

export interface ArticleSummary {
  summary?: string;
  key_points?: string[];
  sentiment?: string;
  categories?: string[];
  provider?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface NewsSource {
  id: number;
  name: string;
  baseUrl: string;
  crawlConfig: Record<string, unknown>;
  active: boolean;
}

export interface Stats {
  totalArticles: number;
  summarizedArticles: number;
  pendingArticles: number;
  failedArticles: number;
}

export interface Dashboard {
  stats: Stats;
  sources: NewsSource[];
  crawlerEnabled: boolean;
  summarizerEnabled: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
