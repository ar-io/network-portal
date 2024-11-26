import { AoGatewayWithAddress, mIOToken } from '@ar.io/sdk/web';
import Tooltip from '@src/components/Tooltip';
import { EAY_TOOLTIP_TEXT, OPERATOR_EAY_TOOLTIP_FORMULA } from '@src/constants';
import useHealthcheck from '@src/hooks/useHealthCheck';
import { useGlobalState } from '@src/store';
import { formatDateTime } from '@src/utils';
import { MathJax } from 'better-react-mathjax';
import { InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import StatsBox from './StatsBox';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import useGateways from '@src/hooks/useGateways';
import { calculateOperatorRewards } from '@src/utils/rewards';

const formatUptime = (uptime: number) => {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
};

type StatsPanelProps = {
  gateway?: AoGatewayWithAddress;
};

const StatsPanel = ({ gateway }: StatsPanelProps) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const gatewayAddress = gateway
    ? `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`
    : undefined;
  const healthCheckRes = useHealthcheck({
    url: gatewayAddress,
  });

  const { data: protocolBalance } = useProtocolBalance();
  const { data: gateways } = useGateways();

  const [numDelegates, setNumDelegates] = useState<number>();

  const operatorRewards =
    gateway?.operatorStake != undefined && protocolBalance && gateways
      ? calculateOperatorRewards(
          new mIOToken(protocolBalance).toIO(),
          Object.values(gateways).filter((g) => g.status == 'joined').length,
          gateway,
        )
      : undefined;

  useEffect(() => {
    if (!arIOReadSDK || !gateway) return;
    const update = async () => {
      const res = await arIOReadSDK.getGatewayDelegates({
        address: gateway.gatewayAddress,
        limit: 1,
      });
      setNumDelegates(res.totalItems);
    };
    update();
  }, [gateway, arIOReadSDK]);

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
        <>
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
          <StatsBox title="Delegates" value={numDelegates} />

          <StatsBox
            title={
              <div className="flex gap-2">
                Operator EAY{' '}
                <Tooltip
                  message={
                    <div>
                      <p>{EAY_TOOLTIP_TEXT}</p>
                      <MathJax className="mt-4">
                        {OPERATOR_EAY_TOOLTIP_FORMULA}
                      </MathJax>
                    </div>
                  }
                >
                  <InfoIcon className="size-4" />
                </Tooltip>
              </div>
            }
            value={
              operatorRewards != undefined
                ? `${(operatorRewards.EAY * 100).toFixed(2)}%`
                : undefined
            }
          />
        </>
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
