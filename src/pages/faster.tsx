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
  },
};
const Home: NextPage = () => {
  const [expanded, setExpanded] = useState('');
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
        {findings && (
          <div
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            style={style}
            className={`${
              // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              (index + 1) % 2 === 0 ? 'bg-white/5' : ''
            }  border-b-2 border-gray-400 hover:cursor-pointer hover:bg-white/20`}
          >
            <div style={styles.newMessageContainer}>
              <div className="inline-block w-32">{findings[index]?.name}</div>
              <div className="inline-block w-32">
                <SeverityLabel sval={findings[index]?.severity} />
              </div>
              <div className="inline-block w-64">{findings[index]?.host}</div>
              <div className="inline-block w-64">
                {findings[index]?.description}
              </div>
              <div className="inline-block w-32">
                {findings[index]?.disclosureStatus ?? 'Not Started'}
              </div>
              <div className="inline-block w-32">
                {findings[index]?.template}
              </div>
            </div>
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
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    height={height}
                    itemCount={findings.length}
                    itemSize={() => 75}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    width={width}
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            )}
        </div>
      </div>
    </>
  );
};

export default Home;
