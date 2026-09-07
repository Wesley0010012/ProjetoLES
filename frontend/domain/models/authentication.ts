export type Authentication = {
  token: string;
  userId?: number;
  expiresAt: Date;
};
