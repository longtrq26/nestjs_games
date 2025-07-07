export const IS_PUBLIC_KEY = 'isPublic';
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
export const USERNAME_MIN_LENGTH = 4;
export const USERNAME_MAX_LENGTH = 32;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

export const safeUserSelect = {
  id: true,
  username: true,
  createdAt: true,
  updatedAt: true,
};
