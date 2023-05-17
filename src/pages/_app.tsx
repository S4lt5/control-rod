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
  const findings = api.example.hello.useQuery({ text: "from tRPC" });
  return (
    <SessionProvider session={session}>
      <NavBar></NavBar>
      <main className="flex min-h-screen flex-row items-start  bg-gradient-to-b from-[#161636] to-[#080811]">
        <LeftNav></LeftNav>

        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
