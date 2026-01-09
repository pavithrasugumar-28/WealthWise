import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Lock, Unlock, Delete } from 'lucide-react';

const SecurityLock: React.FC = () => {
  const { unlockApp } = useFinance();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      const success = unlockApp(pin);
      if (!success) {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  }, [pin, unlockApp]);

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-emerald-950 flex flex-col items-center justify-center text-white z-50">
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-10 duration-500">
        <div className="w-16 h-16 bg-emerald-900 rounded-2xl flex items-center justify-center mb-4 shadow-xl border border-emerald-800">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold">WealthWise Locked</h1>
        <p className="text-emerald-400 mt-2 text-sm">Enter your PIN to access your finances</p>
      </div>

      {/* Dots */}
      <div className="flex gap-4 mb-12">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < pin.length 
                ? error ? 'bg-red-500 scale-110' : 'bg-emerald-400 scale-110' 
                : 'bg-emerald-900'
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-6 max-w-xs w-full px-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handlePress(num.toString())}
            className="w-16 h-16 rounded-full bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-800/50 flex items-center justify-center text-2xl font-bold transition active:scale-95"
          >
            {num}
          </button>
        ))}
        <div className="w-16 h-16"></div> {/* Spacer */}
        <button
          onClick={() => handlePress("0")}
          className="w-16 h-16 rounded-full bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-800/50 flex items-center justify-center text-2xl font-bold transition active:scale-95"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full hover:bg-red-900/20 flex items-center justify-center text-red-400 transition active:scale-95"
        >
          <Delete size={24} />
        </button>
      </div>
      
      {error && <div className="mt-8 text-red-400 font-medium animate-pulse">Incorrect PIN</div>}
    </div>
  );
};

export default SecurityLock;
