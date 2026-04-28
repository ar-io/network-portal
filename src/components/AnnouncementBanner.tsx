import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

const SNAPSHOT_DATE = new Date('2026-05-15T00:00:00Z');

function AnnouncementBanner() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const delay = SNAPSHOT_DATE.getTime() - Date.now();
    if (delay <= 0) return;
    const timer = setTimeout(() => setTick((t) => t + 1), delay);
    return () => clearTimeout(timer);
  }, []);

  if (Date.now() > SNAPSHOT_DATE.getTime()) {
    return null;
  }

  return (
    <div
      role="banner"
      aria-label="Migration announcement"
      className="flex flex-row flex-wrap items-center justify-center gap-x-2 bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end px-4 py-2 text-center text-sm text-grey-1100 dark:text-grey-1100"
    >
      <span>
        <span className="font-bold">Ar.io is migrating to Solana.</span>{' '}
        Register before the May 15, 2026 snapshot!
      </span>
      <a
        href="https://ar.io/solana-migration/"
        target="_blank"
        rel="noopener noreferrer"
        className="whitespace-nowrap font-bold underline hover:opacity-80"
      >
        Learn More <ExternalLink className="inline size-3" />
      </a>
    </div>
  );
}

export default AnnouncementBanner;
