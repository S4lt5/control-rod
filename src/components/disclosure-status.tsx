import { type disclosure, disclosureStatus } from '~/shared/finding';
import { FC } from 'react';
type props = {
  disclosure?: disclosure;
};
export const DisclosureStatusTag: React.FC<props> = ({ disclosure }) => {
  return (
    <span
      className={`m-2 w-min rounded  bg-white/80 p-1.5 capitalize text-black
     ${
       disclosure &&
       (disclosure.status == disclosureStatus.disclosed ||
         disclosure.status == disclosureStatus.uncertain)
         ? 'text-yellow-500'
         : ''
     }
   
      ${
        disclosure &&
        (disclosure.status == disclosureStatus.remediated ||
          disclosure.status == disclosureStatus.invalid)
          ? 'text-green-500'
          : ''
      }
        ${
          disclosure == null ||
          (disclosure && disclosure.status == disclosureStatus.remediated)
            ? 'text-red-500'
            : ''
        }
     `}
    >
      {!disclosure && 'Not Started'}
      {disclosure && disclosureStatus[disclosure.status]}
    </span>
  );
};
