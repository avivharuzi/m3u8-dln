export type ChildProcessMessageStatus = 'success' | 'error';

export interface ChildProcessMessage<T = unknown> {
  status: ChildProcessMessageStatus;
  result: T;
  error: Error | null;
}
