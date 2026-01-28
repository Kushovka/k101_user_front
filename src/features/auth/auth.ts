import axios, { AxiosResponse } from "axios";

const API_URL = import.meta.env.VITE_USER_API_URL;

interface LoginRequest {
  username: string;
  password: string;
}

interface VerifyResponse {
  access_token: string;
  refresh_token: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  requires_2fa: boolean;
  session_id?: string;
}

interface LogoutRequest {
  refresh_token: string;
}

export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const res: AxiosResponse<LoginResponse> = await axios.post(
    `${API_URL}/api/v1/auth/login`,
    { username, password },
  );

  const data = res.data;

  if (!data.requires_2fa) {
    localStorage.setItem("access_token", data.access_token!);
    localStorage.setItem("refresh_token", data.refresh_token!);
  } else {
    localStorage.setItem("session_id", data.session_id!);
  }

  console.log(res.data.access_token);
  console.log(res.data.refresh_token);
  console.log(res.data);
  console.log(res);

  return res.data;
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) return;

  await axios.post<void, AxiosResponse<void>, LogoutRequest>(
    `${API_URL}/api/v1/auth/logout`,
    { refresh_token: refreshToken },
  );
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const verify2FA = async (
  code: string,
  session_id: string,
): Promise<VerifyResponse> => {
  const res = await axios.post<VerifyResponse>(
    `${API_URL}/api/v1/auth/verify-2fa`,
    { code, session_id },
  );

  return res.data;
};

export async function refreshTokens() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;

  try {
    const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
      refresh_token: refresh,
    });

    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);

    return true;
  } catch (e) {
    return false;
  }
}
