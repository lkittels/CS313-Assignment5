import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExpenseService } from './services/expense-services/expense-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('CS313-Assignment5');

  expenseService = inject(ExpenseService);

  ngOnInit() {
    this.expenseService.loadExpenses();
  }
}
