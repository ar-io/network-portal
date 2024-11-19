import { Dialog, DialogPanel } from '@headlessui/react';
import {
  CaretDoubleRightIcon,
  CheckSquareIcon,
  FailSquareIcon,
  SortAsc,
  SortDesc,
  TimerIcon,
} from '@src/components/icons';
import { ArNSAssessment, Assessment } from '@src/types';
import { useState } from 'react';
import Bubble from './Bubble';
import Placeholder from './Placeholder';

const extraTimingsLabels: Record<string, string> = {
  dns: 'DNS',
  download: 'Download',
  firstByte: 'First Byte',
  request: 'Request',
  tcp: 'TCP',
  tls: 'TLS',
  wait: 'Wait',
};

const ArNSAssessmentPanel = ({
  arnsName,
  arnsAssessment,
  chosen,
}: {
  arnsName: string;
  arnsAssessment: ArNSAssessment;
  chosen: boolean;
}) => {
  const [timingsPanelOpen, setTimingsPanelOpen] = useState(false);

  return (
    <div className="rounded border border-grey-500 text-xs">
      <div className="p-3">
        <div className="flex">
          <div className="text-sm text-high">{arnsName}</div>
          <div className="flex grow justify-end">
            <Bubble value={arnsAssessment.pass} additionalClasses="text-xs" />
          </div>
        </div>
        <div className="text-mid">
          {chosen ? 'Chosen Name' : 'Prescribed Name'}
        </div>
        <div className="mt-2 flex gap-1">
          <div>
            {arnsAssessment.expectedStatusCode ===
            arnsAssessment.resolvedStatusCode ? (
              <CheckSquareIcon className="size-5" />
            ) : (
              <FailSquareIcon className="size-5" />
            )}
          </div>
          <div className="flex grow items-center text-high">
            <div>
              Status Code:{' '}
              <span className="text-mid">
                {arnsAssessment.resolvedStatusCode == 404
                  ? '404 (Unregistered ArNS Name)'
                  : arnsAssessment.resolvedStatusCode}
              </span>
            </div>
          </div>
        </div>
        {arnsAssessment.expectedStatusCode !==
          arnsAssessment.resolvedStatusCode && (
          <div className="pl-6 italic">
            Expected: {arnsAssessment.expectedStatusCode}
          </div>
        )}
        <div className="flex gap-1">
          <div>
            {arnsAssessment.expectedId === arnsAssessment.resolvedId ? (
              <CheckSquareIcon className="size-5" />
            ) : (
              <FailSquareIcon className="size-5" />
            )}
          </div>
          <div className="flex grow items-center text-high">
            <div>
              ID:{' '}
              <span className="text-mid">
                {arnsAssessment.resolvedId
                  ? arnsAssessment.resolvedId
                  : 'Not Found'}
              </span>
            </div>
          </div>
        </div>
        {arnsAssessment.expectedId !== arnsAssessment.resolvedId && (
          <div className="pl-6 italic">
            Expected: {arnsAssessment.expectedId}
          </div>
        )}
        <div className="flex gap-1">
          <div>
            {arnsAssessment.expectedDataHash ===
            arnsAssessment.resolvedDataHash ? (
              <CheckSquareIcon className="size-5" />
            ) : (
              <FailSquareIcon className="size-5" />
            )}
          </div>
          <div className="flex grow items-center text-high">
            <div>
              Data Hash:{' '}
              <span className="text-mid">
                {arnsAssessment.resolvedDataHash
                  ? arnsAssessment.resolvedDataHash
                  : 'Not Found'}
              </span>
            </div>
          </div>
        </div>
        {arnsAssessment.expectedDataHash !==
          arnsAssessment.resolvedDataHash && (
          <div className="pl-6 italic">
            Expected: {arnsAssessment.expectedDataHash}
          </div>
        )}
        {!arnsAssessment.pass && arnsAssessment.failureReason && (
          <div className="pt-3 italic">
            Failure Reason: {arnsAssessment.failureReason}
          </div>
        )}
      </div>
      {arnsAssessment.timings && (
        <div className="border-t border-grey-500">
          <div className="flex p-3">
            <div className="grow">Timings</div>
            <button onClick={() => setTimingsPanelOpen(!timingsPanelOpen)}>
              {timingsPanelOpen ? <SortAsc /> : <SortDesc />}
            </button>
          </div>
          {timingsPanelOpen && arnsAssessment.timings && (
            <div className="flex flex-col gap-1 px-3 pb-3">
              <div className="flex gap-1">
                <TimerIcon className="size-4" />
                <div className="text-high">
                  Total: {arnsAssessment.timings.total} ms
                </div>
              </div>
              {Object.entries(extraTimingsLabels)
                .filter(([key]) => arnsAssessment.timings![key] !== undefined)
                .map(([key, label]) => {
                  return (
                    <div className="pl-5 text-low" key={key}>
                      {label}: {arnsAssessment.timings![key]} ms
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AssessmentDetailsPanel = ({
  observedHost,
  assessment,
  onClose,
}: {
  observedHost?: string;
  assessment: Assessment;
  onClose: () => void;
}) => {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-10">
      <div
        className="fixed inset-0 w-screen bg-neutrals-1100/80"
        aria-hidden="true"
      />

      <div className="fixed right-0 top-0 h-screen w-[36rem]">
        <DialogPanel
          className={
            'relative flex h-full flex-col bg-grey-800 text-sm text-mid'
          }
        >
          <div className="border-b border-grey-500 p-3">
            <CaretDoubleRightIcon
              className="cursor-pointer"
              onClick={() => onClose()}
            />
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto p-8 scrollbar">
            <div className="text-xl text-high">Observation Details</div>

            <div className="flex rounded bg-grey-500 p-3">
              <div>{observedHost ?? <Placeholder />}</div>
              <div className="flex grow justify-end">
                <Bubble value={assessment.pass} additionalClasses="text-xs" />
              </div>
            </div>

            <div className="rounded bg-grey-500 p-3">
              <div className="flex flex-col">
                <div className="flex">
                  <div className="text-high">Ownership</div>

                  <div className="flex grow justify-end">
                    <Bubble
                      value={assessment.ownershipAssessment.pass}
                      additionalClasses="text-xs"
                    />
                  </div>
                </div>
                <div className="text-xs text-mid">
                  Wallet:{' '}
                  <span>
                    {assessment.ownershipAssessment.observedWallet
                      ? assessment.ownershipAssessment.observedWallet
                      : 'Not Found'}
                  </span>
                </div>
                <div className="text-xs italic text-mid">
                  Expected:{' '}
                  <span>
                    {assessment.ownershipAssessment.expectedWallets.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {(Object.keys(assessment.arnsAssessments.chosenNames).length ||
              Object.keys(assessment.arnsAssessments.prescribedNames)
                .length) && (
              <div>
                <div className="flex  rounded bg-grey-500 p-3">
                  <div className="text-high">ArNS Assessment</div>

                  <div className="flex grow justify-end">
                    <Bubble
                      value={assessment.arnsAssessments.pass}
                      additionalClasses="text-xs"
                    />
                  </div>
                </div>
                {Object.entries(assessment.arnsAssessments.chosenNames).map(
                  ([arnsName, arnsAssessment]) => (
                    <>
                      <div className="mx-4 h-2 border-x border-grey-500" />
                      <ArNSAssessmentPanel
                        key={arnsName}
                        arnsName={arnsName}
                        arnsAssessment={arnsAssessment}
                        chosen={true}
                      />
                    </>
                  ),
                )}
                {Object.entries(assessment.arnsAssessments.prescribedNames).map(
                  ([arnsName, arnsAssessment]) => (
                    <>
                      <div className="mx-4 h-2 border-x border-grey-500" />
                      <ArNSAssessmentPanel
                        key={arnsName}
                        arnsName={arnsName}
                        arnsAssessment={arnsAssessment}
                        chosen={false}
                      />
                    </>
                  ),
                )}
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AssessmentDetailsPanel;
