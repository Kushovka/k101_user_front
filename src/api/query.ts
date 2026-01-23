import userApi from "./userApi";

// query
export const getQuery = async (page = 1, pageSize = 10) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Нет токена");
  const res = await userApi.get(
    `/api/v1/users/requests?page=${page}&page_size=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );
  console.log(res.data);
  return res.data;
};
