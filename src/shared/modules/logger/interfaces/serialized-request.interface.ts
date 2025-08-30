export interface SerializedRequest {
  id: string;
  method: string;
  url: string;
  query: Record<string, string> | unknown;
  userAgent: string | undefined | string[];
}
