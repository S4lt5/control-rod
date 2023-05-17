import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { NavBar } from "~/components/navbar";
import { LeftNav } from "~/components/leftnav";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <NavBar></NavBar>
      <main className="flex min-h-screen flex-row items-start justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <LeftNav></LeftNav>
      
      <Component {...pageProps} />
      </main>
      
      
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
