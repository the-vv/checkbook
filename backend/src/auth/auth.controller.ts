import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body(ValidationPipe) dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body(ValidationPipe) dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
