import { signIn, signOut, useSession } from 'next-auth/react';
import { useAtom } from 'jotai';

import { useRef, useEffect } from 'react';
import { atomSearch } from '~/shared/atoms';
type Timer = ReturnType<typeof setTimeout>;
type SomeFunction = (...args: any[]) => void;

export const NavBar = () => {
  const { data: sessionData } = useSession();
  const [search, setSearch] = useAtom(atomSearch);
  return (
    <header>
      <nav
        aria-label="menu nav"
        className="fixed top-0 z-10 mt-0 h-auto w-full bg-gray-800 px-1 pb-1 pt-2 md:pt-1"
      >
        <div className="flex flex-wrap items-center">
          <div className="flex flex-shrink  text-white md:w-48 ">
            <a href="#" aria-label="Home">
              <span className="pl-2 text-xl ">
                Control Rod<i className="em em-grinning"></i>
              </span>
            </a>
          </div>

          <div className="flex flex-1 justify-center text-white md:w-full md:justify-start ">
            <span className="relative w-full">
              <input
                aria-label="search"
                type="search"
                id="search"
                placeholder="Search"
                className="w-full appearance-none rounded border border-transparent bg-gray-900 px-2 py-3 pl-10 leading-normal text-white transition focus:border-gray-400 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div
                className="search-icon absolute"
                style={{ top: '1rem', left: '.8rem' }}
              >
                <svg
                  className="pointer-events-none h-4 w-4 fill-current text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"></path>
                </svg>
              </div>
            </span>
          </div>

          <div className="flex  content-center justify-between pt-2 md:w-1/6 md:justify-end">
            <ul className="list-reset flex flex-1 items-center justify-between md:flex-none">
              <li className="flex-1 md:mr-3 md:flex-none">
                <div className="relative inline-block">
                  <button
                    onClick={
                      sessionData ? () => void signOut() : () => void signIn()
                    }
                    className="drop-button rounded px-2 py-2 text-white hover:bg-white/20"
                  >
                    {sessionData ? (
                      <span>Hi, {sessionData.user?.name}</span>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                  <div
                    id="myDropdown"
                    className="dropdownlist invisible absolute right-0 z-30 mt-3 overflow-auto bg-gray-800 p-3 text-white"
                  >
                    <input
                      type="text"
                      className="drop-search p-2 text-gray-600"
                      placeholder="Search.."
                      id="myInput"
                    />
                    <a
                      href="#"
                      className="block p-2 text-sm text-white no-underline hover:bg-gray-800 hover:no-underline"
                    >
                      <i className="fa fa-user fa-fw"></i> Profile
                    </a>
                    <a
                      href="#"
                      className="block p-2 text-sm text-white no-underline hover:bg-gray-800 hover:no-underline"
                    >
                      <i className="fa fa-cog fa-fw"></i> Settings
                    </a>
                    <div className="border border-gray-800"></div>
                    <a
                      href="#"
                      className="block p-2 text-sm text-white no-underline hover:bg-gray-800 hover:no-underline"
                    >
                      <i className="fas fa-sign-out-alt fa-fw"></i> Log Out
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};
