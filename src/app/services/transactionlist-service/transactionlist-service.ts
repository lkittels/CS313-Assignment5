import { SelectionModel } from '@angular/cdk/collections';
import { inject, Injectable, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Expense } from '../../models/expense';
import { DeleteConfirmDialogComponent } from '../../components/DeleteConfirmDialog/delete-confirm-dialog/delete-confirm-dialog';
import { ExpenseService } from '../expense-services/expense-service';

@Injectable({
  providedIn: 'root',
})
export class TransactionListService {
  private expenseService = inject(ExpenseService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  readonly selection = new SelectionModel<string>(true, []);
  readonly filters = signal<TransactionFilters>({
    startDate: null,
    endDate: null,
    category: '',
    minAmount: null,
    maxAmount: null,
  });

  getSelectedRows(rows: Expense[]): Expense[] {
    return rows.filter((expense) => expense.id && this.selection.isSelected(expense.id));
  }

  isAllSelected(rows: Expense[]): boolean {
    const selectableIds = this.selectableExpenseIds(rows);
    return selectableIds.length > 0 && selectableIds.every((id) => this.selection.isSelected(id));
  }

  toggleAllRows(rows: Expense[]) {
    if (this.isAllSelected(rows)) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.selectableExpenseIds(rows));
  }

  toggleRow(expense: Expense) {
    if (!expense.id) {
      return;
    }

    this.selection.toggle(expense.id);
  }

  isRowSelected(expense: Expense): boolean {
    return !!expense.id && this.selection.isSelected(expense.id);
  }

  checkboxLabel(rows: Expense[], row?: Expense): string {
    if (!row) {
      return `${this.isAllSelected(rows) ? 'deselect' : 'select'} all`;
    }

    return `${this.isRowSelected(row) ? 'deselect' : 'select'} row`;
  }

  async editSelected(rows: Expense[]) {
    const selectedRows = this.getSelectedRows(rows);

    if (selectedRows.length !== 1) {
      return;
    }

    this.expenseService.beginEditingExpense(selectedRows[0]);
    await this.router.navigate(['/add-transaction']);
  }

  async deleteSelected(rows: Expense[]) {
    const selectedRows = this.getSelectedRows(rows);

    if (selectedRows.length === 0) {
      return;
    }

    const allRowsSelected = selectedRows.length === rows.length;
    const message = allRowsSelected
      ? 'This will delete all transactions that are currently on this page and cannot be undone.'
      : 'This will delete the selected transaction and cannot be undone.';

    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { message },
      maxWidth: '420px',
      width: '90vw',
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) {
      return;
    }

    await Promise.all(
      selectedRows
        .filter((expense): expense is Expense & { id: string } => typeof expense.id === 'string')
        .map((expense) => this.expenseService.deleteExpense(expense.id)),
    );

    this.selection.clear();
    this.expenseService.clearEditingExpense();
  }

  private selectableExpenseIds(rows: Expense[]): string[] {
    return rows
      .map((expense) => expense.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
  }

  setFilters(filters: Partial<TransactionFilters>) {
    this.filters.update((current) => ({ ...current, ...filters }));
  }

  clearFilters() {
    this.filters.set({
      startDate: null,
      endDate: null,
      category: '',
      minAmount: null,
      maxAmount: null,
    });
  }

  applyFilter(rows: Expense[], filters: TransactionFilters = this.filters()): Expense[] {
    const startDateMs = this.getStartOfDayTimestamp(filters.startDate);
    const endDateMs = this.getEndOfDayTimestamp(filters.endDate);
    const categoryFilter = filters.category.trim().toLowerCase();

    return rows.filter((expense) => {
      const expenseDateMs = expense.date.getTime();
      const categoryMatch =
        categoryFilter.length === 0 || expense.category.toLowerCase().includes(categoryFilter);
      const startDateMatch = startDateMs === null || expenseDateMs >= startDateMs;
      const endDateMatch = endDateMs === null || expenseDateMs <= endDateMs;
      const minAmountMatch =
        filters.minAmount === null ||
        Number.isNaN(filters.minAmount) ||
        expense.amount >= filters.minAmount;
      const maxAmountMatch =
        filters.maxAmount === null ||
        Number.isNaN(filters.maxAmount) ||
        expense.amount <= filters.maxAmount;

      return categoryMatch && startDateMatch && endDateMatch && minAmountMatch && maxAmountMatch;
    });
  }

  netIncome(rows: Expense[]): number {
    return rows.reduce((net, expense) => {
      return expense.type === 'Income' ? net + expense.amount : net - expense.amount;
    }, 0);
  }

  private getStartOfDayTimestamp(date: Date | null): number | null {
    if (!date) {
      return null;
    }

    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value.getTime();
  }

  private getEndOfDayTimestamp(date: Date | null): number | null {
    if (!date) {
      return null;
    }

    const value = new Date(date);
    value.setHours(23, 59, 59, 999);
    return value.getTime();
  }
}

export interface TransactionFilters {
  startDate: Date | null;
  endDate: Date | null;
  category: string;
  minAmount: number | null;
  maxAmount: number | null;
}
