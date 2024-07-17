import useGateway from '@src/hooks/useGateway';
import { useParams } from 'react-router-dom';
import ObserveHeader from './ObserveHeader';
import ObservationsTable from './ObservationsTable';

const Report = () => {
  const params = useParams();
  const ownerId = params?.ownerId;

  const { isLoading, data: gateway } = useGateway({
    ownerWalletAddress: ownerId,
  });

  // const { isLoading, data } = useReport(reportId);

  // const reportData = data as ReportData;

  return (
    <div className="flex h-screen max-w-full flex-col gap-[24px] overflow-auto pr-[24px] scrollbar">
      <ObserveHeader gateway={gateway} />
      {isLoading ? undefined : gateway && ownerId ? (
        <ObservationsTable gatewayAddress={ownerId} />
      ) : (
        <div>Unable to gateway with ID {ownerId}.</div>
      )}
    </div>
  );
};

export default Report;
