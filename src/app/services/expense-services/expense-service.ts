import { Injectable, signal } from '@angular/core';
import { Expense } from '../../models/expense';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  expenses = signal<Expense[]>([]);

  private expenseCollection = collection(db, 'expenses');

  //READ (real-time)
  loadExpenses() {
    onSnapshot(this.expenseCollection, (snapshot) => {
      const expensesData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Expense[];

      this.expenses.set(expensesData);
    });
  }

  //CREATE
  async addExpense(expense: Expense) {
    await addDoc(this.expenseCollection, expense);
  }
}
