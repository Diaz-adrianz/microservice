export const AccountType = {
  CREDENTIALS: 'credentials',
  OAUTH: 'oauth',
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const AccountProvider = {
  LOCAL: 'local',
  GOOGLE: 'google',
} as const;

export type AccountProvider =
  (typeof AccountProvider)[keyof typeof AccountProvider];
