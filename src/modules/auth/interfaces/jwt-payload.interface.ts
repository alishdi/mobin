export interface JwtPayload {
  sub: string;
  
  phone: string;
  
  iat?: number;
  
  exp?: number;
}