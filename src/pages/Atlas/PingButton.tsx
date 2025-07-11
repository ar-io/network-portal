import { useState } from 'react';

import Button, { ButtonType } from '@src/components/Button';

const PingButton = ({
  domain,
}: {
  domain: string;
}) => {
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [latency, setLatency] = useState<string>('');

  const onClick = async () => {
    if (isPinging) return;
    setIsPinging(true);
    setLatency('???');
    const url = `https://${domain}/ar-io/healthcheck`
    const startTime = Date.now();
    fetch(url).then(() => {
      const stopTime = Date.now();
      const latency = stopTime - startTime;
      setLatency(`${latency}ms`);
    }).catch(() => {
      setLatency('Error');
    }).finally(() => {
      setIsPinging(false);
    });
  }

  return (
    <>
      <Button
        className="inline-block w-fit"
        buttonType={ButtonType.PRIMARY}
        title="Ping"
        text="Ping"
        onClick={onClick}
      />
      {latency || ''}
    </>
  )
};

export default PingButton;
