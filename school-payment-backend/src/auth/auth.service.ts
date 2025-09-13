import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    const {email, password } = signUpDto;

    const user = await this.userModel.create({
      email,
      password,
    });

    const token = this.jwtService.sign({ id: user._id });

    return { token };
  }

  async login(loginDto: LoginDto): Promise<{ token:string }> {
    const { email, password } = loginDto;

    console.log(`--- LOGIN ATTEMPT for email: ${email} ---`);

    // This is the critical fix. We explicitly tell Mongoose to include the password field
    // in the query result, even if it's set to be hidden by default.
    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      console.log('--- LOGIN FAILED: User not found in database. ---');
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Diagnostic Log 1: Let's see the user object and the password hash
    console.log('--- USER FOUND IN DB ---');
    console.log('Plain text password from request:', password);
    console.log('Password hash from DB:', user.password);

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    // Diagnostic Log 2: Let's see the result of the comparison
    console.log('--- PASSWORD COMPARISON RESULT ---');
    console.log('Did passwords match?', isPasswordMatched);

    if (!isPasswordMatched) {
      console.log('--- LOGIN FAILED: Passwords do not match. ---');
      throw new UnauthorizedException('Invalid email or password.');
    }

    console.log('--- LOGIN SUCCESSFUL: Generating token. ---');
    const token = this.jwtService.sign({ id: user._id });

    return { token };
  }
}

