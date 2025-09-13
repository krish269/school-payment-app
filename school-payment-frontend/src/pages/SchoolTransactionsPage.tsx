import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import TransactionsTable from '../components/TransactionsTable'; // We can reuse our table!

interface Transaction {
  collect_id: string;
  school_id: string;
  gateway: string;
  order_amount: number;
  transaction_amount?: number;
  status: string;
  custom_order_id: string;
}

const SchoolTransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { schoolId } = useParams<{ schoolId: string }>(); // Get the school ID from the URL

  useEffect(() => {
    if (!schoolId) return;

    const fetchSchoolTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        // Call the backend endpoint for fetching transactions by school
        const response = await apiClient.get(`/payment/transactions/school/${schoolId}`);
        setTransactions(response.data);
      } catch (err) {
        setError(`Failed to fetch transactions for school ID: ${schoolId}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolTransactions();
  }, [schoolId]); // Re-run the effect if the schoolId changes

  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (transactions.length === 0) return <p className="text-center text-gray-500">No transactions found for this school.</p>;
    // We reuse the same table component, but it won't be sortable on this page for simplicity.
    return <TransactionsTable transactions={transactions} onSort={() => {}} sortBy="" sortOrder="asc" />;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800">&larr; Back to All Transactions</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Transactions for School</h1>
        <p className="mt-2 text-gray-600">{schoolId}</p>

        <div className="mt-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SchoolTransactionsPage;
