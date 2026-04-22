import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { onAuthStateChanged, signOut, type Unsubscribe as AuthUnsubscribe } from 'firebase/auth';
import { auth } from './firebase.config';
import { CategoryService } from './services/category-services/category-services';
import { ExpenseService } from './services/expense-services/expense-service';
import { AllCommunityModule, ModuleRegistry } from 'ag-charts-community';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-root',
  imports: [MatButtonModule, MatToolbarModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent implements OnInit, OnDestroy {
  protected readonly title = signal('CS313-Assignment5');
  readonly isAuthenticated = signal(false);

  categoryService = inject(CategoryService);
  expenseService = inject(ExpenseService);
  private router = inject(Router);
  private authUnsubscribe: AuthUnsubscribe | null = null;

  ngOnInit() {
    this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
      this.isAuthenticated.set(!!user);
    });

    this.categoryService.loadCategories();
    this.expenseService.loadExpenses();
  }

  async logout(): Promise<void> {
    await signOut(auth);
    await this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.authUnsubscribe?.();
    this.authUnsubscribe = null;
  }
}
