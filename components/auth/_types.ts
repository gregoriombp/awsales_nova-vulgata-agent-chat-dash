export type AuthScreen =
  | "login"
  | "email"
  | "forgot"
  | "reset"
  | "verify"
  | "workspace"
  | "success";

export type Locale = "pt" | "en";

export type Org = {
  name: string;
  meta: string;
  avatar?: string;
};
