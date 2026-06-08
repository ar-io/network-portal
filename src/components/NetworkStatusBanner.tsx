import { useEffect, useState } from 'react';

function NetworkStatusBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));

    // Cleanup listeners
    return () => {
      window.removeEventListener('online', () => setOnline(true));
      window.removeEventListener('offline', () => setOnline(false));
    };
  }, []);

  useEffect(() => {
    if (!online) {
      setStatusMessage(`We can't connect to the Internet. Please check your connection
            and try again.`);
    } else {
      setStatusMessage('');
    }
  }, [online]);

  return (
    <>
      {statusMessage && (
        <div className="flex flex-row items-center justify-center bg-warning p-2 text-sm font-bold text-containerL0">
          <span>{statusMessage}</span>
        </div>
      )}
    </>
  );
}

export default NetworkStatusBanner;
