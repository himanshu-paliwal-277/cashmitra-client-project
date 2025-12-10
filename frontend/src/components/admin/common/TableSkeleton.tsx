import { Skeleton } from '../../ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-100">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="py-3 sm:py-4 px-4 sm:px-6">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;
