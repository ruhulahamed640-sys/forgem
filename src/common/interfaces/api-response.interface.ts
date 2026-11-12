export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details: unknown[];
  };
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
  sessionId: string;
  clientId: string;
}
