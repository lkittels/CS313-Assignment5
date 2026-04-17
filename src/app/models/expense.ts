export interface Expense {
  id?: string;
  amount: number;
  category: ExpenseCategory | string;
  date: Date;
  notes?: string;
  type: ExpenseType;
}

export type ExpenseCategory =
  | 'Food'
  | 'Rent'
  | 'Travel'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Utilities'
  | 'Education'
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Other';

export type ExpenseType = 'Income' | 'Expense';
