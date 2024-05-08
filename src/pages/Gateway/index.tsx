import Button from '@src/components/Button';
import { EditIcon, StatsArrowIcon } from '@src/components/icons';
import GatewayHeader from './GatewayHeader';

const StatsBox = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className="flex flex-col gap-[4px] px-[24px] py-[16px]">
      <div className="text-xs text-low">{title}</div>
      <div className="flex gap-[4px]">
        <StatsArrowIcon />
        <div className="text-sm text-mid">{value}</div>
      </div>
    </div>
  );
};

const Gateway = () => {
  const gatewayName = undefined;

  return (
    <div>
      <GatewayHeader gatewayName={gatewayName} />
      <div className="my-[24px] flex gap-[24px]">
        <div className="w-[270px] rounded-xl border border-transparent-100-16 text-sm">
          <div className="px-[24px] py-[16px]">
            <div className="text-high">Stats</div>
          </div>
          <StatsBox title="Start Block" value="0.00 AR" />
          <StatsBox title="Uptime" value="0.00 AR" />
          <StatsBox title="Delegates" value="0.00 AR" />
          <StatsBox title="Rewards Distributed" value="0.00 AR" />
        </div>
        <div className="size-full grow overflow-y-auto text-clip rounded-xl border border-transparent-100-16">
          <div className="flex items-center px-[24px] py-[16px]">
            <div className="text-high">Stats</div>
            <div className="grow" />
            <Button
              className="h-[30px]"
              title="Edit"
              text="Edit"
              icon={<EditIcon />}
              active={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gateway;
