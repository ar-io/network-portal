import Placeholder from './Placeholder';

interface TableSkeletonRowProps {
  columns: number;
}

const TableSkeletonRow = ({ columns }: TableSkeletonRowProps) => {
  return (
    <tr className="border-t border-grey-500 text-low *:py-4 *:pl-6">
      {Array.from({ length: columns }, (_, index) => (
        <td key={index}>
          <Placeholder className="h-4 w-full max-w-[200px]" />
        </td>
      ))}
    </tr>
  );
};

export default TableSkeletonRow;
