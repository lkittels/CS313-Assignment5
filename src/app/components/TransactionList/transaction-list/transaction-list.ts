import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../services/expense-services/expense-service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Expense } from '../../../models/expense';
import { TransactionListService } from '../../../services/transactionlist-service/transactionlist-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from '../../../services/category-services/category-services';

@Component({
  selector: 'app-transaction-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionListComponent {
  categoryService = inject(CategoryService);
  expenseService = inject(ExpenseService);
  private transactionListService = inject(TransactionListService);

  selection = this.transactionListService.selection;

  readonly displayedColumns: string[] = ['select', 'date', 'category', 'notes', 'type', 'amount'];
  readonly Date = Date;
  readonly filters = this.transactionListService.filters;
  readonly allCategories = this.expenseService.allCategories;

  filteredNetIncome = computed(() => this.transactionListService.netIncome(this.tableRows()));

  private allRows = computed(() => [...this.expenseService.expenses()]);
  tableRows = computed(() =>
    this.transactionListService.applyFilter(this.allRows(), this.filters()),
  );

  onCategoryFilterChange(category: string) {
    this.transactionListService.setFilters({ category });
  }

  onDateFilterChange(field: 'startDate' | 'endDate', date: Date | null) {
    this.transactionListService.setFilters({
      [field]: date,
    });
  }

  onAmountFilterChange(field: 'minAmount' | 'maxAmount', rawAmount: string) {
    this.transactionListService.setFilters({
      [field]: rawAmount === '' ? null : Number(rawAmount),
    });
  }

  clearFilters() {
    this.transactionListService.clearFilters();
  }

  getSelectedRows(): Expense[] {
    return this.transactionListService.getSelectedRows(this.tableRows());
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.transactionListService.isAllSelected(this.tableRows());
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    this.transactionListService.toggleAllRows(this.tableRows());
  }

  toggleRow(expense: Expense) {
    this.transactionListService.toggleRow(expense);
  }

  isRowSelected(expense: Expense): boolean {
    return this.transactionListService.isRowSelected(expense);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Expense): string {
    return this.transactionListService.checkboxLabel(this.tableRows(), row);
  }

  async editSelected() {
    await this.transactionListService.editSelected(this.tableRows());
  }

  async deleteSelected() {
    await this.transactionListService.deleteSelected(this.tableRows());
  }

  getCategoryIcon(categoryName: string): string {
    return this.categoryService.getCategoryIcon(categoryName);
  }

  getCategoryColor(categoryName: string): string {
    return this.categoryService.getCategoryColor(categoryName);
  }
}
