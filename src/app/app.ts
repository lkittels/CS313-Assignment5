import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CategoryService } from './services/category-services/category-services';
import { ExpenseService } from './services/expense-services/expense-service';

@Component({
  selector: 'app-root',
  imports: [MatButtonModule, MatToolbarModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent implements OnInit {
  protected readonly title = signal('CS313-Assignment5');

  categoryService = inject(CategoryService);
  expenseService = inject(ExpenseService);

  ngOnInit() {
    this.categoryService.loadCategories();
    this.expenseService.loadExpenses();
  }
}
