import { isArweaveTransactionID, isEthAddress } from '@src/utils';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import BalancesHeader from './BalancesHeader';
import Banner from './Banner';
import VaultsTable from './VaultsTable';

const Balances = () => {
  const params = useParams();
  const walletAddress = params?.walletAddress;

  const walletAddressData = useMemo(() => {
    return walletAddress == undefined
      ? undefined
      : isEthAddress(walletAddress)
        ? walletAddress
        : isArweaveTransactionID(walletAddress)
          ? new ArweaveTransactionID(walletAddress)
          : undefined;
  }, [walletAddress]);

  return (
    <div className="flex max-w-full flex-col gap-6 overflow-auto pb-6">
      <BalancesHeader walletAddress={walletAddress} />
      {walletAddressData ? (
        <>
          <Banner walletAddress={walletAddressData} />
          <VaultsTable walletAddress={walletAddressData} />
        </>
      ) : (
        <div>Invalid wallet address.</div>
      )}
    </div>
  );
};

export default Balances;
