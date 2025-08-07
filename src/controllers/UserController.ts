import {
  Controller,
  Get,
  Route,
  Tags,
  Security,
  Path,
  Request,
  Put,
  Body,
  Delete,
} from 'tsoa'
import { PrismaClient } from '@prisma/client'
import express from 'express'

const prisma = new PrismaClient()

type AuthRequest = express.Request & {
  user?: {
    id: number
    role: string
  }
}

@Route('users')
@Tags('Users')
export class UserController extends Controller {
  @Security('jwt')
  @Get('/')
  public async getAllUsers(@Request() req: AuthRequest) {
    if (req.user?.role !== 'ADMIN') {
      this.setStatus(403)
      return { message: 'Accès interdit : admin uniquement.' }
    }

    return prisma.user.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    })
  }

  @Security('jwt')
  @Get('{userId}')
  public async getUser(
    @Request() req: AuthRequest,
    @Path() userId: number
  ) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })

    if (!targetUser) {
      this.setStatus(404)
      return { message: 'Utilisateur introuvable' }
    }

    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      this.setStatus(403)
      return { message: 'Accès interdit' }
    }

    return targetUser
  }

  @Security('jwt')
  @Get('profile')
  public async getMyProfile(@Request() req: AuthRequest) {
    const userId = req.user?.id

    if (!userId) {
      this.setStatus(401)
      return { message: 'Utilisateur non authentifié' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    })

    if (!user) {
      this.setStatus(404)
      return { message: 'Utilisateur introuvable' }
    }

    return user
  }

  @Security('jwt')
  @Put('profile')
  public async updateMyProfile(
    @Request() req: AuthRequest,
    @Body() body: Partial<{ nom: string; prenom: string; password: string }>
  ) {
    const userId = req.user?.id

    if (!userId) {
      this.setStatus(401)
      return { message: 'Utilisateur non authentifié' }
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })

    if (!existingUser) {
      this.setStatus(404)
      return { message: 'Utilisateur introuvable' }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    })

    return updatedUser
  }

  @Security('jwt')
  @Put('{userId}')
  public async updateUser(
    @Request() req: AuthRequest,
    @Path() userId: number,
    @Body() body: Partial<{ nom: string; prenom: string; password: string }>
  ) {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } })

    if (!existingUser) {
      this.setStatus(404)
      return { message: 'Utilisateur introuvable' }
    }

    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      this.setStatus(403)
      return { message: 'Accès interdit' }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body,
    })

    return updatedUser
  }

  @Security('jwt')
  @Delete('{userId}')
  public async deleteUser(
    @Request() req: AuthRequest,
    @Path() userId: number
  ) {
    if (req.user?.role !== 'ADMIN') {
      this.setStatus(403)
      return { message: 'Accès interdit : admin uniquement.' }
    }

    await prisma.user.delete({ where: { id: userId } })
    return { message: 'Utilisateur supprimé' }
  }
}
