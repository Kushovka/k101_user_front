export type ComplaintStatus = "pending" | "reviewed" | "resolved" | "rejected";

export type Complaint = {
  id: number;
  doc_id: string;
  field_name: string;
  message: string;
  status: ComplaintStatus;
  username: string;
  created_at: string;
  reviewed_at: string;
  admin_comment: string;
};
