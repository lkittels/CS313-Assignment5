import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/Dashboard/dashboard/dashboard').then((m) => m.DashboardComponent),
    title: 'Dashboard',
  },
  {
    path: 'add-transaction',
    loadComponent: () =>
      import('./components/ExpenseItem/expense-item/expense-item').then(
        (m) => m.ExpenseItemComponent,
      ),
    title: 'New Transaction',
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./components/TransactionList/transaction-list/transaction-list').then(
        (m) => m.TransactionListComponent,
      ),
    title: 'Transactions',
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./components/categories/categories/categories').then((m) => m.CategoriesComponent),
    title: 'Categories',
  },
];
