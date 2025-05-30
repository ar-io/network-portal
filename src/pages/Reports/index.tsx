import useGateway from '@src/hooks/useGateway';
import { useGlobalState } from '@src/store';
import { useParams } from 'react-router-dom';
import ReportsHeader from './ReportsHeader';
import ReportsTable from './ReportsTable';

const Reports = () => {
  const params = useParams();
  const ownerId = params?.ownerId;

  const { isLoading, data: gateway } = useGateway({
    ownerWalletAddress: ownerId,
  });

  const currentEpoch = useGlobalState((state) => state.currentEpoch);

  return (
    <div className="flex max-w-full flex-col gap-6 overflow-auto pb-6">
      <ReportsHeader gateway={gateway} />
      {isLoading || !currentEpoch ? undefined : ownerId && gateway ? (
        <ReportsTable ownerId={ownerId} gateway={gateway} />
      ) : (
        <div>Unable to find gateway with owner ID {ownerId}.</div>
      )}
    </div>
  );
};

export default Reports;
