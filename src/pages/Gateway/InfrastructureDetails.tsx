import { GatewayWithAddress } from '@ar.io/sdk/web';
import useGatewayRoster from '@src/hooks/useGatewayRoster';
import { formatAsn, matchRosterRow } from '@src/utils/analyzerApi';
import StatsBox from './StatsBox';

/**
 * Resolved hosting for this gateway, from the daily analysis roster.
 *
 * The roster covers only gateways that are joined AND publish an FQDN, because
 * every row is built by resolving DNS — roughly half the registry. A gateway
 * absent from it is ordinary, so the panel removes itself rather than
 * rendering a card full of dashes.
 */
const InfrastructureDetails = ({
  gateway,
}: {
  gateway?: GatewayWithAddress;
}) => {
  const { data: roster } = useGatewayRoster();

  if (!roster || !gateway) return null;

  const row = matchRosterRow(roster, {
    gatewayAddress: gateway.gatewayAddress,
    fqdn: gateway.settings.fqdn,
  });

  if (!row) return null;

  const location = [row.city, row.country].filter(Boolean).join(', ');
  const asn = formatAsn(row.asn);
  const network = row.asnOrg ?? row.isp ?? undefined;

  return (
    <div className="w-full rounded-xl border border-transparent-100-16 text-sm">
      <div className="bg-containerL3 px-6 py-4">
        <div className="text-high">Infrastructure</div>
      </div>

      {network && <StatsBox title="Network" value={network} />}
      {row.isp && row.isp !== network && (
        <StatsBox title="Provider" value={row.isp} />
      )}
      {location && <StatsBox title="Location" value={location} />}
      {asn && <StatsBox title="ASN" value={asn} />}
      {row.hosting !== null && row.hosting !== undefined && (
        <StatsBox
          title="Hosting"
          value={row.hosting ? 'Datacenter' : 'Non-datacenter'}
        />
      )}
      {/* A cluster is gateways that share resolved infrastructure. Stated as a
          count of what the data shows; the analysis does not establish that one
          operator runs them, and its own scoring is uncalibrated. */}
      {typeof row.clusterSize === 'number' && row.clusterSize > 1 && (
        <StatsBox
          title="Shares infrastructure with"
          value={`${row.clusterSize - 1} other gateway${row.clusterSize - 1 === 1 ? '' : 's'}`}
        />
      )}
    </div>
  );
};

export default InfrastructureDetails;
