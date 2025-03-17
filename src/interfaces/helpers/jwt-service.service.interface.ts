export interface IJwtService {
  generateAccessToken(_id: string): string;
  generateRefreshToken(_id: string): string;
  verifyToken(token: string, type: "access" | "refresh"): any;
}
