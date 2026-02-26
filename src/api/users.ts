import adminApi from "./adminApi";
import userApi from "./userApi";

import {
  TelegramUsersResponse,
  type ApiTelegramUser,
  type ApiUser,
  type CreatedUserResponse,
  type UpdateUserPayload,
  type UserRole,
  type UsersResponse,
} from "../types/user";

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Access token not found");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

export const getCurrentUser = async (): Promise<ApiUser> => {
  const { data } = await userApi.get<ApiUser>(`/api/v1/users/profile`, {
    headers: getHeaders(),
  });

  return data;
};
