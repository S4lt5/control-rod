import { FC } from 'react';
import { severity } from '~/shared/finding';

type props = {
  sval: severity;
};
export const SeverityLabel: React.FC<props> = ({ sval }) => {
  return (
    <span
      className={`w-min capitalize ${
        sval == severity.critical ? ' rounded bg-red-400 p-2' : ''
      }
                        ${
                          sval == severity.high
                            ? ' rounded bg-orange-400 p-2'
                            : ''
                        }
                        ${
                          sval == severity.medium
                            ? ' rounded bg-yellow-400 p-2 text-black'
                            : ''
                        }
                         ${
                           sval == severity.low
                             ? ' rounded bg-green-400 p-2'
                             : ''
                         }
                            ${
                              sval == severity.info
                                ? 'rounded bg-white p-2 text-black'
                                : ''
                            }
                         `}
    >
      {severity[sval]}
    </span>
  );
};