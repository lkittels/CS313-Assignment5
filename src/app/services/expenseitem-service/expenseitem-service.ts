import { inject, Injectable, signal } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { auth } from '../../firebase.config';
import { Expense, ExpenseCategory, ExpenseType } from '../../models/expense';
import { CategoryService } from '../category-services/category-services';
import { ExpenseService } from '../expense-services/expense-service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseItemService {
  readonly customCategoryValue = '__custom_category__';

  private categoryService = inject(CategoryService);
  private expenseService = inject(ExpenseService);
  private router = inject(Router);

  readonly editingExpense = this.expenseService.editingExpense;

  readonly predefinedCategories = this.categoryService.predefinedCategoryList;
  readonly customCategories = this.categoryService.userDefinedCategories;

  readonly amount = signal<number | null>(null);
  readonly category = signal<string>('');
  readonly customCategory = signal<string>('');
  readonly date = signal<Date>(new Date());
  readonly notes = signal<string>('');
  readonly type = signal<ExpenseType>('Expense');

  initializeForm() {
    const expense = this.editingExpense();

    if (expense) {
      this.loadExpense(expense);
      return;
    }

    this.resetForm();
  }

  async saveExpense(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const resolvedCategory = this.resolveCategory();
    if (!resolvedCategory) {
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      return;
    }

    const expense: Expense = {
      userId,
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

  getCategoryIcon(categoryName: string): string {
    return this.categoryService.getCategoryIcon(categoryName);
  }

  getCategoryColor(categoryName: string): string {
    return this.categoryService.getCategoryColor(categoryName);
  }

  private resolveCategory(): string {
    return this.category() === this.customCategoryValue
      ? this.customCategory().trim()
      : this.category().trim();
  }

  private loadExpense(expense: Expense) {
    this.amount.set(expense.amount);
    this.date.set(expense.date);
    this.notes.set(expense.notes ?? '');
    this.type.set(expense.type);

    if (this.predefinedCategories().includes(expense.category as ExpenseCategory)) {
      this.category.set(expense.category);
      this.customCategory.set('');
      return;
    }

    this.category.set(this.customCategoryValue);
    this.customCategory.set(expense.category);
  }
}
