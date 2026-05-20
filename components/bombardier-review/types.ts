export interface ReviewComment {
  id: string;
  url: string;
  text: string;
  authorId: string;
  authorName: string;
  authorColorToken: string;
  status: "open" | "resolved";
  createdAt: number;
  x?: number;
  y?: number;
}
