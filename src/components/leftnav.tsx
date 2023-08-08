import { type NextComponentType } from 'next';
import { PropsWithChildren } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export const LeftNav = () => {
  const router = useRouter();
  return (
    <nav aria-label="alternative nav">
      <div className="z-5 fixed bottom-0 mt-12 h-20 w-full content-center bg-gray-800 shadow-xl  md:h-screen md:w-48">
        <div className="content-center justify-between text-left md:fixed md:left-0 md:top-0 md:mt-12 md:w-48 md:content-start">
          <ul className="list-reset flex flex-row px-1 pt-3 text-center md:flex-col md:px-2 md:py-3 md:text-left">
            <li className="mr-3 flex-1">
              <Link
                href="/"
                className={`block border-b-2  hover:border-pink-500  ${
                  router.pathname == '/'
                    ? 'border-pink-500'
                    : 'border-transparent'
                } py-1 pl-1 align-middle text-white no-underline hover:text-white md:py-3`}
              >
                <i className="fas fa-tasks pr-0 md:pr-3"></i>
                <span className="block pb-1 text-xs text-gray-400 md:inline-block md:pb-0 md:text-base md:text-gray-200">
                  Findings
                </span>
              </Link>
            </li>
            <li className="mr-3 flex-1">
              <Link
                href="/faster"
                className={`block border-b-2  hover:border-pink-500  ${
                  router.pathname == '/faster'
                    ? 'border-pink-500'
                    : 'border-transparent'
                } py-1 pl-1 align-middle text-white no-underline hover:text-white md:py-3`}
              >
                <i className="fas fa-tasks pr-0 md:pr-3"></i>
                <span className="block pb-1 text-xs text-gray-400 md:inline-block md:pb-0 md:text-base md:text-gray-200">
                  Fast Findings (Test)
                </span>
              </Link>
            </li>
            <li className="mr-3 flex-1">
              <Link
                href="/disclosures"
                className={`block  border-b-2 ${
                  router.pathname.includes('disclosures')
                    ? 'border-blue-600'
                    : 'border-transparent'
                } py-1 pl-1 align-middle text-white no-underline hover:border-blue-600 hover:text-white md:py-3`}
              >
                <i className="fas fa-chart-area pr-0 text-blue-600 md:pr-3"></i>
                <span className="block pb-1 text-xs text-white md:inline-block md:pb-0 md:text-base md:text-white">
                  Disclosures
                </span>
              </Link>
            </li>
            <li className="mr-3 flex-1">
              <a
                href="#"
                className={`block border-b-2 
                ${
                  router.pathname == '/hosts'
                    ? 'border-purple-500'
                    : 'border-transparent'
                }
                py-1 pl-1 align-middle text-white no-underline hover:border-purple-500 hover:text-white md:py-3`}
              >
                <i className="fa fa-envelope pr-0 md:pr-3"></i>
                <span className="block pb-1 text-xs text-gray-400 md:inline-block md:pb-0 md:text-base md:text-gray-200">
                  Hosts
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
