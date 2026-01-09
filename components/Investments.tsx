import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Investment } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Plus, DollarSign, Briefcase, ArrowUpRight, ArrowDownRight, Activity, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#065f46', '#059669', '#34d399', '#1f2937', '#6b7280', '#d1d5db', '#10b981'];

const Investments: React.FC = () => {
  const { investments, addInvestment } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<'allocation' | 'performance'>('allocation');
  const [name, setName] = useState('');
  const [type, setType] = useState<Investment['type']>('Stock');
  const [invested, setInvested] = useState('');
  const [current, setCurrent] = useState('');

  const totalInvested = investments.reduce((acc, curr) => acc + curr.amountInvested, 0);
  const totalCurrent = investments.reduce((acc, curr) => acc + curr.currentValue, 0);
  const totalReturn = totalCurrent - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const dataByType = investments.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.type);
    if (existing) {
      existing.value += curr.currentValue;
    } else {
      acc.push({ name: curr.type, value: curr.currentValue });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  // Generate simulated historical data based on current totals
  const getPerformanceData = () => {
    if (investments.length === 0) return [];
    
    const data = [];
    const points = 6;
    
    for (let i = 0; i < points; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (points - 1 - i));
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        // Simulate growth curve: start at invested amount, end at current value
        // Add some random fluctuation
        const progress = i / (points - 1);
        let simulatedValue = totalInvested + (totalCurrent - totalInvested) * progress;
        
        // Add noise for months between start and end to make it look realistic
        if (i > 0 && i < points - 1) {
            const noise = (Math.random() * 0.15) - 0.05; // -5% to +10% volatility
            simulatedValue = simulatedValue * (1 + noise);
        }

        data.push({
            name: monthName,
            value: Math.round(simulatedValue),
            invested: totalInvested
        });
    }
    return data;
  };

  const performanceData = getPerformanceData();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && invested && current) {
      addInvestment({
        name,
        type,
        amountInvested: parseFloat(invested),
        currentValue: parseFloat(current)
      });
      setShowAdd(false);
      setName('');
      setInvested('');
      setCurrent('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-emerald-900 p-1.5 rounded-lg text-white">
            <Briefcase size={20} />
          </div>
          Investment Portfolio
        </h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-md font-medium"
        >
          <Plus size={18} /> Add Asset
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-gray-900 mb-6 text-lg border-b pb-2">Add New Investment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Asset Name</label>
              <input 
                type="text" 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 outline-none"
                placeholder="e.g. Apple Inc, Bitcoin"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Asset Type</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 outline-none"
                value={type}
                onChange={e => setType(e.target.value as any)}
              >
                <option value="Stock">Stock</option>
                <option value="Mutual Fund">Mutual Fund</option>
                <option value="ETF">ETF</option>
                <option value="Crypto">Crypto</option>
                <option value="Gold">Gold</option>
                <option value="Bond">Bond</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Amount Invested (₹)</label>
              <input 
                type="number" 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 outline-none"
                value={invested}
                onChange={e => setInvested(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Current Value (₹)</label>
              <input 
                type="number" 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 outline-none"
                value={current}
                onChange={e => setCurrent(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-emerald-900 text-white rounded-lg hover:bg-emerald-950 shadow-md font-bold">Add to Portfolio</button>
          </div>
        </form>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-4 text-gray-500">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-900">
               <DollarSign size={20} />
            </div>
            <span className="text-sm font-bold tracking-wide text-gray-400 uppercase">Total Invested</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{totalInvested.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-4 text-gray-500">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-900">
               <TrendingUp size={20} />
            </div>
            <span className="text-sm font-bold tracking-wide text-gray-400 uppercase">Current Value</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{totalCurrent.toLocaleString()}</div>
        </div>

        <div className={`rounded-2xl p-6 border shadow-sm transition ${totalReturn >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`flex items-center gap-3 mb-4 ${totalReturn >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            <div className={`p-2 rounded-lg ${totalReturn >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {totalReturn >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            </div>
            <span className="text-sm font-bold tracking-wide uppercase">Total Returns</span>
          </div>
          <div className={`text-3xl font-bold ${totalReturn >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
            {totalReturn >= 0 ? '+' : ''}₹{Math.abs(totalReturn).toLocaleString()}
          </div>
          <div className={`text-sm font-bold mt-1 ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {returnPercentage.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Portfolio Analysis</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('allocation')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition ${viewMode === 'allocation' ? 'bg-white shadow-sm text-emerald-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <PieChartIcon size={14} /> Allocation
                </button>
                <button 
                    onClick={() => setViewMode('performance')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition ${viewMode === 'performance' ? 'bg-white shadow-sm text-emerald-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Activity size={14} /> Trends
                </button>
            </div>
          </div>
          
          <div className="h-64 flex-1">
            {investments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'allocation' ? (
                    <PieChart>
                    <Pie
                        data={dataByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {dataByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => `₹${value.toLocaleString()}`} 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: 'none' }}
                        itemStyle={{ color: '#064e3b', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                ) : (
                    <AreaChart data={performanceData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} stroke="#9ca3af" dy={10} />
                        <YAxis axisLine={false} tickLine={false} fontSize={10} stroke="#9ca3af" tickFormatter={(val) => `₹${val/1000}k`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: 'none' }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, "Portfolio Value"]}
                        />
                        <Area type="monotone" dataKey="value" stroke="#059669" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                    </AreaChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                No data to display
              </div>
            )}
          </div>
          
          {investments.length > 0 && (
             <p className="text-center text-xs text-gray-400 mt-2">
                 {viewMode === 'allocation' ? 'Asset distribution by type' : 'Estimated 6-month performance'}
             </p>
          )}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Your Assets</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Name</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Type</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Invested</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Current</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Returns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {investments.map((inv) => {
                  const ret = inv.currentValue - inv.amountInvested;
                  const retPerc = (ret / inv.amountInvested) * 100;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition group">
                      <td className="px-6 py-4 font-semibold text-gray-900">{inv.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-bold border border-gray-200">{inv.type}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 font-mono">₹{inv.amountInvested.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 font-mono">₹{inv.currentValue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className={`font-bold ${ret >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {ret >= 0 ? '+' : ''}{retPerc.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {ret >= 0 ? '+' : ''}₹{Math.abs(ret).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {investments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No investments added yet. Click "Add Asset" to start tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investments;