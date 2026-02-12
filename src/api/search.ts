import { CreateComplaintPayload } from "../types/search";
import userApi from "./userApi";

export const createComplaint = async (payload: CreateComplaintPayload) => {
  const { data } = await userApi.post("/api/v1/complaints", payload);
  return data;
};
