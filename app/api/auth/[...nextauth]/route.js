import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import 'dotenv/config';

//Callback URL:   http://localhost:3000/api/auth/callback/google
//http://localhost:3000/api/auth/callback/github

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});

export { handler as GET, handler as POST };
