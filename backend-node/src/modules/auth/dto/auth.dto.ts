export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface SignupRequestDto {
  email: string;
  password: string;
  fullName: string;
  role: string;
}
