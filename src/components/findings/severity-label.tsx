import { severity } from '@prisma/client';
import { FC } from 'react';

type props = {
  sval: severity | undefined;
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
      {sval && severity[sval]}
      {!sval && 'ERROR!'}
    </span>
  );
};
