export interface IJwtService {
  generateAccessToken(_id: string,role:"user"|"admin"): string;
  generateRefreshToken(_id: string,role:"user"|"admin"): string;
  verifyToken(token: string, type: "access" | "refresh"): any;
}
