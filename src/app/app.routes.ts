import { Routes } from '@angular/router';
import { ExpenseItem } from './components/ExpenseItem/expense-item/expense-item';
import { Dashboard } from './components/Dashboard/dashboard/dashboard';
import { TransactionList } from './components/TransactionList/transaction-list/transaction-list';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    title: 'Dashboard',
  },
  {
    path: 'add-transaction',
    component: ExpenseItem,
    title: 'New Transaction',
  },
  {
    path: 'transactions',
    component: TransactionList,
    title: 'Transactions',
  },
];
