import userApi from "./userApi";

export const createAppeal = async (data: {
  subject: string;
  message: string;
  category: string;
}) => {
  const res = await userApi.post("/api/v1/appeals", data);
  return res.data;
};

export const getMyAppeals = async (params?: { page?: number }) => {
  const res = await userApi.get("/api/v1/appeals/my", {
    params,
  });
  return res.data;
};
