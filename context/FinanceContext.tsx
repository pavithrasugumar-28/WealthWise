import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, ActiveTask, Transaction, SavingGoal, BudgetCategory, Investment, UserProfile, ConnectedAccount } from '../types';

interface FinanceContextType extends AppState {
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void;
  createActiveTask: (name: string, budget: number) => void;
  addItemToTask: (taskId: string, amount: number, description: string) => void;
  completeTask: (taskId: string) => void;
  addSavingGoal: (goal: Omit<SavingGoal, 'id' | 'currentAmount' | 'status'>) => void;
  reorderGoalPriority: (goalId: string, direction: 'up' | 'down') => void;
  allocateFundsToGoal: (amount: number, goalId?: string) => void;
  addInvestment: (inv: Omit<Investment, 'id' | 'date'>) => void;
  login: (name: string, email: string, occupation: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setTotalBalance: (amount: number) => void;
  connectAccount: (provider: ConnectedAccount['provider'], phoneNumber: string) => Promise<void>;
  syncAccount: (accountId: string) => Promise<number>;
  
  // Budgeting Features
  setMonthlyIncome: (amount: number) => void;
  updateCategoryLimit: (categoryId: string, limit: number) => void;

  // Security Features
  isAppLocked: boolean;
  unlockApp: (pin: string) => boolean;
  setupPin: (pin: string) => void;
  removePin: () => void;
}

const defaultState: AppState = {
  user: null,
  transactions: [],
  activeTasks: [],
  savingGoals: [],
  budgetCategories: [
    { id: 'bc1', name: 'Food & Groceries', limit: 0, spent: 0 },
    { id: 'bc2', name: 'Transportation', limit: 0, spent: 0 },
    { id: 'bc3', name: 'Entertainment', limit: 0, spent: 0 },
    { id: 'bc4', name: 'Utilities', limit: 0, spent: 0 },
    { id: 'bc5', name: 'Shopping', limit: 0, spent: 0 },
    { id: 'bc6', name: 'Health', limit: 0, spent: 0 },
  ],
  investments: [],
  totalBalance: 0,
  monthlyIncome: 0,
  connectedAccounts: [],
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isAppLocked, setIsAppLocked] = useState(false);

  // Persistence simulation
  useEffect(() => {
    const savedData = localStorage.getItem('wealthwise_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setState(prev => ({
           ...prev,
           ...parsed,
           budgetCategories: parsed.budgetCategories?.length ? parsed.budgetCategories : defaultState.budgetCategories,
           connectedAccounts: parsed.connectedAccounts || []
        }));
        
