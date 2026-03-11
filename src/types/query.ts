export interface SnapshotItem {
  id: number;
  request_type: string;
  search_query: string;
  results_count: number;
  request_date: string;
}

export interface SnapshotResponse {
  total: number;
  total_records_found: number;
  snapshots: SnapshotItem[];
  page: number;
  page_size: number;
  total_pages: number;
}
