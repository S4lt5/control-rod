import { type NextComponentType } from 'next';
import { PropsWithChildren } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { NavBar } from './navbar';
import { LeftNav } from './leftnav';
export const PageLayout = (props: PropsWithChildren) => {
  return (
    <>
      <NavBar></NavBar>
      <main className="flex min-h-screen flex-row items-start  bg-gradient-to-b from-[#161636] to-[#080811]">
        <LeftNav></LeftNav>
        {props.children}
      </main>
    </>
  );
};
