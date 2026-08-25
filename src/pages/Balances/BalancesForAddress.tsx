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
    <div className="pl-4 lg:pl-6 flex h-full max-w-full flex-col">
      <div className="mb-4 shrink-0 pr-4 lg:pr-6">
        <Header />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar scrollbar-thin lg:pr-3">
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
