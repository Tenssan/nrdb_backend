import { Body, Controller, Delete, Get, Param, Post, Put,  } from '@nestjs/common';
import { User} from './interface/user.interface';
import { UserService } from './user.service';
import { LoginUserDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register.user.dto';




@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('registerUser')
  async create(@Body() createUserDto: RegisterUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

 
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  @Post('login')
    async login(@Body() loginUserDto: LoginUserDto): Promise<User | { error: string }> {
    const user = await this.usersService.validateUser(loginUserDto.username, loginUserDto.password);
    if (!user) {
        return { error: 'Credenciales inválidas' };
    }
    return user;
}






}
