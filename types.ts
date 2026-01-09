export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  taskId?: string; // Links to a specific active task (e.g. Grocery Trip)
  source?: 'Manual' | 'GPay' | 'Bank'; // Track where the transaction came from
}

export interface ActiveTask {
  id: string;
  name: string; // e.g., "Grocery Shopping"
  budget: number;
  spent: number;
  status: 'active' | 'completed';
  items: Transaction[];
  createdAt: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  priority: number; // 1 is highest
  type: 'general' | 'emergency';
  status: 'ongoing' | 'achieved';
}

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
}

export interface Investment {
  id: string;
  name: string;
  type: 'Stock' | 'Bond' | 'Crypto' | 'Gold' | 'Real Estate' | 'Mutual Fund' | 'ETF' | 'Other';
  amountInvested: number;
  currentValue: number;
  date: string;
}

export interface UserProfile {
  name: string;
  email: string;
  occupation?: string;
  joinedDate: string;
  securityPin?: string; // 4 digit PIN
}

export interface ConnectedAccount {
  id: string;
  provider: 'GPay' | 'PhonePe' | 'Paytm' | 'Bank';
  accountNumber?: string; // masked
  lastSynced: string;
  status: 'connected' | 'error';
}

export interface AppState {
  transactions: Transaction[];
  activeTasks: ActiveTask[];
  savingGoals: SavingGoal[];
  budgetCategories: BudgetCategory[];
  investments: Investment[];
  totalBalance: number;
  monthlyIncome: number; // Added for budgeting
  user: UserProfile | null;
  connectedAccounts: ConnectedAccount[];
}

export interface AdviceRequest {
  transactions: Transaction[];
  goals: SavingGoal[];
  budgets: BudgetCategory[];
  investments: Investment[];
}
