export type ReviewStatus =
  | "Chưa trả lời"
  | "Đã trả lời"
  | "REPLIED"
  | "UNREPLIED";
export type ReviewType =
  | "Tiêu cực"
  | "Tích cực"
  | "Trung lập"
  | "POSITIVE"
  | "NEGATIVE"
  | "NEUTRAL"
  | "Không khả dụng"
  | "UNAVAILABLE";

export interface Response {
  userId: string;
  content: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  content?: string;
  status: ReviewStatus;
  response: Response[];
  isActive: boolean;
  type: ReviewType;
  createdAt: Date;
  updatedAt: Date;
}
