export const UserRole = {
  Admin: 'admin',
  User: 'user',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Адміністратор',
  [UserRole.User]: 'Користувач',
};
