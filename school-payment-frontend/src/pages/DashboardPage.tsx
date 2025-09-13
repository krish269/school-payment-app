import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import TransactionsTable from '../components/TransactionsTable';
import useDebounce from '../hooks/useDebounce';

interface Transaction {
  collect_id: string;
  school_id: string;
  gateway: string;
  order_amount: number;
  transaction_amount?: number;
  status: string;
  custom_order_id: string;
}

const DashboardPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State for the status check modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusCheckId, setStatusCheckId] = useState('');
  const [statusResult, setStatusResult] = useState<{ status: string; message: string } | null>(null);

  // Read all parameters from the URL, providing defaults
  const statusFilter = searchParams.get('status') || 'all';
  const searchTerm = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'payment_time';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  // State for the search input, which updates instantly
  const [searchInput, setSearchInput] = useState(searchTerm);
  // Debounced search term, which updates after a delay
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  useEffect(() => {
    // This effect keeps the URL 'search' parameter in sync with the debounced search term
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }
    // Use 'replace: true' to prevent creating excessive browser history entries
    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, setSearchParams]);


  useEffect(() => {
    // This effect fetches data from the API whenever any URL parameter changes
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get('/payment/transactions', { 
            params: Object.fromEntries(searchParams) 
        });
        setTransactions(response.data);
      } catch (err) {
        setError('Failed to fetch transactions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [searchParams]);

  // Handler for the status check modal's API call
  const handleCheckStatus = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!statusCheckId) return;
      setStatusResult({ status: 'loading', message: 'Checking status...' });
      try {
          const response = await apiClient.get(`/payment/transaction-status/${statusCheckId}`);
          setStatusResult({ status: 'success', message: `Status: ${response.data.status}` });
      } catch (err) {
          setStatusResult({ status: 'error', message: 'Transaction ID not found.' });
      }
  }

  // Generic handler to update any URL search parameter
  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
        params.set(key, value);
    } else {
        params.delete(key);
    }
    setSearchParams(params);
  };

  // Handler for sorting logic
  const handleSort = (column: string) => {
    const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', column);
    params.set('sortOrder', newSortOrder);
    setSearchParams(params);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center rounded-lg bg-white p-12 text-gray-500 shadow-md">Loading...</div>;
    if (error) return <div className="flex items-center justify-center rounded-lg bg-white p-12 text-red-500 shadow-md">{error}</div>;
    if (transactions.length === 0) return <div className="flex items-center justify-center rounded-lg bg-white p-12 text-gray-500 shadow-md">No transactions found.</div>;
    return (
      <TransactionsTable
        transactions={transactions}
        onSort={handleSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transactions Dashboard</h1>
            <div className="flex items-center space-x-3">
                <button onClick={() => setIsModalOpen(true)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                    Check Status
                </button>
                <button onClick={handleLogout} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700">
                  Logout
                </button>
            </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by ID or Status</label>
              <input type="text" id="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="status" className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={statusFilter} onChange={(e) => updateSearchParams('status', e.target.value)}>
                    <option value="all">All</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                </select>
            </div>
        </div>

        <main className="mt-8">{renderContent()}</main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" aria-modal="true" role="dialog">
          <div className="w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Check Transaction Status</h3>
            <form onSubmit={handleCheckStatus} className="mt-4">
              <div>
                <label htmlFor="status-id" className="block text-sm font-medium text-gray-700">
                  Enter Custom Order ID
                </label>
                <input type="text" id="status-id" value={statusCheckId} onChange={(e) => setStatusCheckId(e.target.value)} placeholder="ORD-..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
              </div>
              <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => { setIsModalOpen(false); setStatusResult(null); setStatusCheckId(''); }} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                  Check
                </button>
              </div>
            </form>
            {statusResult && (
              <div className="mt-4 rounded-md p-3" style={{ backgroundColor: statusResult.status === 'success' ? '#d1fae5' : statusResult.status === 'error' ? '#fee2e2' : '#fef3c7' }}>
                <p className="text-sm font-medium text-center" style={{ color: statusResult.status === 'success' ? '#065f46' : statusResult.status === 'error' ? '#991b1b' : '#92400e' }}>
                  {statusResult.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

