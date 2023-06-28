import { type disclosure, disclosureStatus } from '~/shared/finding';
import { FC } from 'react';
type props = {
  disclosure?: disclosure;
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
