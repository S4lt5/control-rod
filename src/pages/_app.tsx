import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { PageLayout } from '~/components/layout';
import { api } from '~/utils/api';

import '~/styles/globals.css';
import { NavBar } from '~/components/navbar';
import { LeftNav } from '~/components/leftnav';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
