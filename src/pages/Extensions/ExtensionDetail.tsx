import Header from '@src/components/Header';
import {
  Extension,
  ExtensionCategory,
  ExtensionTag,
} from '@src/types/extension';
import { getImageUrl } from '@src/utils/imageUtils';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  Github,
  Package,
  Tag,
  User,
} from 'lucide-react';
import { useState } from 'react';

interface ExtensionDetailProps {
  extension: Extension;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<ExtensionCategory, string> = {
  storage: 'Storage',
  routing: 'Routing',
  monitoring: 'Monitoring',
  security: 'Security',
  performance: 'Performance',
  indexing: 'Indexing',
  caching: 'Caching',
  moderation: 'Moderation',
  analytics: 'Analytics',
  'developer-tools': 'Developer Tools',
  compute: 'Compute',
};

const TAG_LABELS: Record<ExtensionTag, string> = {
  featured: 'Featured',
  'grant-funded': 'Grant Funded',
  community: 'Community',
  official: 'Official',
  beta: 'Beta',
  stable: 'Stable',
};

const TAG_STYLES: Record<ExtensionTag, string> = {
  featured:
    'bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end text-grey-1000 font-semibold',
  'grant-funded': 'bg-green-600 text-white',
  community: 'bg-blue-600 text-white',
  official: 'bg-purple-600 text-white',
  beta: 'bg-yellow-600 text-black',
  stable: 'bg-green-700 text-white',
};

export default function ExtensionDetail({
  extension,
  onClose,
}: ExtensionDetailProps) {
  const [imageError, setImageError] = useState(false);
  const [screenshotErrors, setScreenshotErrors] = useState<
    Record<number, boolean>
  >({});

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isGithubUrl = extension.url.includes('github.com');

  return (
    <div className="flex max-w-full flex-col gap-6">
      <Header />

      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-mid transition-colors hover:text-high"
        >
          <ArrowLeft className="size-4" />
          Back to Extensions
        </button>
      </div>

      <div className="rounded-xl border border-grey-500 bg-grey-1000 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Extension logo */}
              {extension.image && !imageError && (
                <div className="size-20 shrink-0 self-start rounded-lg bg-grey-800 p-2 shadow-md sm:size-24">
                  <img
                    src={getImageUrl(extension.image)}
                    alt={extension.name}
                    className="size-full object-contain"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="mb-2 text-xl font-medium text-high sm:text-2xl">
                  {extension.name}
                </h1>
                <p className="text-base text-mid sm:text-lg">
                  {extension.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.open(extension.url, '_blank')}
              className="group relative mt-4 flex items-center gap-2 self-start rounded-lg px-4 py-2 text-sm transition-all hover:text-high sm:mt-0"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-center gap-2 text-mid group-hover:text-high">
                {isGithubUrl ? (
                  <>
                    <Github className="size-4" />
                    View on GitHub
                  </>
                ) : (
                  <>
                    <ExternalLink className="size-4" />
                    View Extension
                  </>
                )}
              </div>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {extension.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${TAG_STYLES[tag]}`}
              >
                {TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-medium text-high">
                About this Extension
              </h2>
              <p className="text-sm leading-relaxed text-mid">
                {extension.longDescription}
              </p>
            </div>

            {extension.documentation && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-medium text-high">
                  Documentation
                </h2>
                <a
                  href={extension.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gradient inline-flex items-center gap-2 text-sm hover:opacity-80"
                >
                  <FileText className="size-4" />
                  Read the documentation
                  <ExternalLink className="size-3" />
                </a>
              </div>
            )}

            <div className="rounded-lg border border-grey-600 bg-grey-900 p-6">
              <h3 className="mb-4 font-medium text-high">Installation</h3>
              <ol className="list-inside list-decimal space-y-2 text-sm text-mid">
                <li>Visit the extension repository using the button above</li>
                <li>Follow the installation instructions in the README</li>
                <li>Configure the extension according to your gateway setup</li>
                <li>Restart your gateway to apply changes</li>
              </ol>
            </div>

            {/* Screenshots gallery */}
            {extension.screenshots && extension.screenshots.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-4 font-medium text-high">Screenshots</h3>
                <div className="space-y-4">
                  {extension.screenshots.map((screenshot, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-lg border border-grey-600"
                    >
                      {!screenshotErrors[index] ? (
                        <img
                          src={getImageUrl(screenshot)}
                          alt={`${extension.name} screenshot ${index + 1}`}
                          className="w-full"
                          onError={() =>
                            setScreenshotErrors((prev) => ({
                              ...prev,
                              [index]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-grey-900 text-low">
                          <span className="text-sm">
                            Screenshot unavailable
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-lg border border-grey-600 bg-grey-900 p-6">
              <h3 className="mb-4 font-medium text-high">Extension Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-low">Category</dt>
                  <dd className="mt-1 flex items-center gap-1 text-sm text-mid">
                    <Tag className="size-3" />
                    {CATEGORY_LABELS[extension.category]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-low">Author</dt>
                  <dd className="mt-1 flex items-center gap-1 text-sm text-mid">
                    <User className="size-3" />
                    {extension.authorUrl ? (
                      <a
                        href={extension.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gradient hover:opacity-80"
                      >
                        {extension.author}
                      </a>
                    ) : (
                      extension.author
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-low">Version</dt>
                  <dd className="mt-1 flex items-center gap-1 text-sm text-mid">
                    <Package className="size-3" />v{extension.version}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-low">Last Updated</dt>
                  <dd className="mt-1 flex items-center gap-1 text-sm text-mid">
                    <Calendar className="size-3" />
                    {formatDate(extension.lastUpdated)}
                  </dd>
                </div>
                {extension.minGatewayVersion && (
                  <div>
                    <dt className="text-xs text-low">
                      Minimum Gateway Version
                    </dt>
                    <dd className="mt-1 text-sm text-mid">
                      v{extension.minGatewayVersion}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
