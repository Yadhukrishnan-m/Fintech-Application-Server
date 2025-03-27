import { injectable } from "inversify";
import jwt from "jsonwebtoken";

@injectable()
export class JwtService {
  generateAccessToken(_id: string): string {
    const expiry = process.env.ACCESS_TOKEN_EXPIRY
    return jwt.sign({ _id }, process.env.ACCESS_TOKEN_SECRET as string, {
      expiresIn: "10m"
    });
  }

  generateRefreshToken(_id: string): string {
    return jwt.sign({ _id }, process.env.REFRESH_TOKEN_SECRET as string, {
      expiresIn: "7d",
    });
  }

   verifyToken(token: string,type:'access'|'refresh'): any {
    try {
     const secret =
       type === "access"
         ? process.env.ACCESS_TOKEN_SECRET
         : process.env.REFRESH_TOKEN_SECRET;
     return jwt.verify(token, secret as string);
    } catch (error) {
      return null;
    }
  }
}
