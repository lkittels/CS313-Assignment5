import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseService } from '../../../services/expense-services/expense-service';
import { Expense, ExpenseType } from '../../../models/expense';

@Component({
  selector: 'app-expense-item',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatRadioModule,
  ],
  templateUrl: './expense-item.html',
  styleUrl: './expense-item.css',
})
export class ExpenseItem {
  readonly customCategoryValue = '__custom_category__';

  expenseService = inject(ExpenseService);

  amount = signal<number>(0);
  category = signal<string>('');
  customCategory = signal<string>('');
  date = signal<Date>(new Date());
  notes = signal<string>('');
  type = signal<ExpenseType>('Expense');

  addExpense() {
    const resolvedCategory =
      this.category() === this.customCategoryValue
        ? this.customCategory().trim()
        : this.category().trim();

    if (!resolvedCategory) {
      return;
    }

    const expense: Expense = {
      amount: this.amount(),
      category: resolvedCategory,
      date: this.date(),
      notes: this.notes(),
      type: this.type(),
    };
    this.expenseService.addExpense(expense);
    this.resetForm();
  }

  resetForm() {
    this.amount.set(0);
    this.category.set('');
    this.customCategory.set('');
    this.date.set(new Date());
    this.notes.set('');
    this.type.set('Expense');
  }
}
