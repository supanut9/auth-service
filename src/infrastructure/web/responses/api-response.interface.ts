export interface IApiError {
  code: string;
  message: string;
  details?: any;
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: IApiError;
}
