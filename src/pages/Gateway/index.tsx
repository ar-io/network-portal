import Button from '@src/components/Button';
import Placeholder from '@src/components/Placeholder';
import { EditIcon, StatsArrowIcon } from '@src/components/icons';
import useGateway from '@src/hooks/useGateway';
import useHealthcheck from '@src/hooks/useHealthCheck';
import { useGlobalState } from '@src/store';
import { mioToIo } from '@src/utils';
import { useParams } from 'react-router-dom';
import GatewayHeader from './GatewayHeader';

const StatsBox = ({
  title,
  value,
}: {
  title: string;
  value: string | number | undefined;
}) => {
  return (
    <div className="flex flex-col gap-[4px] border-t border-transparent-100-16 px-[24px] py-[16px]">
      <div className="text-xs text-low">{title}</div>
      <div className="flex gap-[4px]">
        <StatsArrowIcon />
        {value !== undefined ? (
          <div className="text-sm text-mid">{value}</div>
        ) : (
          <Placeholder />
        )}
      </div>
    </div>
  );
};

const formatUptime = (uptime: number) => {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
};

const DisplayRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) => {
  return (
    <>
      <div className="border-t border-grey-900">
        <div className="h-[39px] bg-grey-1000 px-[24px] py-[12px] text-xs text-low">
          {label}
        </div>
      </div>
      <div className="h-[39px] content-center border-t border-grey-900 text-sm text-low">
        {value !== undefined ? value : <Placeholder />}
      </div>
    </>
  );
};

const Gateway = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  const params = useParams();

  const ownerId = params?.ownerId;

  const { data: gateway } = useGateway({
    ownerWalletAddress: ownerId || undefined,
  });

  const gatewayAddress = gateway
    ? `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`
    : undefined;

  const healthCheckRes = useHealthcheck({
    url: gatewayAddress,
  });

  const gatewayRows = [
    { label: 'Label:', value: gateway?.settings.label },
    { label: 'Address:', value: gatewayAddress },
    { label: 'Owner ID:', value: ownerId },
    { label: 'Observer ID:', value: gateway?.observerWallet },
    { label: 'Properties ID:', value: gateway?.settings.properties },
    {
      label: 'Gateway Stake:',
      value: gateway?.operatorStake
        ? mioToIo(gateway?.operatorStake)
        : undefined,
    },
    { label: 'Status:', value: gateway?.status },
    { label: 'Note:', value: gateway?.settings.note },
  ];

  return (
    <div>
      <GatewayHeader gatewayName={gateway?.settings.label} />
      <div className="my-[24px] flex gap-[24px]">
        <div className="h-fit w-[270px] rounded-xl border border-transparent-100-16 text-sm">
          <div className="px-[24px] py-[16px]">
            <div className="text-high">Stats</div>
          </div>
          <StatsBox title="Start Block" value={gateway?.start} />
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
          <StatsBox
            title="Delegates"
            value={Object.keys(gateway?.delegates || {}).length}
          />
          {/* <StatsBox title="Rewards Distributed" value={gateway?} /> */}
        </div>
        <div className="size-full grow overflow-y-auto text-clip rounded-xl border border-transparent-100-16">
          <div className="flex items-center px-[24px] py-[16px]">
            <div className="text-high">Stats</div>
            <div className="grow" />
            {ownerId === walletAddress?.toString() && (
              <Button
                className="h-[30px]"
                title="Edit"
                text="Edit"
                icon={<EditIcon />}
                active={true}
              />
            )}
          </div>
          <div className="grid grid-cols-[221px_auto]">
            {gatewayRows.map(({ label, value }, index) => (
              <DisplayRow key={index} label={label} value={value} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gateway;
