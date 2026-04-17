import { computed, Injectable, signal } from '@angular/core';
import { Expense, ExpenseCategory } from '../../models/expense';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  expenses = signal<Expense[]>([]);

  predefinedCategoryList = signal<ExpenseCategory[]>([
    'Food',
    'Rent',
    'Travel',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Utilities',
    'Education',
    'Salary',
    'Freelance',
    'Investment',
    'Other',
  ]);

  private normalizeDate(dateValue: unknown): Date {
    if (dateValue instanceof Date) {
      return dateValue;
    }

    if (
      typeof dateValue === 'object' &&
      dateValue !== null &&
      'toDate' in dateValue &&
      typeof (dateValue as { toDate: unknown }).toDate === 'function'
    ) {
      return (dateValue as { toDate: () => Date }).toDate();
    }

    return new Date(dateValue as string | number);
  }

  netIncome = computed(() => {
    return this.expenses().reduce((net, expense) => {
      return expense.type === 'Income' ? net + expense.amount : net - expense.amount;
    }, 0);
  });

  userDefinedCategories = computed(() => {
    const predefinedSet = new Set(this.predefinedCategoryList());
    const custom = this.expenses()
      .map((expense) => expense.category.trim())
      .filter((category) => category.length > 0 && !predefinedSet.has(category as ExpenseCategory));

    return [...new Set(custom)].sort((a, b) => a.localeCompare(b));
  });

  allCategories = computed(() => [
    ...this.predefinedCategoryList(),
    ...this.userDefinedCategories(),
  ]);

  private expenseCollection = collection(db, 'expenses');

  //READ (real-time)
  loadExpenses() {
    onSnapshot(this.expenseCollection, (snapshot) => {
      const expensesData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: this.normalizeDate(doc.data()['date']),
      })) as Expense[];

      this.expenses.set(expensesData);
    });
  }

  //CREATE
  async addExpense(expense: Expense) {
    await addDoc(this.expenseCollection, expense);
    this.loadExpenses();
  }
}
