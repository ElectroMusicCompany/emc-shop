import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "@/lib/prisma";
export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: {
        params: { scope: "identify guilds guilds.members.read" },
      },
    }),
  ],
  callbacks: {
    signIn: async ({ account }: any) => {
      const guild_id = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || "";
      const res = await fetch(
        `https://discord.com/api/users/@me/guilds/${guild_id}/member`,
        {
          headers: {
            Authorization: "Bearer " + account.access_token,
          },
        }
      );
      if (res.ok) {
        const user = await res.json();
        const role_id = process.env.NEXT_PUBLIC_DISCORD_ROLE_ID;
        if (role_id) {
          if (!user.roles.includes(role_id)) {
            return await false;
          }
        }
        await db.user.upsert({
          where: {
            id: user.user.id
          },
          update: {
            name: user.user.username,
            avatar: user.user.avatar
          },
          create: {
            id: user.user.id,
            name: user.user.username,
            avatar: user.user.avatar
          },
        });
      }
      return await res.ok;
    },
    session: async ({ session, token }: any) => {
      if (session?.user) {
        session.user.id = token.uid;
      }
      return session;
    },
    jwt: async ({ user, token }: any) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
};
export default NextAuth(authOptions);
