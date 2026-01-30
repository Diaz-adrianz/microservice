import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { prisma } from '../../../lib/prisma/index.js';
import { BadRequest } from '../../../middlewares/error.middleware.js';

export default new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          accounts: true,
          roles: true,
        },
      });
      if (!user)
        return done(new BadRequest('Email or password is incorrect'), false);
      if (!user.isVerified)
        return done(
          new BadRequest('Please verify your email to continue'),
          false
        );
      if (!user.isActive)
        return done(new BadRequest('Your account has been suspended'), false);

      const localAccount = user.accounts.find((a) => a.provider === 'local');
      if (!localAccount || !localAccount.password)
        return done(
          new BadRequest('Your account uses a different sign-in method'),
          false
        );

      const match = await bcrypt.compare(password, localAccount.password);
      if (!match)
        return done(new BadRequest('Email or password is incorrect'), false);

      return done(null, {
        id: user.id,
        roles: user.roles.filter((r) => r.isActive).map((r) => r.name),
      });
    } catch (err) {
      done(err);
    }
  }
);
