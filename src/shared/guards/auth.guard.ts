import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header')
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header format. Expected: Bearer <token>')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const expectedToken = this.configService.get<string>('app.authBearerToken')

    if (!expectedToken) {
      throw new UnauthorizedException('Server configuration error: AUTH_BEARER_TOKEN not set')
    }

    if (token !== expectedToken) {
      throw new UnauthorizedException('Invalid token')
    }

    return true
  }
}
