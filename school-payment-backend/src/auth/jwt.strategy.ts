import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from '../schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      // Configure the strategy to look for the JWT in the Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Use the secret key from our .env file to verify the token's signature
      secretOrKey: jwtSecret,
    });
  }

  // This method is called automatically after a token has been successfully verified
  async validate(payload: { id: string }): Promise<User> {
    // The 'payload' is the decoded content of the JWT (e.g., { id: '...', email: '...' })
    const { id } = payload;

    // Find the user in the database based on the ID from the token
    const user = await this.userModel.findById(id);

    // If no user is found, the token is invalid (e.g., user was deleted)
    if (!user) {
      throw new UnauthorizedException('Login first to access this endpoint.');
    }

    // If the user is found, NestJS will attach this user object to the request
    // so our controllers can access it (e.g., via @Req() req)
    return user;
  }
}

