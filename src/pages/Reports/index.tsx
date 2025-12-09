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
    <div className="flex h-full max-w-full flex-col gap-6 pb-6">
      <ReportsHeader gateway={gateway} />
      <div className="flex-1 overflow-hidden">
        {isLoading || !currentEpoch ? undefined : ownerId && gateway ? (
          <div className="h-full overflow-y-auto scrollbar scrollbar-thin">
            <ReportsTable ownerId={ownerId} gateway={gateway} />
          </div>
        ) : (
          <div>Unable to find gateway with owner ID {ownerId}.</div>
        )}
      </div>
    </div>
  );
};

export default Reports;
