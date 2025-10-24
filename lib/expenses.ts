// Expense Tracking System for Admin

export type ExpenseCategory = 
  | 'AI Credits' 
  | 'Tools & Subscriptions' 
  | 'Marketing' 
  | 'Development' 
  | 'Infrastructure' 
  | 'Other';

export interface Expense {
  id: string;
  date: string; // ISO date string
  category: ExpenseCategory;
  description: string;
  amount: number; // in INR
  isRecurring: boolean;
  recurringPeriod?: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const EXPENSES_STORAGE_KEY = 'adminExpenses';

// Get all expenses
export function getAllExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(EXPENSES_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse expenses:', error);
      return [];
    }
  }
  
  // Initialize with some sample expenses
  const sampleExpenses: Expense[] = [
    {
      id: '1',
      date: '2025-10-01',
      category: 'Infrastructure',
      description: 'AWS Hosting & Database',
      amount: 207500, // $2500 * 83
      isRecurring: true,
      recurringPeriod: 'monthly',
      notes: 'Server hosting, database, CDN costs',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      date: '2025-10-01',
      category: 'Marketing',
      description: 'Google Ads Campaign',
      amount: 415000, // $5000 * 83
      isRecurring: true,
      recurringPeriod: 'monthly',
      notes: 'October marketing budget',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      date: '2025-10-15',
      category: 'AI Credits',
      description: 'OpenAI API Credits Purchase',
      amount: 83000, // $1000 * 83
      isRecurring: false,
      notes: 'Bulk credit purchase for course generation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      date: '2025-10-01',
      category: 'Tools & Subscriptions',
      description: 'Design Tools & Analytics',
      amount: 8300, // $100 * 83
      isRecurring: true,
      recurringPeriod: 'monthly',
      notes: 'Figma, Analytics, Email service',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  saveExpenses(sampleExpenses);
  return sampleExpenses;
}

// Save expenses
function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
}

// Add new expense
export function addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense {
  const expenses = getAllExpenses();
  const newExpense: Expense = {
    ...expense,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
}

// Update expense
export function updateExpense(id: string, updates: Partial<Expense>): Expense | null {
  const expenses = getAllExpenses();
  const index = expenses.findIndex(e => e.id === id);
  
  if (index === -1) return null;
  
  expenses[index] = {
    ...expenses[index],
    ...updates,
    id: expenses[index].id, // Prevent ID change
    createdAt: expenses[index].createdAt, // Prevent creation date change
    updatedAt: new Date().toISOString(),
  };
  
  saveExpenses(expenses);
  return expenses[index];
}

// Delete expense
export function deleteExpense(id: string): boolean {
  const expenses = getAllExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  
  if (filtered.length === expenses.length) return false;
  
  saveExpenses(filtered);
  return true;
}

// Get expenses by category
export function getExpensesByCategory(category: ExpenseCategory): Expense[] {
  return getAllExpenses().filter(e => e.category === category);
}

// Get expenses by date range
export function getExpensesByDateRange(startDate: string, endDate: string): Expense[] {
  const expenses = getAllExpenses();
  return expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
  });
}

// Get total expenses
export function getTotalExpenses(category?: ExpenseCategory): number {
  const expenses = category 
    ? getExpensesByCategory(category)
    : getAllExpenses();
    
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

// Get monthly recurring expenses
export function getMonthlyRecurringExpenses(): number {
  const expenses = getAllExpenses();
  return expenses
    .filter(e => e.isRecurring && e.recurringPeriod === 'monthly')
    .reduce((total, expense) => total + expense.amount, 0);
}

// Get expenses summary by category
export function getExpensesSummaryByCategory(): Record<ExpenseCategory, number> {
  const expenses = getAllExpenses();
  const summary: Record<string, number> = {
    'AI Credits': 0,
    'Tools & Subscriptions': 0,
    'Marketing': 0,
    'Development': 0,
    'Infrastructure': 0,
    'Other': 0,
  };
  
  expenses.forEach(expense => {
    summary[expense.category] += expense.amount;
  });
  
  return summary as Record<ExpenseCategory, number>;
}

// Get expenses for current month
export function getCurrentMonthExpenses(): Expense[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return getExpensesByDateRange(
    startOfMonth.toISOString().split('T')[0],
    endOfMonth.toISOString().split('T')[0]
  );
}

// Get total expenses for current month
export function getCurrentMonthTotalExpenses(): number {
  const expenses = getCurrentMonthExpenses();
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}
