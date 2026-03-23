import userApi from "./userApi";

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

export const getSnapshots = async (page = 1, pageSize = 10) => {
  const res = await userApi.get("/api/v1/users/snapshots", {
    params: { page, page_size: pageSize },
  });
  return res.data;
};

export const getSnapshotId = async (snapshot_id: number) => {
  const res = await userApi.get(`/api/v1/users/snapshots/${snapshot_id}`);
  return res.data;
};

export const exportSnapshotDossier = async (
  snapshotId: number,
  format: "pdf" | "txt" | "docx",
  personId?: string,
) => {
  const res = await userApi.get(
    `/api/v1/users/snapshots/${snapshotId}/export`,
    {
      params: {
        format,
        person_id: personId, // опционально
      },
      headers: getHeaders(),
      responseType: "blob",
    },
  );

  return res.data as Blob;
};
