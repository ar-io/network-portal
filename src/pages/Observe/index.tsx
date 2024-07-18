import useGateway from '@src/hooks/useGateway';
import { Assessment } from '@src/types';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AssessmentDetailsPanel from '@src/components/AssessmentDetailsPanel';
import ObservationsTable from './ObservationsTable';
import ObserveHeader from './ObserveHeader';

const Report = () => {
  const params = useParams();
  const ownerId = params?.ownerId;

  const { isLoading, data: gateway } = useGateway({
    ownerWalletAddress: ownerId,
  });

  const [selectedAssessment, setSelectedAssessment] = useState<Assessment>();

  // const { isLoading, data } = useReport(reportId);

  // const reportData = data as ReportData;

  return (
    <div className="flex h-screen max-w-full flex-col gap-[24px] overflow-auto pr-[24px] scrollbar">
      <ObserveHeader
        gateway={gateway}
        setSelectedAssessment={setSelectedAssessment}
      />
      {isLoading ? undefined : gateway && ownerId ? (
        <ObservationsTable
          gatewayAddress={ownerId}
          setSelectedAssessment={setSelectedAssessment}
        />
      ) : (
        <div>Unable to gateway with ID {ownerId}.</div>
      )}
      {selectedAssessment && gateway && (
        <AssessmentDetailsPanel
          gateway={gateway}
          assessment={selectedAssessment}
          onClose={() => setSelectedAssessment(undefined)}
        />
      )}
    </div>
  );
};

export default Report;
