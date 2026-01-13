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

  const { isLoading, data: reportData } = useReport(reportId);

  return (
    <div className="flex h-full max-w-full flex-col gap-6 px-4 pb-6 lg:px-6">
      <ReportHeader gateway={gateway} reportData={reportData} />
      <div className="flex-1 overflow-hidden">
        {isLoading || !reportData ? undefined : reportData ? (
          <div className="h-full overflow-y-auto scrollbar scrollbar-thin">
            <GatewayAssessmentsTable
              gateway={gateway}
              reportData={reportData}
            />
          </div>
        ) : (
          <div>Unable to find report with ID {reportId}.</div>
        )}
      </div>
    </div>
  );
};

export default Report;
