import { Routes } from '@angular/router';
import { authGuard, guestOnlyGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestOnlyGuard],
    loadComponent: () => import('./components/UserLogin/login/login/login').then((m) => m.Login),
    title: 'Login',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/Dashboard/dashboard/dashboard').then((m) => m.DashboardComponent),
    title: 'Dashboard',
  },
  {
    path: 'add-transaction',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/ExpenseItem/expense-item/expense-item').then(
        (m) => m.ExpenseItemComponent,
      ),
    title: 'New Transaction',
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/TransactionList/transaction-list/transaction-list').then(
        (m) => m.TransactionListComponent,
      ),
    title: 'Transactions',
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/categories/categories/categories').then((m) => m.CategoriesComponent),
    title: 'Categories',
  },
  {
    path: 'register',
    canActivate: [guestOnlyGuard],
    loadComponent: () =>
      import('./components/UserLogin/registration/registration').then(
        (m) => m.RegistrationComponent,
      ),
    title: 'Register',
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/UserLogin/profile/profile').then((m) => m.ProfileComponent),
    title: 'Profile',
  },
];
