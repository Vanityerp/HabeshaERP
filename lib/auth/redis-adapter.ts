import type { Adapter } from '@auth/core/adapters';
import type { Redis } from 'ioredis';

export function RedisAdapter(client: Redis): Adapter {
  return {
    async createUser(user) {
      const newUser = { ...user, id: Math.random().toString(36).substring(2) }; // Simple ID generation
      await client.set(`user:${newUser.id}`, JSON.stringify(newUser));
      return newUser;
    },
    async getUser(id) {
      const userString = await client.get(`user:${id}`);
      if (!userString) return null;
      return JSON.parse(userString);
    },
    async getUserByEmail(email) {
      const userId = await client.get(`user:email:${email}`);
      if (!userId) return null;
      return this.getUser(userId);
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const accountId = `${provider}:${providerAccountId}`;
      const userId = await client.get(`account:${accountId}`);
      if (!userId) return null;
      return this.getUser(userId);
    },
    async updateUser(user) {
      if (!user.id) return null as any;
      await client.set(`user:${user.id}`, JSON.stringify(user));
      if (user.email) {
        await client.set(`user:email:${user.email}`, user.id);
      }
      return user;
    },
    async deleteUser(userId) {
      const user = await this.getUser(userId);
      if (!user) return;

      await client.del(`user:${userId}`);
      if (user.email) {
        await client.del(`user:email:${user.email}`);
      }
      // TODO: Delete sessions and accounts associated with this user
      return;
    },
    async linkAccount(account) {
      const accountId = `${account.provider}:${account.providerAccountId}`;
      await client.set(`account:${accountId}`, account.userId);
      await client.set(`account:${account.id}`, JSON.stringify(account));
      return account;
    },
    async unlinkAccount({ providerAccountId, provider }) {
      const accountId = `${provider}:${providerAccountId}`;
      const accountString = await client.get(`account:${accountId}`);
      if (!accountString) return;
      const account = JSON.parse(accountString);
      await client.del(`account:${accountId}`);
      await client.del(`account:${account.id}`);
      return;
    },
    async createSession({ sessionToken, userId, expires }) {
      const session = { sessionToken, userId, expires };
      await client.set(`session:${sessionToken}`, JSON.stringify(session), 'EXAT', Math.floor(expires.getTime() / 1000));
      return session;
    },
    async getSessionAndUser(sessionToken) {
      const sessionString = await client.get(`session:${sessionToken}`);
      if (!sessionString) return null;

      const session = JSON.parse(sessionString);
      const user = await this.getUser(session.userId);

      if (!user) return null;

      return { session: { ...session, expires: new Date(session.expires) }, user };
    },
    async updateSession({ sessionToken, userId, expires }) {
      const sessionString = await client.get(`session:${sessionToken}`);
      if (!sessionString) return null;

      const session = JSON.parse(sessionString);
      const updatedSession = { ...session, userId, expires };
      await client.set(`session:${sessionToken}`, JSON.stringify(updatedSession), 'EXAT', Math.floor(expires!.getTime() / 1000));
      return updatedSession;
    },
    async deleteSession(sessionToken) {
      await client.del(`session:${sessionToken}`);
      return;
    },
    async createVerificationToken({ identifier, expires, token }) {
      const verificationToken = { identifier, expires, token };
      await client.set(`verificationToken:${token}`, JSON.stringify(verificationToken), 'EXAT', Math.floor(expires.getTime() / 1000));
      return verificationToken;
    },
    async useVerificationToken({ identifier, token }) {
      const tokenString = await client.get(`verificationToken:${token}`);
      if (!tokenString) return null;

      const verificationToken = JSON.parse(tokenString);
      if (verificationToken.identifier === identifier) {
        await client.del(`verificationToken:${token}`);
        return verificationToken;
      }
      return null;
    },
  };
}