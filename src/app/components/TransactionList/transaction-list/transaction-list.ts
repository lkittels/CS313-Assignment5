import { Component, computed, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../services/expense-services/expense-service';

@Component({
  selector: 'app-transaction-list',
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList {
  expenseService = inject(ExpenseService);

  readonly displayedColumns: string[] = ['date', 'category', 'notes', 'type', 'amount'];
  readonly Date = Date;

  tableRows = computed(() => [...this.expenseService.expenses()]);

  
}
