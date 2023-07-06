/* eslint-disable @next/next/no-img-element */
import { type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import moment from 'moment';
import { api } from '~/utils/api';
import { useAtom } from 'jotai';
import { atomSearch } from '~/shared/atoms';
import { createCompareFn } from '~/shared/helpers';
import { SeverityLabel } from '~/components/findings/severity-label';
import { type Disclosure, disclosureStatus } from '@prisma/client';
import { stringify } from 'csv-stringify/sync';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function createFilterFn<T extends Disclosure>(query: string) {
  const filterFn = (d: Disclosure) => {
    const lowerQuery = query.toLowerCase();
    return (
      d.name.toLowerCase().includes(lowerQuery) ||
      d.description.toLowerCase().includes(lowerQuery) ||
      d.template.toLowerCase().includes(lowerQuery) ||
      d.severity.toLowerCase().includes(lowerQuery) ||
      d.hosts.includes(lowerQuery) ||
      d.status.toLowerCase().includes(lowerQuery)
    );
  };
  return filterFn;
}

const Home: NextPage = () => {
  const [editing, setEditing] = useState(''); //if the user is editing the status
  const [selectedStatusValue, setSelectedStatusValue] = useState('started'); //what the user has selected in the 'status' dropdown
  const [updatedTicketURL, setUpdatedTicketURL] = useState('');

  const [updatedNotes, setUpdatedNotes] = useState('');

  const [expanded, setExpanded] = useState('');
  const [search] = useAtom(atomSearch);
  const {
    data: disclosures,
    status: queryStatus,
    refetch: fetchDisclosures,
  } = api.disclosures.getDisclosures.useQuery();
  const generateDisclosureTemplate =
    api.disclosures.generateDisclosureTemplate.useMutation();
  const updateDisclosureStatus =
    api.disclosures.updateDisclosureStatus.useMutation();

  const generateCSV = () => {
    if (disclosures) {
      const csvData = stringify(disclosures, { header: true });
      const mediaType = 'data:text/csv;base64,';

      window.location.href = `${mediaType}${Buffer.from(csvData).toString(
        'base64'
      )}`;
    } else {
      return 'ERROR, Findings not available.';
    }
  };

  return (
    <>
      <Head>
        <title>Disclosures</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container flex flex-col items-center justify-center gap-12 px-2 py-16 ">
        <div className="flex h-full w-full flex-col text-white">
          <table className="table-auto">
            <thead className="borderb border-collapse border-gray-600 bg-white/10">
              <tr className="border border-gray-600">
                <th className="border border-gray-600">
                  <div
                    className="hover:cursor-pointer"
                    onClick={(e) => {
                      generateCSV();
                      e.preventDefault();
                    }}
                  >
                    <img
                      alt="export CSV"
                      className="float-left h-6"
                      src="/csv.png"
                    ></img>
                  </div>
                  Finding
                </th>
                <th className="border border-gray-600">Status</th>
                <th className="border border-gray-600">Hosts</th>

                <th className="border border-gray-600">Severity</th>
                <th className="border border-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {disclosures &&
                disclosures
                  .sort(createCompareFn('status', 'desc'))
                  .filter(createFilterFn(search))
                  .map((d) => (
                    <React.Fragment key={d.id}>
                      <tr
                        onClick={() => {
                          setExpanded(d.id);
                        }}
                        className="every_two_rows  hover:cursor-pointer hover:bg-white/20"
                      >
                        <td className="border border-y-0 border-l-0 border-gray-700  ">
                          {d.name}
                        </td>
                        <td className="border  border-y-0 border-l-0 border-gray-700  px-1 text-center  ">
                          {disclosureStatus[d.status]}
                        </td>
                        <td className="border border-y-0 border-l-0 border-gray-700 px-1">
                          <ul>
                            {d.hosts &&
                              d.hosts
                                .split('\n')
                                .map((h) => <li key={h}>{h}</li>)}
                          </ul>
                        </td>
                        <td className="h-12 border border-y-0 border-l-0 border-gray-700 px-1">
                          <SeverityLabel sval={d.severity}></SeverityLabel>
                        </td>
                        <td className="border border-y-0 border-l-0 border-gray-700 px-1">
                          {moment(d.timestamp).format('MM/DD/YY')}
                        </td>
                      </tr>
                      <tr
                        className="every_two_rows mt-4 border-x-2 border-y-2 border-gray-400"
                        key={`${d.id}-b`}
                      >
                        <td colSpan={5} className="" hidden={d.id !== expanded}>
                          <div className="flex flex-row ">
                            <div className="w-24 shrink">
                              <button
                                className="align-center m-2 w-10 rotate-180 justify-center rounded bg-indigo-400 p-2 hover:bg-indigo-300"
                                onClick={() => {
                                  setExpanded('');
                                }}
                              >
                                <img
                                  alt="expand finding"
                                  src="expand.svg"
                                ></img>
                              </button>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex flex-row">
                                <div className=" flex grow flex-col justify-start py-4">
                                  <SeverityLabel
                                    sval={d.severity}
                                  ></SeverityLabel>
                                  <p className=" my-2 justify-start  border-b-2 border-slate-400 text-xl">
                                    {d.name}
                                  </p>

                                  <p>{d.description}</p>
                                  <div className="my-4">
                                    <p>References</p>
                                    <ul className="ml-10">
                                      {d &&
                                        d.references &&
                                        d.references.split('\n').map((ref) => (
                                          <li className=" list-disc" key={ref}>
                                            <a
                                              className="text-slate-400  hover:underline"
                                              href={ref}
                                            >
                                              {ref}
                                            </a>
                                          </li>
                                        ))}
                                    </ul>
                                  </div>
                                  <div className="inline-flex items-start gap-2">
                                    <span>Status:</span>
                                    {editing != d.id && (
                                      <>
                                        <span>{d.status}</span>
                                        <span
                                          className="w-6 text-slate-400 hover:cursor-pointer"
                                          onClick={() => {
                                            setEditing(d.id);
                                            setSelectedStatusValue(d.status);
                                            setUpdatedTicketURL(d.ticketURL);
                                            setUpdatedNotes(d.notes);
                                          }}
                                        >
                                          [edit]
                                        </span>
                                      </>
                                    )}
                                    {editing == d.id && (
                                      <>
                                        <select
                                          defaultValue={d.status}
                                          className="bg-white text-black"
                                          onChange={(e) => {
                                            setSelectedStatusValue(
                                              e.target.value
                                            );
                                          }}
                                        >
                                          {Object.entries(disclosureStatus)
                                            .filter((k) => isNaN(Number(k[1]))) //value is not a number, value is the string rep

                                            .map(([key, value]) => (
                                              <option key={key} value={key}>
                                                {value}
                                              </option>
                                            ))}
                                        </select>
                                        <span></span>
                                        {(selectedStatusValue != d.status ||
                                          updatedTicketURL != d.ticketURL ||
                                          updatedNotes != d.notes) && (
                                          <span
                                            className=" text-slate-400 hover:cursor-pointer"
                                            onClick={() => {
                                              void updateDisclosureStatus
                                                .mutateAsync({
                                                  id: d.id,
                                                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                                  status:
                                                    selectedStatusValue as keyof typeof disclosureStatus,
                                                  ticketURL: updatedTicketURL,
                                                  notes: updatedNotes,
                                                })
                                                .catch(() => {
                                                  console.log(
                                                    'Error updating status value.'
                                                  );
                                                })
                                                .then(() => {
                                                  void fetchDisclosures();
                                                });
                                              setEditing('');
                                            }}
                                          >
                                            [save]
                                          </span>
                                        )}
                                        <span
                                          className="text-slate-400 hover:cursor-pointer"
                                          onClick={() => setEditing('')}
                                        >
                                          [cancel]
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex  flex-row justify-start">
                                    <div className="inline-flex items-start gap-2">
                                      <span>Ticket URL:</span>
                                      {editing != d.id && (
                                        <span>{d.ticketURL}</span>
                                      )}
                                      {editing == d.id && (
                                        <input
                                          className="bg-white text-black"
                                          value={updatedTicketURL}
                                          onChange={(e) => {
                                            setUpdatedTicketURL(e.target.value);
                                          }}
                                        />
                                      )}
                                    </div>
                                  </div>

                                  <div className="min-h-500">
                                    <div className="">Notes:</div>
                                    {editing != d.id && (
                                      <div className="">
                                        <div className="min-h-48 prose w-full bg-slate-600 text-white lg:prose-xl">
                                          <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                          >
                                            {d.notes}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    )}
                                    {editing == d.id && (
                                      <div className=" prose bg-white  text-black lg:prose-xl ">
                                        <textarea
                                          className="min-h-48 block h-full w-full w-full border-0"
                                          rows={8}
                                          value={updatedNotes}
                                          onChange={(e) => {
                                            setUpdatedNotes(e.target.value);
                                          }}
                                        ></textarea>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-row justify-start ">
                                    <button
                                      className="m-2  inline-flex items-center rounded bg-indigo-400 p-2 align-middle  text-white hover:bg-indigo-300"
                                      onClick={() => {
                                        void generateDisclosureTemplate
                                          .mutateAsync(d.id)
                                          .catch((e) => {
                                            alert(
                                              'something went wrong generating the dislcosure template.'
                                            );
                                          })
                                          .then((d) => {
                                            const mediaType =
                                              'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,';
                                            window.location.href = `${mediaType}${
                                              d ?? ''
                                            }`;
                                          });
                                      }}
                                    >
                                      <img
                                        alt="download template"
                                        className="w-10"
                                        src="/docx_icon.svg"
                                      ></img>
                                      Download Template
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
            </tbody>
          </table>
        </div>

        {queryStatus && queryStatus == 'loading' && (
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
        {queryStatus &&
          queryStatus != 'loading' &&
          disclosures &&
          disclosures.length == 0 && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col items-center justify-center gap-4">
                <p className="text-center text-2xl text-white">
                  No disclosures found.
                </p>
              </div>
            </div>
          )}
        {queryStatus && queryStatus == 'success' && (
          <Link
            className="ml-1 text-slate-400  hover:underline"
            href="/disclosures/new"
          >
            <button
              className="align-center m-2 justify-center rounded bg-indigo-400 p-2 text-white hover:bg-indigo-300"
              onClick={() => {
                setExpanded('');
              }}
            >
              Create New Disclosure
            </button>
          </Link>
        )}
      </div>
    </>
  );
};

export default Home;
