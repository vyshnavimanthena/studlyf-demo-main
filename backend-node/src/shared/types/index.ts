export interface RequestUser {
  userId: string;
  email: string;
  role: string;
  institutionId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}
