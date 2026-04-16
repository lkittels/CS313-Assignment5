export interface Expense {
  id?: string;
  amount: number;
  category: string;
  date: Date;
  notes?: string;
  type: ExpenseType;
}

export const PREDEFINED_EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Travel',
  'Utilities',
  'Entertainment',
  'Other'
] as const;

export type PredefinedExpenseCategory = (typeof PREDEFINED_EXPENSE_CATEGORIES)[number];

export type ExpenseType = 'Income' | 'Expense';
