import Header from '@src/components/Header';
import { isSolanaAddress } from '@src/utils/solanaAddress';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Banner from './Banner';
import VaultsTable from './VaultsTable';

const BalancesForAddress = () => {
  const params = useParams();
  const walletAddress = params?.walletAddress;

  const walletAddressData = useMemo(() => {
    return walletAddress === undefined
      ? undefined
      : isSolanaAddress(walletAddress)
        ? walletAddress
        : undefined;
  }, [walletAddress]);

  return (
    <div className="px-4 lg:px-6 flex h-full max-w-full flex-col">
      <div className="mb-4 shrink-0">
        <Header />
      </div>
      <div className="flex-1 overflow-scroll scrollbar scrollbar-thin">
        <div className="h-full">
          <div className="flex flex-col gap-6 pb-6">
            {walletAddressData ? (
              <>
                <Banner walletAddress={walletAddressData} />
                <VaultsTable walletAddress={walletAddressData} />
              </>
            ) : (
              <div>Invalid wallet address.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalancesForAddress;
