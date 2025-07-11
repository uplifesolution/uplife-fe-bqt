export interface ResponseApi<T = any> {
  message: string;
  timestamp: string;
  data: T;
}
