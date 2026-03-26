
import { GetNewsListParams, NewsItem, NewsListResponse } from "../types/news";
import userApi from "./userApi";

export const getNewsList = async (
  params: GetNewsListParams = {},
): Promise<NewsListResponse> => {
  const { data } = await userApi.get<NewsListResponse>("/api/v1/news", {
    params: {
      page: 1,
      page_size: 10,
      pinned_only: false,
      include_drafts: false,
      ...params,
    },
  });

  return data;
};

export const getNewsById = async (postId: number): Promise<NewsItem> => {
  const { data } = await userApi.get<NewsItem>(`/api/v1/news/${postId}`);
  return data;
};
