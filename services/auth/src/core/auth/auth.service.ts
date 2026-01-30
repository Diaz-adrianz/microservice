import BaseService from '../../base/service.base.js';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

import { prisma } from '../../lib/prisma/index.js';
import { redis } from '../../lib/redis/index.js';
import { settings } from '../../config/settings.js';
import { env } from '../../config/env.js';
import { generateId, sha256 } from '../../utils/string.js';
import {
  BadRequest,
  Unauthenticated,
} from '../../middlewares/error.middleware.js';
import {
  AccessPayload,
  RefreshPayload,
  SessionCache,
  SignUp,
} from './auth.schema.js';
import { userService } from '../user/user.service.js';

class AuthService extends BaseService {
  #cache;
  #userService;

  constructor() {
    super(prisma);
    this.#cache = redis;
    this.#userService = userService;
  }

  keySession = (sid: string) => `ssn:${sid}`;
  private keyRefresh = (hash: string) => `rt:${hash}`;
  private keySessions = (sub: string) => `ssns:${sub}`;

  signUp = async (payload: SignUp) => {
    const sameEmail = await this.db.user.count({
      where: { email: payload.email },
    });
    if (sameEmail) throw new BadRequest('Email already used');

    const user = await this.#userService.create({
      ...payload,
      roleName: 'User',
    });
    // TODO: publish event auth.signup

    return user;
  };

  signIn = async (user: Express.User) => {
    const userData = await this.db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        roles: { where: { isActive: true }, select: { id: true, name: true } },
      },
    });

    const sid = generateId();
    const acc: AccessPayload = {
      sub: userData.id,
      rls: userData.roles.map((r) => r.name),
      sid,
    };

    const { token: at } = this.signAccessToken(acc);
    const { raw: rt, hash: rtHash } = this.signRefreshToken();

    const rtKey = this.keyRefresh(rtHash);
    const ref: RefreshPayload = {
      sub: acc.sub,
      rls: acc.rls,
      sid: acc.sid,
    };

    const sesKey = this.keySession(sid);
    const ses: SessionCache = {
      sub: acc.sub,
      sid: acc.sid,
      rtHash,
      createdAt: Date.now(),
    };

    const multi = this.#cache.multi();
    multi.set(rtKey, JSON.stringify(ref), 'EX', settings.TOKEN_REFRESH_EXP);
    multi.set(sesKey, JSON.stringify(ses), 'EX', settings.TOKEN_REFRESH_EXP);
    multi.sadd(this.keySessions(acc.sub), sid);
    await multi.exec();

    return { user: userData, at, rt };
  };

  refreshToken = async (oldRt: string) => {
    if (!oldRt) throw new Unauthenticated();

    const rtHash = sha256(oldRt),
      rtKey = this.keyRefresh(rtHash);

    const refc = await this.#cache.get(rtKey);
    if (!refc) throw new Unauthenticated();

    const ref = JSON.parse(refc) as RefreshPayload;

    const sesc = await this.#cache.get(this.keySession(ref.sid));
    if (!sesc) throw new Unauthenticated();

    const ses = JSON.parse(sesc) as SessionCache;

    if (ses.rtHash !== rtHash) throw new Unauthenticated();

    const acc: AccessPayload = {
      sub: ref.sub,
      rls: ref.rls,
      sid: ref.sid,
    };
    const { token: at } = this.signAccessToken(acc);

    return { at };
  };

  signOut = async (rt: string) => {
    if (!rt) throw new Unauthenticated();

    const rtHash = sha256(rt);
    const rtKey = this.keyRefresh(rtHash);

    const refresh = await this.#cache.get(rtKey);
    if (!refresh) throw new Unauthenticated();

    const ref = JSON.parse(refresh) as RefreshPayload;

    const multi = this.#cache.multi();
    multi.del(rtKey);
    multi.del(this.keySession(ref.sid));
    multi.srem(this.keySessions(ref.sub), ref.sid);
    await multi.exec();
  };

  signOutAll = async (sub: string) => {
    const sids = await this.#cache.smembers(this.keySessions(sub));
    if (!sids.length) return;

    const multi = this.#cache.multi();

    for (const sid of sids) {
      const sesc = await this.#cache.get(this.keySession(sid));
      if (!sesc) {
        multi.del(this.keySession(sid));
        continue;
      }
      const ses = JSON.parse(sesc) as SessionCache;
      if (ses.rtHash) multi.del(this.keyRefresh(ses.rtHash));

      multi.del(this.keySession(sid));
    }

    multi.del(this.keySessions(sub));
    await multi.exec();
  };

  revokeSession = async (sub: string, sid: string) => {
    const sesc = await this.#cache.get(this.keySession(sid));
    if (sesc) {
      const ses = JSON.parse(sesc) as SessionCache;
      if (ses.rtHash) await this.#cache.del(this.keyRefresh(ses.rtHash));
    }

    const multi = this.#cache.multi();
    multi.del(this.keySession(sid));
    multi.srem(this.keySessions(sub), sid);
    await multi.exec();
  };

  verifyAccess = async (token: string) => {
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        issuer: env.JWT_ISSUER,
      }) as AccessPayload;
    } catch {
      throw new Unauthenticated();
    }
    const ses = await this.#cache.get(this.keySession(payload.sid));
    if (!ses) throw new Unauthenticated();

    return payload;
  };

  private signRefreshToken = () => {
    const raw = crypto.randomBytes(48).toString('base64url');
    const hash = sha256(raw);
    return { raw, hash };
  };

  private signAccessToken = (payload: AccessPayload) => {
    const jti = generateId();
    const token = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: settings.TOKEN_ACCESS_EXP,
      issuer: env.JWT_ISSUER,
      jwtid: jti,
    });
    return { token };
  };
}

const authService = new AuthService();
export { authService, AuthService };
