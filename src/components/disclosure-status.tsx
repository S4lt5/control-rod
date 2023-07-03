import { Disclosure, disclosureStatus } from '@prisma/client';
import { FC } from 'react';
type props = {
  disclosure?: Disclosure;
};
export const DisclosureStatusTag: React.FC<props> = ({ disclosure }) => {
  return (
    <span
      className={` w-min rounded capitalize
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
          !disclosure ||
          (disclosure && disclosure.status == disclosureStatus.regression)
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
