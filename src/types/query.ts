export type QueryItem = {
  id: number;
  request_cost: string;
  request_type: string;
  status: string;
  request_date: string;
};

export type QueryResponse = {
  requests: QueryItem[];
  total_pages: number;
  total: number;
};