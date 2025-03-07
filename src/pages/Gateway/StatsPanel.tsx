import { AoGatewayWithAddress } from '@ar.io/sdk/web';
import useHealthcheck from '@src/hooks/useHealthCheck';
import { formatDateTime } from '@src/utils';
import StatsBox from './StatsBox';

const formatUptime = (uptime: number) => {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
};

type StatsPanelProps = {
  gateway?: AoGatewayWithAddress | null;
};

const StatsPanel = ({ gateway }: StatsPanelProps) => {
  const gatewayAddress = gateway
    ? `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`
    : undefined;
  const healthCheckRes = useHealthcheck({
    url: gatewayAddress,
  });

  return (
    <div className="size-fit w-full rounded-xl border border-transparent-100-16 text-sm">
      <div className="bg-containerL3 px-6 py-4">
        <div className="text-high">Stats</div>
      </div>
      <StatsBox
        title="Join Date"
        value={
          gateway?.startTimestamp
            ? formatDateTime(new Date(gateway?.startTimestamp))
            : undefined
        }
      />

      {gateway?.status === 'joined' ? (
        <StatsBox
          title="Uptime"
          value={
            healthCheckRes.isError
              ? 'N/A'
              : healthCheckRes.isLoading
                ? undefined
                : formatUptime(healthCheckRes.data?.uptime)
          }
        />
      ) : (
        gateway && (
          <StatsBox
            title="Leave Date"
            value={
              gateway?.endTimestamp
                ? formatDateTime(new Date(gateway?.endTimestamp))
                : undefined
            }
          />
        )
      )}
      {/* <StatsBox title="Rewards Distributed" value={gateway?} /> */}
    </div>
  );
};

export default StatsPanel;
