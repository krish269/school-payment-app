import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

// DTO for the signup process
export class SignUpDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter a valid email.' })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  readonly password: string;
}

// DTO for the login process
export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter a valid email.' })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  readonly password: string;
}
