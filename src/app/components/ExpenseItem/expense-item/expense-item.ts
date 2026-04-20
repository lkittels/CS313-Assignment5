import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseItemService } from '../../../services/expenseitem-service/expenseitem-service';

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
  readonly expenseItemService = inject(ExpenseItemService);

  readonly customCategoryValue = this.expenseItemService.customCategoryValue;
  readonly editingExpense = this.expenseItemService.editingExpense;

  readonly amount = this.expenseItemService.amount;
  readonly category = this.expenseItemService.category;
  readonly customCategory = this.expenseItemService.customCategory;
  readonly date = this.expenseItemService.date;
  readonly notes = this.expenseItemService.notes;
  readonly type = this.expenseItemService.type;

  constructor() {
    this.expenseItemService.initializeForm();
  }

  async addExpense(form: NgForm) {
    await this.expenseItemService.saveExpense(form);
  }

  resetForm(form?: NgForm) {
    this.expenseItemService.resetForm(form);
  }
}
