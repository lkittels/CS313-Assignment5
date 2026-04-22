import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { onAuthStateChanged, type Unsubscribe as AuthUnsubscribe } from 'firebase/auth';
import { Expense, ExpenseCategory } from '../../models/expense';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService implements OnDestroy {
  expenses = signal<Expense[]>([]);
  editingExpense = signal<Expense | null>(null);

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
  private expenseSnapshotUnsubscribe: Unsubscribe | null = null;
  private authUnsubscribe: AuthUnsubscribe | null = null;

  //READ (real-time)
  loadExpenses() {
    if (this.authUnsubscribe) {
      return;
    }

    this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
      this.expenseSnapshotUnsubscribe?.();
      this.expenseSnapshotUnsubscribe = null;

      if (!user) {
        this.expenses.set([]);
        return;
      }

      const expensesQuery = query(this.expenseCollection, where('userId', '==', user.uid));

      this.expenseSnapshotUnsubscribe = onSnapshot(expensesQuery, (snapshot) => {
        const expensesData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          date: this.normalizeDate(doc.data()['date']),
        })) as Expense[];

        this.expenses.set(expensesData);
      });
    });
  }

  beginEditingExpense(expense: Expense) {
    this.editingExpense.set(expense);
  }

  clearEditingExpense() {
    this.editingExpense.set(null);
  }

  //CREATE
  async addExpense(expense: Expense) {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to add an expense.');
    }

    await addDoc(this.expenseCollection, {
      ...expense,
      userId,
    });
  }
  //UPDATE
  async updateExpense(id: string, expense: Partial<Expense>) {
    const expenseRef = doc(db, 'expenses', id);
    await updateDoc(expenseRef, { ...expense });
  }
  //DELETE
  async deleteExpense(id: string) {
    const expenseRef = doc(db, 'expenses', id);
    await deleteDoc(expenseRef);
  }

  ngOnDestroy(): void {
    this.authUnsubscribe?.();
    this.authUnsubscribe = null;
    this.expenseSnapshotUnsubscribe?.();
    this.expenseSnapshotUnsubscribe = null;
  }
}
