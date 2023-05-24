import { FC } from 'react';
import { finding } from '~/shared/finding';
import { SeverityLabel } from './severity-label';
type props = {
  finding: finding;
};
export const FindingsDetailBlock: React.FC<props> = ({ finding }) => {
  return (
    <>
      <SeverityLabel sval={finding.severity}></SeverityLabel>
      <p className=" my-2 justify-start  border-b-2 border-slate-400 text-xl">
        {finding.name}
      </p>

      <p>{finding.description}</p>
      <div className="my-4">
        <p>References</p>
        <ul className="ml-10">
          {finding &&
            finding.reference &&
            finding.reference.map((ref) => (
              <li className=" list-disc" key={ref}>
                <a className="text-slate-400  hover:underline" href={ref}>
                  {ref}
                </a>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};
