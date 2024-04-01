type RegisterRequest = {
  username: string;
  displayName: string;
  email: string;
  password: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type UserIdParam = {
  targetUserId: string;
};

type VerifyRequest = {
  verifyCode: string;
};
