import type { AccessType } from "@/domain/models/access-type";
import type { Authentication } from "@/domain/models/authentication";

export type MakeLoginParams = {
  email: string;
  password: string;
  type: AccessType;
};

export interface MakeLogin {
  execute(params: MakeLoginParams): Promise<Authentication>;
}
