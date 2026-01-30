import type { Request, Response } from 'express';
import BaseController from '../../base/controller.base.js';
import { authService, AuthService } from './auth.service.js';
import { Unauthenticated } from '../../middlewares/error.middleware.js';
import { settings } from '../../config/settings.js';
import { env } from '../../config/env.js';
import { SignUp } from './auth.schema.js';

class AuthController extends BaseController {
  #service: AuthService;

  constructor() {
    super();
    this.#service = authService;
  }

  verify = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization?.split(' ')[1]
      : null;

    let payload;
    try {
      payload = await this.#service.verifyAccess(token ?? '');
    } catch {
      payload = null;
    }

    if (payload) {
      res.setHeader('X-User-Id', payload.sub);
      res.setHeader('X-User-Roles', payload.rls);
    }

    return this.noContent(res);
  };

  signUp = async (req: Request<{}, {}, SignUp>, res: Response) => {
    const data = await this.#service.signUp(req.body);
    return this.success(res, data, 'User signed up using email and password');
  };

  signIn = async (req: Request, res: Response) => {
    if (!req.user) throw new Unauthenticated();
    const { at, rt, user } = await this.#service.signIn(req.user);
    res.cookie('rt', rt, {
      httpOnly: true,
      secure: !env.isDevelopment,
      sameSite: 'lax',
      maxAge: settings.TOKEN_REFRESH_EXP * 1000,
    });
    return this.success(
      res,
      { user, tokens: { at } },
      'User signed in using email and password'
    );
  };

  refreshToken = async (req: Request, res: Response) => {
    if (!req.cookies.rt) throw new Unauthenticated();
    const { at } = await this.#service.refreshToken(req.cookies.rt);
    return this.success(res, { tokens: { at } }, 'User session extended');
  };

  signOut = async (req: Request, res: Response) => {
    if (!req.cookies.rt) throw new Unauthenticated();
    await this.#service.signOut(req.cookies.rt);
    res.clearCookie('rt');
    return this.noContent(res);
  };

  signOutAll = async (req: Request, res: Response) => {
    if (!req.user?.id) throw new Unauthenticated();
    await this.#service.signOutAll(req.user.id);
    res.clearCookie('rt');
    return this.noContent(res);
  };
}

const authController = new AuthController();
export { authController, AuthController };
