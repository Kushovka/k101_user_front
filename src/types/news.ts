export type NewsCategory =
  | "planned_update"
  | "announcement"
  | "maintenance"
  | "release"
  | "other";

export type NewsStatus = "draft" | "published" | "scheduled" | "archived";

export type NewsReactionSummary = Record<string, unknown>;

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: NewsCategory;
  category_label: string;
  status: NewsStatus;
  status_label: string;
  pinned: boolean;
  scheduled_at: string | null;
  created_by_admin_id: number;
  author_username: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  comment_count: number;
  reactions_summary: NewsReactionSummary;
}

export interface NewsListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: NewsItem[];
}

export interface GetNewsListParams {
  category?: string;
  status?: string;
  pinned_only?: boolean;
  include_drafts?: boolean;
  page?: number;
  page_size?: number;
}
