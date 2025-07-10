import Header from '@src/components/Header';
import {
  Extension,
  ExtensionCategory,
  ExtensionTag,
} from '@src/types/extension';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExtensionCard from './ExtensionCard';
import ExtensionDetail from './ExtensionDetail';

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

export default function Extensions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [dynamicCategories, setDynamicCategories] = useState<
    Record<string, string>
  >({});
  const [dynamicTags, setDynamicTags] = useState<Record<string, string>>({});

  const selectedExtensionId = searchParams.get('id');
  const selectedExtension = extensions.find(
    (ext) => ext.id === selectedExtensionId,
  );

  useEffect(() => {
    const loadExtensions = async () => {
      try {
        const response = await fetch('/data/extensions.json');
        const data = await response.json();
        setExtensions(data.extensions);

        // Collect dynamic categories and tags
        const foundCategories: Record<string, string> = {};
        const foundTags: Record<string, string> = {};

        data.extensions.forEach((ext: any) => {
          // Validate and add category if not in predefined list
          if (
            ext.category &&
            typeof ext.category === 'string' &&
            ext.category.trim()
          ) {
            const category = ext.category.trim();
            if (!CATEGORY_LABELS[category as ExtensionCategory]) {
              foundCategories[category] =
                category.charAt(0).toUpperCase() +
                category.slice(1).replace(/-/g, ' ');
            }
          }

          // Validate and add tags if not in predefined list
          if (Array.isArray(ext.tags)) {
            ext.tags.forEach((tag: any) => {
              if (
                typeof tag === 'string' &&
                tag.trim() &&
                !TAG_LABELS[tag as ExtensionTag]
              ) {
                const trimmedTag = tag.trim();
                foundTags[trimmedTag] =
                  trimmedTag.charAt(0).toUpperCase() +
                  trimmedTag.slice(1).replace(/-/g, ' ');
              }
            });
          }
        });

        setDynamicCategories(foundCategories);
        setDynamicTags(foundTags);
      } catch (error) {
        console.error('Failed to load extensions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadExtensions();
  }, []);

  const filteredExtensions = extensions.filter((ext) => {
    const matchesSearch =
      searchTerm === '' ||
      ext.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || ext.category === selectedCategory;
    const matchesTag =
      selectedTag === 'all' || ext.tags.includes(selectedTag as ExtensionTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  const handleExtensionClick = (extensionId: string) => {
    setSearchParams({ id: extensionId });
  };

  const handleCloseDetail = () => {
    setSearchParams({});
  };

  // Merge predefined and dynamic categories/tags
  const allCategories = { ...CATEGORY_LABELS, ...dynamicCategories };
  const allTags = { ...TAG_LABELS, ...dynamicTags };

  if (selectedExtension) {
    return (
      <ExtensionDetail
        extension={selectedExtension}
        onClose={handleCloseDetail}
      />
    );
  }

  return (
    <div className="flex max-w-full flex-col gap-6">
      <Header />

      <div className="mb-8">
        <div className="flex w-full items-center justify-between rounded-t-xl border border-grey-600 bg-grey-900 px-6 py-[0.9375rem]">
          <div className="grow">
            <div className="text-sm text-high">Gateway Extensions</div>
            <div className="mt-1 text-xs text-mid">
              Discover and install modular tools to enhance your AR.IO gateway.
              Extensions are provided by third parties. Always review code and
              test before using in production.
            </div>
          </div>
          <button
            onClick={() =>
              window.open(
                'https://github.com/ar-io/network-portal/issues/new?template=extension_submission.md',
                '_blank',
              )
            }
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-mid transition-colors hover:text-high"
          >
            <span>Submit Extension</span>
            <ExternalLink className="size-3" />
          </button>
        </div>

        <div className="rounded-b-xl border-x border-b border-grey-600 bg-grey-1000 p-6">
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                placeholder="Search extensions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-grey-600 bg-grey-1000 px-4 py-2 text-sm text-high placeholder:text-low focus:border-grey-400 focus:outline-none lg:max-w-md"
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-grey-600 bg-grey-1000 px-4 py-2 text-sm text-high focus:border-grey-400 focus:outline-none sm:w-auto"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(allCategories).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full rounded-lg border border-grey-600 bg-grey-1000 px-4 py-2 text-sm text-high focus:border-grey-400 focus:outline-none sm:w-auto"
                >
                  <option value="all">All Tags</option>
                  {Object.entries(allTags).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-mid">Loading extensions...</div>
            </div>
          ) : filteredExtensions.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="text-lg text-mid">No extensions found</div>
                <div className="mt-2 text-sm text-low">
                  Try adjusting your search or filters
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filteredExtensions.map((extension) => (
                <ExtensionCard
                  key={extension.id}
                  extension={extension}
                  onClick={() => handleExtensionClick(extension.id)}
                  tagStyles={{
                    ...TAG_STYLES,
                    ...Object.fromEntries(
                      Object.keys(dynamicTags).map((tag) => [
                        tag,
                        'bg-grey-700 text-white',
                      ]),
                    ),
                  }}
                  tagLabels={allTags}
                  categoryLabels={allCategories}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
