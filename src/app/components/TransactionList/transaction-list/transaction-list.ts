import { Component, computed, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../services/expense-services/expense-service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { Expense } from '../../../models/expense';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DeleteConfirmDialog } from '../../DeleteConfirmDialog/delete-confirm-dialog/delete-confirm-dialog';

@Component({
  selector: 'app-transaction-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList {
  expenseService = inject(ExpenseService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  selection = new SelectionModel<string>(true, []);

  readonly displayedColumns: string[] = ['select', 'date', 'category', 'notes', 'type', 'amount'];
  readonly Date = Date;

  tableRows = computed(() => [...this.expenseService.expenses()]);

  getSelectedRows(): Expense[] {
    return this.tableRows().filter(
      (expense) => expense.id && this.selection.isSelected(expense.id),
    );
  }

  private selectableExpenseIds(): string[] {
    return this.tableRows()
      .map((expense) => expense.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const selectableIds = this.selectableExpenseIds();
    return selectableIds.length > 0 && selectableIds.every((id) => this.selection.isSelected(id));
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    const idsToSelect = this.selectableExpenseIds();
    this.selection.select(...idsToSelect);
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Expense): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }

    return `${this.isRowSelected(row) ? 'deselect' : 'select'} row`;
  }

  async editSelected() {
    const selectedRows = this.getSelectedRows();

    if (selectedRows.length !== 1) {
      return;
    }

    this.expenseService.beginEditingExpense(selectedRows[0]);
    await this.router.navigate(['/add-transaction']);
  }

  async deleteSelected() {
    const selectedRows = this.getSelectedRows();

    if (selectedRows.length === 0) {
      return;
    }

    const allRowsSelected = selectedRows.length === this.tableRows().length;
    const message = allRowsSelected
      ? 'This will delete all transactions that are currently on this page and cannot be undone.'
      : 'This will delete the selected transaction and cannot be undone.';

    const dialogRef = this.dialog.open(DeleteConfirmDialog, {
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
}
