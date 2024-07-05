import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './models/users.model';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { SignInResponse } from 'src/commom/types/auth-response.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly usersModel: Model<User>,
    private readonly authService: AuthService,
  ) {}

  public async signUp(signUpDTO: SignUpDto): Promise<User> {
    const user = new this.usersModel(signUpDTO);
    return user.save();
  }

  public async signIn(signInDto: SignInDto): Promise<SignInResponse> {
    const user = await this.findByEmail(signInDto.email);
    const match = await this.checkPassword(signInDto.password, user);
    if (!match) throw new NotFoundException('Invalid credentials');
    const jwtToken = await this.authService.createAcessToken(
      user._id as string,
    );

    return {
      name: user.name,
      jwtToken,
      email: user.email,
    };
  }

  public async findAll(): Promise<User[]> {
    return this.usersModel.find();
  }

  private async findByEmail(email: string): Promise<User> {
    const user = this.usersModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async checkPassword(password: string, user: User): Promise<boolean> {
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new NotFoundException('Invalid credentials');
    return match;
  }
}
