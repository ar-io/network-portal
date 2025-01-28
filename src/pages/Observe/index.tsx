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

  return (
    <div className="flex max-w-full flex-col gap-6 overflow-auto">
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
          observedHost={gateway.settings.fqdn}
          assessment={selectedAssessment}
          onClose={() => setSelectedAssessment(undefined)}
        />
      )}
    </div>
  );
};

export default Report;
