import Header from '@src/components/Header';
import { isArweaveTransactionID, isEthAddress } from '@src/utils';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
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
      : isEthAddress(walletAddress)
        ? walletAddress
        : isArweaveTransactionID(walletAddress)
          ? new ArweaveTransactionID(walletAddress)
          : undefined;
  }, [walletAddress]);

  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-4 px-4 lg:px-6 shrink-0">
        <Header />
      </div>
      <div className="flex-1 px-4 lg:px-6 py-2 overflow-scroll scrollbar scrollbar-thin">
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
