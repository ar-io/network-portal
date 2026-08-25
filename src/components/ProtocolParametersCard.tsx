import ProtocolParameterGrid from '@src/components/ProtocolParameterGrid';
import { LinkArrowIcon } from '@src/components/icons';
import {
  type ProtocolParametersVariant,
  useProtocolParameters,
} from '@src/hooks/useProtocolParameters';

const SUBTITLE: Record<ProtocolParametersVariant, string> = {
  operator: 'set by the protocol for gateway operators',
  delegate: 'set by the protocol for delegators',
};

/**
 * The standalone limits card, shown where there is no join or connect card to
 * fold them into — that is, once a wallet is connected.
 *
 * Supplementary: a failed settings read renders nothing rather than adding an
 * error to whatever page it sits on.
 */
const ProtocolParametersCard = ({
  variant,
  docsUrl,
}: {
  variant: ProtocolParametersVariant;
  docsUrl?: string;
}) => {
  const { parameters, isLoading } = useProtocolParameters(variant);

  if (!isLoading && !parameters) {
    return null;
  }

  return (
    <div className="rounded-xl border border-transparent-100-8 bg-containerL0 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-high">Network Rules</span>
          <span className="text-xs text-low">{SUBTITLE[variant]}</span>
        </div>
        {docsUrl && (
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 text-xs text-mid transition-colors hover:text-high"
          >
            View Docs
            <LinkArrowIcon className="size-3" />
          </a>
        )}
      </div>
      <ProtocolParameterGrid parameters={parameters} />
    </div>
  );
};

export default ProtocolParametersCard;
