import { Category } from '../../schemas/restaurant.schema';
import { IsEmail, IsString, IsPhoneNumber, IsNotEmpty, IsEnum, IsOptional, IsEmpty } from 'class-validator';
import { User } from '../../auth/schemas/user.schema';

export class UpdateRestaurantDto {


@IsString()
@IsOptional()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description: string;

  @IsEmail({}, { message: 'Please enter correct email address'})
  @IsOptional()
  readonly email: string;

  @IsPhoneNumber('US')
  @IsOptional()
  readonly phoneNo: number;

  @IsString()
  @IsOptional()
  readonly address: string;

  @IsNotEmpty()
  @IsEnum(Category, { message: 'Please enter correct category'})
  @IsOptional()
  readonly category: Category;

  @IsEmpty({ message: 'You cannot provide the user ID.'})
  readonly user: User
}
