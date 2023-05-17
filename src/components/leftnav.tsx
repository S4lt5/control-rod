import { type NextComponentType } from "next";
import { PropsWithChildren } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export const LeftNav = (props: PropsWithChildren) => {
  return (
    <nav aria-label="alternative nav">
      <div className="fixed bottom-0 z-10 mt-12 h-20 w-full content-center bg-gray-800 shadow-xl md:relative md:h-screen md:w-48">
        <div className="content-center justify-between text-left md:fixed md:left-0 md:top-0 md:mt-12 md:w-48 md:content-start">
          <ul className="list-reset flex flex-row px-1 pt-3 text-center md:flex-col md:px-2 md:py-3 md:text-left">
            <li className="mr-3 flex-1">
              <a
                href="#"
                className="block border-b-2 border-pink-500 py-1 pl-1 align-middle text-white no-underline hover:text-white md:py-3"
              >
                <i className="fas fa-tasks pr-0 md:pr-3"></i>
                <span className="block pb-1 text-xs text-gray-400 md:inline-block md:pb-0 md:text-base md:text-gray-200">
                  Findings
                </span>
              </a>
            </li>
            <li className="mr-3 flex-1">
              <a
                href="#"
                className="block border-b-2 border-gray-800 py-1 pl-1 align-middle text-white no-underline hover:border-purple-500 hover:text-white md:py-3"
              >
                <i className="fa fa-envelope pr-0 md:pr-3"></i>
                <span className="block pb-1 text-xs text-gray-400 md:inline-block md:pb-0 md:text-base md:text-gray-200">
                  Hosts
                </span>
              </a>
            </li>
            <li className="mr-3 flex-1">
              <a
                href="#"
                className="block border-b-2 border-gray-800 py-1 pl-1 align-middle text-white no-underline hover:border-blue-600 hover:text-white md:py-3"
              >
                <i className="fas fa-chart-area pr-0 text-blue-600 md:pr-3"></i>
                <span className="block pb-1 text-xs text-white md:inline-block md:pb-0 md:text-base md:text-white">
                  Disclosures
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
