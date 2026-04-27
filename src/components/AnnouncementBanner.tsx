function AnnouncementBanner() {
  return (
    <div className="flex flex-row items-center justify-center gap-2 bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end px-4 py-2 text-sm text-grey-1100">
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
        Learn More →
      </a>
    </div>
  );
}

export default AnnouncementBanner;
