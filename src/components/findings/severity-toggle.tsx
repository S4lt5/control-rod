import { severity } from '@prisma/client';
import { FC } from 'react';

const styles = {
  inactive: {
    background:
      'repeating-linear-gradient(135deg, red, 2px,  transparent 1px, transparent 10px) ',
  },
};
type props = {
  sval: severity | undefined;
  activated: boolean | undefined;
  onToggle: React.Dispatch<React.SetStateAction<boolean>>;
};
/* A toggle button that turns the particular severity on or off, useful for filter settings */
export const SeverityToggle: React.FC<props> = ({
  sval,
  activated,
  onToggle,
}) => {
  return (
    <button
      onClick={() => onToggle(!activated)}
      className={`w-min capitalize ${
        sval == severity.critical
          ? !activated
            ? 'btn outline-3 rounded bg-red-400 p-2 outline'
            : 'btn rounded bg-gray-500 p-2'
          : ''
      }
                        ${
                          sval == severity.high
                            ? !activated
                              ? ' outline-3 rounded bg-orange-400 p-2 outline'
                              : ' btn rounded bg-gray-500 p-2'
                            : ''
                        }
                        ${
                          sval == severity.medium
                            ? !activated
                              ? '  outline-3 rounded bg-yellow-400 p-2 text-black outline outline-white'
                              : ' btn rounded bg-gray-500 p-2 text-white'
                            : ''
                        }
                         ${
                           sval == severity.low
                             ? !activated
                               ? ' outline-3 rounded bg-green-400 p-2 outline'
                               : ' btn rounded bg-gray-500 p-2 text-white'
                             : ''
                         }
                            ${
                              sval == severity.info
                                ? !activated
                                  ? 'outline-3 rounded bg-white p-2 text-black outline  outline-gray-200'
                                  : 'btn rounded bg-gray-500 p-2 text-white'
                                : ''
                            }
                         `}
    >
      {sval && severity[sval]}
      {!sval && 'ERROR!'}
    </button>
  );
};
