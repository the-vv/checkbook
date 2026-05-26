import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name: string) {
    const user = await this.usersService.create(email, password, name);
    return this.generateToken(user.id, user.email, user.name);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.generateToken(user.id, user.email, user.name);
  }

  private generateToken(id: number, email: string, name: string) {
    const payload = { sub: id, email };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id, email, name },
    };
  }
}
