import React from 'react';
import { Link } from 'react-router-dom';

interface Transaction {
  collect_id: string;
  school_id: string;
  gateway: string;
  order_amount: number;
  transaction_amount?: number;
  status: string;
  custom_order_id: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  onSort: (column: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onSort,
  sortBy,
  sortOrder,
}) => {
  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const SortableHeader = ({ column, title }: { column: string; title: string }) => (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
      <button onClick={() => onSort(column)} className="flex items-center space-x-1 transition-colors hover:text-gray-900">
        <span>{title}</span>
        {sortBy === column && (
          <span className="text-gray-900">{sortOrder === 'asc' ? '▲' : '▼'}</span>
        )}
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader column="collect_id" title="Collect ID" />
            <SortableHeader column="custom_order_id" title="Custom Order ID" />
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">School ID</th>
            <SortableHeader column="gateway" title="Gateway" />
            <SortableHeader column="order_amount" title="Order Amount" />
            <SortableHeader column="status" title="Status" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.collect_id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{transaction.collect_id}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{transaction.custom_order_id}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                <Link to={`/school/${transaction.school_id}`} className="text-indigo-600 hover:underline">
                  {transaction.school_id}
                </Link>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{transaction.gateway}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">₹{transaction.order_amount.toFixed(2)}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {/* --- This is the corrected line --- */}
                {/* I increased the horizontal padding from px-2.5 to px-3 to give the text more space. */}
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold leading-tight ${getStatusClass(transaction.status)}`}>
                  {transaction.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;

