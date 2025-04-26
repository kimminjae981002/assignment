import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Gender, UserRole } from 'src/common/entities/enums/user.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  age: number;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsInt()
  level: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsDateString()
  birthDate: Date;

  @IsDateString()
  paymentDate: Date;
}
