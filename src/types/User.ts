export interface User {
  id: String;
  email: String;
  password: String;
  fullname: String;
  gender: String;
  role: Role;
  avatarUrl: String;
  publicId: String;
  isActive: Boolean;
  createdAt: Date;
  updatedAt: Date;
  refreshTokens: RefreshToken[];
  VerificationToken: VerificationToken[];
  OTP: OTP[];
}

export enum Role {
  "USER",
  "ADMIN",
}

export interface RefreshToken {
  id: String;
  userId: String;
  token: String;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface VerificationToken {
  id: String;
  userId: String;
  token: String;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface OTP {
  id: String;
  userId: String;
  otp: String;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}
