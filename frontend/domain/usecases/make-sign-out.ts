export interface MakeSignOut {
  execute(token: string): Promise<void>;
}
