import { FC } from 'react';
import { SeverityLabel } from './severity-label';
import { Finding } from '@prisma/client';
type props = {
  finding: Finding;
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
            finding.references &&
            finding.references.split('\n').map((ref) => (
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
