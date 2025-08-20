import Markdown from 'markdown-to-jsx';
import BaseModal from './BaseModal';

const MarkdownModal = ({
  title,
  markdownText,
  onClose,
}: {
  title: string;
  markdownText: string;
  onClose: () => void;
}) => {
  return (
    <BaseModal onClose={onClose} useDefaultPadding={false}>
      <div className="h-[32rem] w-full text-left lg:w-[28.4375rem]">
        <div className="flex  size-full flex-col px-8 pb-4 pt-6">
          <div className="text-lg text-high">{title}</div>

          <div className="prose my-2 grow overflow-y-auto text-sm text-mid scrollbar prose-headings:text-high prose-h2:text-base prose-h3:text-sm">
            <Markdown>{markdownText}</Markdown>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default MarkdownModal;
