import { useEffectOnce } from '@src/hooks/useEffectOnce';
import { useGlobalState } from '@src/store';
import { ReactElement, useEffect } from 'react';

const GlobalDataProvider = ({
  children,
}: {
  children: ReactElement;
}) => {
  const twoMinutes = 120000;

  const setBlockHeight = useGlobalState((state) => state.setBlockHeight);
  const setCurrentEpoch = useGlobalState((state) => state.setCurrentEpoch);
  const arweave = useGlobalState((state) => state.arweave);
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);

  useEffectOnce(() => {
    const update = async () => {
      const currentEpoch = await arioReadSDK.getCurrentEpoch();
      setCurrentEpoch(currentEpoch);
    };

    update();
  });

  useEffect(() => {
    const updateBlockHeight = async () => {
      const blockHeight = await (await arweave.blocks.getCurrent()).height;
      setBlockHeight(blockHeight);
    };
    updateBlockHeight();
    const interval = setInterval(updateBlockHeight, twoMinutes);

    return () => {
      clearInterval(interval);
    };
  });

  return <>{children}</>;
};

export default GlobalDataProvider;
