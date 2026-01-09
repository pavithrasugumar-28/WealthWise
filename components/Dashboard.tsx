import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Wallet, CreditCard, TrendingUp, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

// Professional palette: Forest Greens, Dark Grays, Muted Golds
const COLORS = ['#065f46', '#059669', '#34d399', '#1f2937', '#6b7280', '#d1d5db'];

const Dashboard: React.FC = () => {
  const { totalBalance, budgetCategories, transactions, investments, connectedAccounts, syncAccount } = useFinance();
  const [isSyncing, setIsSyncing] = useState(false);

  const gpayAccount = connectedAccounts.find(a => a.provider === 'GPay');

  const handleSync = async () => {
    if (!gpayAccount) return;
    setIsSyncing(true);
    const count = await syncAccount(gpayAccount.id);
    setIsSyncing(false);
    if (count > 0) {
      alert(`Synced ${count} new transactions from GPay!`);
    } else {
      alert("Account is up to date.");
    }
  };

  // Filter out categories with 0 spending for cleaner chart
  const spendingData = budgetCategories
    .filter(b => b.spent > 0)
    .map(b => ({
      name: b.name,
      value: b.spent
    }));

  // Group transactions by month for the bar chart
  const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        date: d,
        name: d.toLocaleString('default', { month: 'short' }),
        expense: 0
      });
    }
    return months;
  };

  const monthlyData = getLast6Months().map(monthObj => {
    const expenses = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === monthObj.date.getMonth() && tDate.getFullYear() === monthObj.date.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { name: monthObj.name, expense: expenses };
  });

  const totalInvested = investments.reduce((acc, curr) => acc + curr.currentValue, 0);
  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Simple simulation for weekly change visualization
  const simulatedWeeklyChange = totalInvested * 0.005; 

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-500">Welcome back. Here is your wealth summary.</p>
        </div>
        {gpayAccount && (
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="hidden md:flex items-center gap-2 text-sm font-bold text-emerald-900 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync GPay"}
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-900 to-black rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/10">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <div className="bg-white/10 p-2 rounded-lg">
              <Wallet size={20} />
            </div>
            <span className="text-sm font-medium tracking-wide">TOTAL BALANCE</span>
          </div>
          <div className="text-4xl font-bold tracking-tight">₹{totalBalance.toLocaleString()}</div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <span className="text-xs bg-white/10 text-gray-300 font-semibold px-2 py-1 rounded">
                 Current
               </span>
            </div>
            {gpayAccount && (
               <div className="flex items-center gap-1.5 text-[10px] text-emerald-200 bg-emerald-900/50 px-2 py-1 rounded-full">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                 GPay Linked
               </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-4 text-gray-500">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-900">
              <CreditCard size={20} />
            </div>
            <span className="text-sm font-bold tracking-wide text-gray-400 uppercase">Total Spending</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ₹{totalSpent.toLocaleString()}
          </div>
          <div className="mt-4 text-xs text-gray-400">
             Across {transactions.length} transactions
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-4 text-gray-500">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-900">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-bold tracking-wide text-gray-400 uppercase">Investments</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{totalInvested.toLocaleString()}</div>
          <div className="mt-4 text-xs text-emerald-700 font-bold bg-emerald-50 inline-block px-2 py-1 rounded">
             +₹{Math.round(simulatedWeeklyChange).toLocaleString()} est.
          </div>
        </div>
      </div>

      {/* Mobile Sync Button (Visible only on mobile) */}
      {gpayAccount && (
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="md:hidden w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-emerald-900 px-4 py-3 rounded-xl shadow-lg active:scale-95 transition"
        >
          <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing Transactions..." : "Sync GPay Transactions"}
        </button>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6 text-lg">Expense Breakdown</h3>
          <div className="h-64">
            {spendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: 'none' }}
                    itemStyle={{ color: '#111827', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No spending data yet
              </div>
            )}
          </div>
          {spendingData.length > 0 && (
            <div className="flex justify-center gap-6 text-xs text-gray-500 mt-4 flex-wrap">
              {spendingData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="font-medium text-gray-700">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6 text-lg">Monthly Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={8}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#9ca3af" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} stroke="#9ca3af" />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: 'none' }}
                />
                <Bar dataKey="expense" fill="#065f46" radius={[4, 4, 4, 4]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-gray-500 ${t.source === 'GPay' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100'}`}>
                  {t.source === 'GPay' ? <Smartphone size={18} /> : <Wallet size={18} />}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t.description}</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">
                    {t.category} • {new Date(t.date).toLocaleDateString()} {t.source === 'GPay' && <span className="ml-1 text-blue-600 bg-blue-50 px-1 rounded text-[10px] font-bold">GPAY</span>}
                  </div>
                </div>
              </div>
              <div className="font-bold text-gray-900">-₹{t.amount}</div>
            </div>
          ))}
          {transactions.length === 0 && (
             <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                <AlertCircle className="opacity-50" />
                No transactions yet. Start a Task or Sync GPay.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;