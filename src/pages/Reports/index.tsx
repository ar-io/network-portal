import useGateway from '@src/hooks/useGateway';
import { useParams } from 'react-router-dom';
import ReportsHeader from './ReportsHeader';
import ReportsTable from './ReportsTable';

const Reports = () => {
  const params = useParams();
  const ownerId = params?.ownerId;

  const { isLoading, data: gateway } = useGateway({
    ownerWalletAddress: ownerId,
  });

  return (
    <div className="flex flex-col gap-[24px] overflow-y-auto pr-[24px] scrollbar">
      <ReportsHeader gateway={gateway} />
      {isLoading ? (
        undefined
      ) : ownerId && gateway ? (
        <ReportsTable ownerId={ownerId} gateway={gateway} />
      ) : (
        <div>Unable to find gateway with owner ID {ownerId}.</div>
      )}
    </div>
  );
};

export default Reports;
