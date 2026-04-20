import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseService } from '../../../services/expense-services/expense-service';
import { Expense, ExpenseCategory, ExpenseType } from '../../../models/expense';
import { Router } from '@angular/router';

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
  private router = inject(Router);

  readonly editingExpense = this.expenseService.editingExpense;

  amount = signal<number | null>(null);
  category = signal<string>('');
  customCategory = signal<string>('');
  date = signal<Date>(new Date());
  notes = signal<string>('');
  type = signal<ExpenseType>('Expense');

  constructor() {
    const expense = this.editingExpense();

    if (expense) {
      this.loadExpense(expense);
    }
  }

  private loadExpense(expense: Expense) {
    this.amount.set(expense.amount);
    this.date.set(expense.date);
    this.notes.set(expense.notes ?? '');
    this.type.set(expense.type);

    if (this.expenseService.allCategories().includes(expense.category as ExpenseCategory)) {
      this.category.set(expense.category);
      this.customCategory.set('');
      return;
    }

    this.category.set(this.customCategoryValue);
    this.customCategory.set(expense.category);
  }

  async addExpense(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const resolvedCategory =
      this.category() === this.customCategoryValue
        ? this.customCategory().trim()
        : this.category().trim();

    if (!resolvedCategory) {
      return;
    }

    const expense: Expense = {
      amount: this.amount() ?? 0,
      category: resolvedCategory,
      date: this.date(),
      notes: this.notes(),
      type: this.type(),
    };

    const expenseBeingEdited = this.editingExpense();

    if (expenseBeingEdited?.id) {
      await this.expenseService.updateExpense(expenseBeingEdited.id, expense);
      this.expenseService.clearEditingExpense();
    } else {
      await this.expenseService.addExpense(expense);
    }

    this.resetForm(form);
    await this.router.navigate(['/transactions']);
  }

  resetForm(form?: NgForm) {
    this.amount.set(null);
    this.category.set('');
    this.customCategory.set('');
    this.date.set(new Date());
    this.notes.set('');
    this.type.set('Expense');
    this.expenseService.clearEditingExpense();

    form?.resetForm({
      amount: null,
      category: '',
      customCategory: '',
      date: new Date(),
      notes: '',
      type: 'Expense',
    });
  }
}
