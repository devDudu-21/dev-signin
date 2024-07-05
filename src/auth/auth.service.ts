import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { sign } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { User } from 'src/users/models/users.model';
import { JwtPayload } from './models/jwt-payload-model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User')
    private readonly usersModel: Model<User>,
  ) {}

  public async createAcessToken(userId: string): Promise<string> {
    return sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
  }

  public async validateUser(jwtPayload: JwtPayload): Promise<User> {
    const user = this.usersModel.findById({ _id: jwtPayload.userId });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  private jwtExtractor(request: Request): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new BadRequestException('Token not found');
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') throw new BadRequestException('Invalid token type');
    return token;
  }

  public returnJwtExtractor(): (request: Request) => string {
    return this.jwtExtractor;
  }
}
