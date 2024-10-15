import { AoGatewayWithAddress } from '@ar.io/sdk/web';
import useGatewayArioInfo from '@src/hooks/useGatewayArioInfo';
import { useEffect, useState } from 'react';
import StatsBox from './StatsBox';

const SoftwareDetails = ({ gateway }: { gateway?: AoGatewayWithAddress }) => {
  const [bundlers, setBundlers] = useState<string[]>();

  const gatewayAddress = gateway
    ? `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`
    : undefined;

  const arioInfoRes = useGatewayArioInfo({
    url: gatewayAddress,
  });

  useEffect(() => {
    if (gateway?.services?.bundlers) {
      const bundlers = gateway.services.bundlers.map(
        (service) =>
          `${service.protocol}://${service.fqdn}${service.port === 443 ? '' : `:${service.port}`}${service.path}`,
      );

      setBundlers(bundlers);
    }
  }, [gateway]);

  return (
    <div className="w-full rounded-xl border border-transparent-100-16 text-sm">
      <div className="px-6 py-4">
        <div className="text-high">Software</div>
      </div>
      <StatsBox title="Release Version" value={arioInfoRes.data?.release} />
      {bundlers && <StatsBox title="Bundlers" value={bundlers} />}
    </div>
  );
};

export default SoftwareDetails;
