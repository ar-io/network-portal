import useGateway from '@src/hooks/useGateway';
import useReport from '@src/hooks/useReport';
import { useParams } from 'react-router-dom';
import GatewayAssessmentsTable from './GatewayAssessmentsTable';
import ReportHeader from './ReportHeader';

const Report = () => {
  const params = useParams();
  const ownerId = params?.ownerId;
  const reportId = params?.reportId;

  const { data: gateway } = useGateway({
    ownerWalletAddress: ownerId,
  });

  const { isLoading, data:reportData } = useReport(reportId);

  return (
    <div className="flex h-screen max-w-full flex-col gap-6 overflow-auto pr-6 scrollbar">
      <ReportHeader gateway={gateway} reportData={reportData} />
      {isLoading || !reportData ? undefined : reportData ? (
        <GatewayAssessmentsTable gateway={gateway} reportData={reportData} />
      ) : (
        <div>Unable to find report with ID {reportId}.</div>
      )}
    </div>
  );
};

export default Report;
