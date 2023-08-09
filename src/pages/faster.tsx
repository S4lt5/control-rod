/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '~/utils/api';
import { useAtom } from 'jotai';
import { atomSearch } from '~/shared/atoms';
import React, { useEffect, useRef } from 'react';
import { FindingsDetailBlock } from '~/components/findings/findings-detail-block';
import { SeverityLabel } from '~/components/findings/severity-label';
import { ScanInformationBlock } from '~/components/findings/scan-info-block';
import { stringify } from 'csv-stringify/sync';
import { FixedSizeList, FixedSizeListProps } from 'react-window';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { render } from 'react-dom';
import { Finding } from '@prisma/client';

const styles = {
  selected: {
    backgroundColor: 'black',
    height: '200px',
  },
  gutter: {
    scrollbarGutter: 'stable',
  },
  tableCell: {
    display: 'inline-block',
  },
  messagesContainer: {
    height: '100%',
    width: '100%',
  },
  newMessage: {
    backgroundColor: '#3578E5',
    borderRadius: '8px',
    color: '#FFFFFF',
    display: 'flex',
    fontFamily: 'Roboto, sans-serif',
    padding: '12px',
    width: '65%',
  },
  newMessageContainer: {
    display: 'flex',
    flex: '0 0 auto',
    width: '100%',
    height: '80px',
  },
};
const Home: NextPage = () => {
  const [expanded, setExpanded] = useState(-1);
  const [search] = useAtom(atomSearch);
  const [hideDisclosed, setHideDisclosed] = useState(true);

  const { data: findings, status: findingsStatus } =
    api.findings.getFindings.useQuery({
      search: search,
      hideDisclosed: hideDisclosed,
    });

  const generateCSV = () => {
    if (findings) {
      const csvData = stringify(findings, { header: true });
      const mediaType = 'data:text/csv;base64,';

      window.location.href = `${mediaType}${Buffer.from(csvData).toString(
        'base64'
      )}`;
    } else {
      return 'ERROR, Findings not available.';
    }
  };

  function Row({ index, style }) {
    return (
      <>
        {findings && findings[index] && findings[index] != undefined && (
          <div
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            style={style}
            className={`${
              // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              (index + 1) % 2 === 0 ? 'bg-white/5' : ''
            } ${
              expanded == index ? 'selected-finding' : ''
            }  h-48 overflow-hidden border-b-2 border-gray-400 hover:cursor-pointer hover:bg-white/20`}
          >
            <div
              style={styles.newMessageContainer}
              className="flex h-48 "
              onClick={() => {
                if (index == expanded) {
                  setExpanded(-1);
                } else {
                  setExpanded(index);
                }
              }}
            >
              <div className="inline-block w-48 flex-none border-r-2 border-gray-700 px-2">
                {findings[index]?.name}
              </div>
              <div className="justify-left inline-block w-24 flex-none border-r-2 border-gray-700  px-4 py-4">
                <SeverityLabel sval={findings[index]?.severity} />
              </div>
              <div className="min-w-48 inline-block w-64 flex-none  border-r-2 border-gray-700 px-2">
                {findings[index]?.host}
              </div>
              <div className="inline-block w-64 flex-auto overflow-hidden border-r-2  border-gray-700 px-2">
                {findings[index]?.description}
              </div>
              <div className="inline-block w-32 flex-none border-r-2  border-gray-700 px-2">
                {findings[index]?.disclosureStatus ?? 'Not Started'}
              </div>
              <div className="inline-block w-48 flex-none overflow-hidden  border-r-2 border-gray-700 px-2">
                {findings[index]?.template}
              </div>
            </div>
            {expanded == index && (
              <div className="flex flex-row ">
                <div className="w-24 shrink">
                  <button
                    className="align-center z-50 m-2 w-10 rotate-180 justify-center rounded bg-indigo-400 p-2 hover:bg-indigo-300"
                    onClick={(evt) => {
                      setExpanded(-1);
                    }}
                  >
                    <img alt="expand finding" src="expand.svg"></img>
                  </button>
                </div>
                <div className=" flex grow basis-1/2 flex-col justify-start py-4">
                  <FindingsDetailBlock
                    finding={findings[index]}
                  ></FindingsDetailBlock>
                </div>
                <div className="flex grow basis-1/2 flex-col  py-4 pl-4">
                  <ScanInformationBlock
                    finding={findings[index]}
                  ></ScanInformationBlock>
                  <ul className="mt-4 flex grow flex-col">
                    <li>
                      Disclosure Status:{' '}
                      {findings[index]?.disclosureStatus ?? 'Not Started'}
                    </li>
                    <li>
                      <Link
                        href={{
                          pathname: '/disclosures/new',
                          query: {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            nd_name: findings[index]?.name,
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            nd_host: findings[index]?.host,
                          },
                        }}
                      >
                        <button
                          className="my-2 inline-flex  items-center rounded bg-indigo-400 p-2 align-middle text-white hover:bg-indigo-300"
                          onClick={() => {
                            setExpanded(-1);
                          }}
                        >
                          <img
                            alt="create new disclosure"
                            className="mr-2 h-8 w-8 fill-white"
                            src="new-document.svg"
                          ></img>{' '}
                          <span>Create new disclosure</span>
                        </button>
                      </Link>
                    </li>
                    <li>Ticket Status: Unknown</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Findings</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container flex h-screen flex-col items-center justify-center gap-12 px-2 py-16 ">
        <div className="flex h-full w-full flex-col text-white">
          <div className="w-full justify-start">
            <input
              type="checkbox"
              checked={hideDisclosed}
              onChange={() => setHideDisclosed(!hideDisclosed)}
              className="m-2"
            />
            Hide disclosed findings
          </div>

          {findingsStatus && findingsStatus == 'loading' && (
            <button
              type="button"
              className="inline-flex cursor-not-allowed items-center rounded-md  bg-indigo-400 px-4 py-2 text-sm font-semibold leading-6 text-white shadow transition duration-150 ease-in-out"
              disabled
            >
              <svg
                className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth={4}
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </button>
          )}
          {findingsStatus &&
            findingsStatus != 'loading' &&
            findings &&
            findings.length == 0 && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-center text-2xl text-white">
                    No Findings found, have you run any scans?
                  </p>
                </div>
              </div>
            )}
          {findingsStatus &&
            findingsStatus != 'loading' &&
            findings &&
            findings.length > 0 && (
              <>
                <div
                  style={styles.gutter}
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

                  className={` flex h-8 w-full overflow-y-scroll border-b-2 border-gray-400 hover:cursor-pointer hover:bg-white/20`}
                >
                  <div style={styles.newMessageContainer}>
                    <div className="inline-block w-48 flex-none border-r-2 border-gray-700 px-2">
                      Name
                    </div>
                    <div className="justify-left inline-block w-24 flex-none border-r-2 border-gray-700  px-4">
                      Severity
                    </div>
                    <div className="min-w-48 inline-block w-64 flex-none  border-r-2 border-gray-700 px-2">
                      Host
                    </div>
                    <div className="inline-block w-64 flex-auto overflow-hidden border-r-2  border-gray-700 px-2">
                      Description
                    </div>
                    <div className="inline-block w-32 flex-none border-r-2  border-gray-700 px-2">
                      Disclosure
                    </div>
                    <div className="inline-block w-48 flex-none overflow-hidden  border-r-2 border-gray-700 px-2 ">
                      Template
                    </div>
                  </div>
                </div>
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      height={height}
                      itemCount={findings.length}
                      itemSize={(ix) => {
                        return ix.toString() == expanded.toString() ? 200 : 80;
                      }}
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      width={width}
                    >
                      {Row}
                    </List>
                  )}
                </AutoSizer>
              </>
            )}
        </div>
      </div>
    </>
  );
};

export default Home;
