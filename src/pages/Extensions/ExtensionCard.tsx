import {
  Extension,
  ExtensionCategory,
  ExtensionTag,
} from '@src/types';
import { getImageUrl } from '@src/utils/imageUtils';
import { Calendar, Tag, User } from 'lucide-react';
import { useState } from 'react';

interface ExtensionCardProps {
  extension: Extension;
  onClick: () => void;
  tagStyles: Record<ExtensionTag, string>;
  tagLabels: Record<ExtensionTag, string>;
  categoryLabels: Record<ExtensionCategory, string>;
}

export default function ExtensionCard({
  extension,
  onClick,
  tagStyles,
  tagLabels,
  categoryLabels,
}: ExtensionCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className="group relative flex cursor-pointer flex-col rounded-xl border border-grey-600 bg-containerL3 p-6 transition-all hover:border-grey-400"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="group-hover:text-gradient mb-2 text-base font-medium text-high sm:text-lg">
            {extension.name}
          </h3>
          <p className="line-clamp-2 text-sm text-mid">
            {extension.description}
          </p>
        </div>
        {/* Logo only if available */}
        {extension.logo && !imageError && (
          <div className="size-16 shrink-0 rounded-lg bg-containerL0 p-2 shadow-sm sm:size-20">
            <img
              src={getImageUrl(extension.logo)}
              alt={extension.name}
              className="size-full object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {extension.tags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tagStyles[tag]}`}
          >
            {tagLabels[tag]}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-low">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Tag className="size-3" />
            <span>{categoryLabels[extension.category]}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="size-3" />
            <span className="truncate">{extension.author}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap">v{extension.version}</span>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Calendar className="size-3" />
            <span>{formatDate(extension.lastUpdated)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
