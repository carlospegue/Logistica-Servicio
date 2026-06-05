import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import { Role } from '@prisma/client';

export class AuthService {
  async register(email: string, password: string, role: Role = 'OPERATOR') {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError('El email ya esta registrado', 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, role },
      select: { id: true, email: true, role: true },
    });
    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Credenciales invalidas', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Credenciales invalidas', 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
}