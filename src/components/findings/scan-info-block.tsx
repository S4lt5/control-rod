import { FC } from 'react';
import { type finding } from '~/shared/finding';
import moment from 'moment';
type props = {
  finding: finding;
};
export const ScanInformationBlock: React.FC<props> = ({ finding }) => {
  return (
    <ul className="flex grow flex-col justify-start ">
      <li> Scan Information: </li>
      <li>
        Host:
        <a className="ml-2 text-slate-400 hover:underline" href={finding.host}>
          {finding.host}
        </a>
      </li>
      <li>
        Template:
        <a
          className="ml-2 text-slate-400 hover:underline"
          href={
            'https://github.com/projectdiscovery/nuclei-templates/tree/main/' +
            finding.template
          }
        >
          {finding.template}
        </a>
      </li>
      <li>
        Matched At:
        <a
          className="ml-2 text-slate-400 hover:underline"
          href={finding.matchedAt}
        >
          {finding.matchedAt}
        </a>
      </li>
      <li>Last Seen: {moment(finding.timestamp).format('MM/DD/YY kk:mm')}</li>
    </ul>
  );
};