        // If user has a PIN, lock the app on load
        if (parsed.user?.securityPin) {
          setIsAppLocked(true);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wealthwise_data', JSON.stringify(state));
  }, [state]);

  const login = (name: string, email: string, occupation: string) => {
    setState(prev => ({
      ...prev,
      user: {
        name,
        email,
        occupation,
        joinedDate: new Date().toISOString()
      }
    }));
  };

  const logout = () => {
    setState(prev => ({
      ...prev,
      user: null
    }));
    setIsAppLocked(false);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null
    }));
  };

  // Budgeting Functions
  const setMonthlyIncome = (amount: number) => {
    setState(prev => ({ ...prev, monthlyIncome: amount }));
  };

  const updateCategoryLimit = (categoryId: string, limit: number) => {
    setState(prev => ({
      ...prev,
      budgetCategories: prev.budgetCategories.map(c => 
        c.id === categoryId ? { ...c, limit } : c
      )
    }));
  };

  // Security Functions
  const setupPin = (pin: string) => {
    updateProfile({ securityPin: pin });
  };

  const removePin = () => {
    // In a real app, verify old PIN first
    updateProfile({ securityPin: undefined });
    setIsAppLocked(false);
  };

  const unlockApp = (pin: string): boolean => {
    if (state.user?.securityPin === pin) {
      setIsAppLocked(false);
      return true;
    }
    return false;
  };

  const setTotalBalance = (amount: number) => {
    setState(prev => ({
      ...prev,
      totalBalance: amount
    }));
  };

  const connectAccount = async (provider: ConnectedAccount['provider'], phoneNumber: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mask the phone number for display
    const maskedNumber = 'xxxx-' + phoneNumber.slice(-4);

    const newAccount: ConnectedAccount = {
      id: Date.now().toString(),
      provider,
      accountNumber: maskedNumber,
      lastSynced: new Date().toISOString(),
      status: 'connected'
    };

    setState(prev => ({
      ...prev,
      connectedAccounts: [...prev.connectedAccounts, newAccount]
    }));
  };

  const syncAccount = async (accountId: string) => {
     // Simulate API delay
     await new Promise(resolve => setTimeout(resolve, 2000));

     const mockVendors = [
       { desc: 'Uber Ride', amt: 250, cat: 'Transportation' },
       { desc: 'Swiggy', amt: 450, cat: 'Food & Groceries' },
       { desc: 'Netflix Subscription', amt: 199, cat: 'Entertainment' },
       { desc: 'Local Pharmacy', amt: 340, cat: 'Health' },
       { desc: 'Shell Station', amt: 1500, cat: 'Transportation' },
       { desc: 'Starbucks', amt: 350, cat: 'Food & Groceries' }
     ];

     const count = Math.floor(Math.random() * 3) + 1;
     const newTransactions: Transaction[] = [];

     for (let i = 0; i < count; i++) {
        const pick = mockVendors[Math.floor(Math.random() * mockVendors.length)];
        newTransactions.push({
          id: Date.now().toString() + i,
          amount: pick.amt,
          description: pick.desc,
          category: pick.cat,
          date: new Date().toISOString(),
          source: 'GPay'
        });
     }

     setState(prev => {
       const updatedBudgets = [...prev.budgetCategories];
       newTransactions.forEach(t => {
         const idx = updatedBudgets.findIndex(b => b.name === t.category);
         if (idx !== -1) {
           updatedBudgets[idx] = { ...updatedBudgets[idx], spent: updatedBudgets[idx].spent + t.amount };
         }
       });

       return {
         ...prev,
         transactions: [...newTransactions, ...prev.transactions],
         totalBalance: prev.totalBalance - newTransactions.reduce((acc, t) => acc + t.amount, 0),
         budgetCategories: updatedBudgets,
         connectedAccounts: prev.connectedAccounts.map(acc => 
           acc.id === accountId ? { ...acc, lastSynced: new Date().toISOString() } : acc
         )
       };
     });

     return newTransactions.length;
  };

  const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      source: 'Manual'
    };
    
    const updatedBudgets = state.budgetCategories.map(b => 
      b.name.toLowerCase() === t.category.toLowerCase() 
      ? { ...b, spent: b.spent + t.amount }
      : b
    );

    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
      totalBalance: prev.totalBalance - t.amount,
      budgetCategories: updatedBudgets
    }));
  };

  const createActiveTask = (name: string, budget: number) => {
    const newTask: ActiveTask = {
      id: Date.now().toString(),
      name,
      budget,
      spent: 0,
      status: 'active',
      items: [],
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, activeTasks: [newTask, ...prev.activeTasks] }));
  };

  const addItemToTask = (taskId: string, amount: number, description: string) => {
    setState(prev => {
      const taskIndex = prev.activeTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;

      const task = prev.activeTasks[taskIndex];
      const newItem: Transaction = {
        id: Date.now().toString(),
        amount,
        description,
        category: 'Shopping',
        date: new Date().toISOString(),
        taskId,
        source: 'Manual'
      };

      const updatedTask = {
        ...task,
        spent: task.spent + amount,
        items: [...task.items, newItem]
      };

      const newTasks = [...prev.activeTasks];
      newTasks[taskIndex] = updatedTask;
      
      const updatedBudgets = prev.budgetCategories.map(b => 
        b.name === 'Shopping'
        ? { ...b, spent: b.spent + amount }
        : b
      );

      return {
        ...prev,
        activeTasks: newTasks,
        totalBalance: prev.totalBalance - amount,
        transactions: [newItem, ...prev.transactions],
        budgetCategories: updatedBudgets
      };
    });
  };

  const completeTask = (taskId: string) => {
    setState(prev => {
      const task = prev.activeTasks.find(t => t.id === taskId);
      if (!task) return prev;

      const excess = task.budget - task.spent;
      
      let newGoals = [...prev.savingGoals];
      if (excess > 0) {
        const targetGoalIndex = newGoals.findIndex(g => g.priority === 1);
        if (targetGoalIndex !== -1) {
          newGoals[targetGoalIndex] = {
            ...newGoals[targetGoalIndex],
            currentAmount: newGoals[targetGoalIndex].currentAmount + excess
          };
        }
      }

      return {
        ...prev,
        activeTasks: prev.activeTasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t),
        savingGoals: newGoals
      };
    });
  };

  const addSavingGoal = (goal: Omit<SavingGoal, 'id' | 'currentAmount' | 'status'>) => {
    const newGoal: SavingGoal = {
      ...goal,
      id: Date.now().toString(),
      currentAmount: 0,
      status: 'ongoing'
    };
    setState(prev => ({ ...prev, savingGoals: [...prev.savingGoals, newGoal] }));
  };

  const reorderGoalPriority = (goalId: string, direction: 'up' | 'down') => {
    setState(prev => {
      const goals = [...prev.savingGoals].sort((a, b) => a.priority - b.priority);
      const index = goals.findIndex(g => g.id === goalId);
      if (index === -1) return prev;

      if (direction === 'up' && index > 0) {
        const temp = goals[index].priority;
        goals[index].priority = goals[index - 1].priority;
        goals[index - 1].priority = temp;
      } else if (direction === 'down' && index < goals.length - 1) {
        const temp = goals[index].priority;
        goals[index].priority = goals[index + 1].priority;
        goals[index + 1].priority = temp;
      }
      
      goals.sort((a, b) => a.priority - b.priority);
      
      return { ...prev, savingGoals: goals };
    });
  };

  const allocateFundsToGoal = (amount: number, goalId?: string) => {
    setState(prev => {
      let newGoals = [...prev.savingGoals];
      if (goalId) {
        newGoals = newGoals.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g);
      } else {
        const p1Index = newGoals.findIndex(g => g.priority === 1);
        if (p1Index !== -1) {
          newGoals[p1Index] = { ...newGoals[p1Index], currentAmount: newGoals[p1Index].currentAmount + amount };
        }
      }
      return { ...prev, savingGoals: newGoals, totalBalance: prev.totalBalance - amount };
    });
  };

  const addInvestment = (inv: Omit<Investment, 'id' | 'date'>) => {
    const newInv: Investment = {
      ...inv,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      investments: [...prev.investments, newInv],
      totalBalance: prev.totalBalance - inv.amountInvested
    }));
  };

  return (
    <FinanceContext.Provider value={{
      ...state,
      addTransaction,
      createActiveTask,
      addItemToTask,
      completeTask,
      addSavingGoal,
      reorderGoalPriority,
      allocateFundsToGoal,
      addInvestment,
      login,
      logout,
      updateProfile,
      setTotalBalance,
      connectAccount,
      syncAccount,
      setMonthlyIncome,
      updateCategoryLimit,
      isAppLocked,
      unlockApp,
      setupPin,
      removePin
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
