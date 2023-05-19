import { type NextComponentType } from 'next';
import { PropsWithChildren } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { NavBar } from './navbar';
import { LeftNav } from './leftnav';
export const PageLayout = (props: PropsWithChildren) => {
  return (
    <>
      <NavBar></NavBar>
      <LeftNav></LeftNav>
      <main className="static min-h-screen items-start bg-slate-900 pl-48">
        {props.children}
      </main>
    </>
  );
};
