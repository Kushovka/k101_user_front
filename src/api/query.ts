import userApi from "./userApi";

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
