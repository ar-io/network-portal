import { ExternalLink } from 'lucide-react';

const SNAPSHOT_DATE = new Date('2026-05-15T00:00:00Z');

function AnnouncementBanner() {
  if (Date.now() > SNAPSHOT_DATE.getTime()) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-x-2 bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end px-4 py-2 text-center text-sm text-grey-1100 dark:text-grey-1100">
      <span>
        <span className="font-bold">Ar.io is migrating to Solana.</span>{' '}
        Gateways will continue to serve names and data. Register before the May
        15, 2026 snapshot!
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
