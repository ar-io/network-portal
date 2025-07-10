export type ExtensionCategory =
  | 'storage'
  | 'routing'
  | 'monitoring'
  | 'security'
  | 'performance'
  | 'indexing'
  | 'caching'
  | 'moderation'
  | 'analytics'
  | 'developer-tools';

export type ExtensionTag =
  | 'featured'
  | 'grant-funded'
  | 'community'
  | 'official'
  | 'beta'
  | 'stable';

export interface Extension {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  author: string;
  authorUrl?: string;
  url: string; // Can be GitHub, website, or app URL
  category: ExtensionCategory;
  tags: ExtensionTag[];
  version: string;
  lastUpdated: string;
  minGatewayVersion?: string;
  documentation?: string;
  image?: string; // Arweave TX ID or HTTPS URL for logo (256x256px recommended)
  screenshots?: string[]; // Array of Arweave TX IDs or HTTPS URLs (1280x800px recommended)
}
