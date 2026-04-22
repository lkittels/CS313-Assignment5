import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { BarChart } from '../../Charts/bar-chart/bar-chart';
import { PieChart } from '../../Charts/pieChart/pie-chart/pie-chart';
import { CategoryService } from '../../../services/category-services/category-services';
import { ExpenseService } from '../../../services/expense-services/expense-service';

type CategoryBudgetStatus = {
  name: string;
  icon: string;
  color: string;
  budget: number;
  spent: number;
  percentUsed: number;
};

type OverviewSummary = {
  income: number;
  spending: number;
  net: number;
  budgetTotal: number;
  budgetUsagePercent: number;
  budgetDifference: number;
  remainingBudget: number;
};

type HighestExpense = {
  name: string;
  amount: number;
  icon: string;
  color: string;
};

@Component({
  selector: 'app-dashboard',
  imports: [MatGridListModule, MatIconModule, BarChart, PieChart, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly expenseService = inject(ExpenseService);

  readonly overviewSummary = computed<OverviewSummary>(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthExpenses = this.expenseService.expenses().filter((expense) => {
      const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
      return (
        !Number.isNaN(expenseDate.getTime()) &&
        expenseDate.getFullYear() === currentYear &&
        expenseDate.getMonth() === currentMonth
      );
    });

    const income = currentMonthExpenses
      .filter((expense) => expense.type === 'Income')
      .reduce((total, expense) => total + expense.amount, 0);

    const spending = currentMonthExpenses
      .filter((expense) => expense.type === 'Expense')
      .reduce((total, expense) => total + expense.amount, 0);

    const budgetTotal = this.categoryService
      .categories()
      .filter((category) => category.isActive && category.monthlyBudget > 0)
      .reduce((total, category) => total + this.categoryService.monthlyBudget(category.name), 0);

    const net = income - spending;
    const budgetDifference = budgetTotal - spending;
    const budgetUsagePercent = budgetTotal > 0 ? (spending / budgetTotal) * 100 : 0;
    const remainingBudget = Math.max(budgetDifference, 0);

    return {
      income,
      spending,
      net,
      budgetTotal,
      budgetUsagePercent,
      budgetDifference,
      remainingBudget,
    };
  });

  readonly budgetUsageFillPercent = computed(() =>
    Math.min(this.overviewSummary().budgetUsagePercent, 100),
  );

  readonly highestExpense = computed<HighestExpense | null>(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const highest = this.expenseService
      .expenses()
      .filter((expense) => expense.type === 'Expense')
      .filter((expense) => {
        const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
        return (
          !Number.isNaN(expenseDate.getTime()) &&
          expenseDate.getFullYear() === currentYear &&
          expenseDate.getMonth() === currentMonth
        );
      })
      .sort((a, b) => b.amount - a.amount)[0];

    if (!highest) {
      return null;
    }

    return {
      name: String(highest.notes?.trim() || highest.category),
      amount: highest.amount,
      icon: this.categoryService.getCategoryIcon(highest.category),
      color: this.categoryService.getCategoryColor(highest.category),
    };
  });

  readonly nearBudgetCategories = computed<CategoryBudgetStatus[]>(() => {
    return this.categoryBudgetStatus()
      .filter((category) => category.percentUsed >= 80 && category.percentUsed < 100)
      .sort((a, b) => b.percentUsed - a.percentUsed);
  });

  readonly overBudgetCategories = computed<CategoryBudgetStatus[]>(() => {
    return this.categoryBudgetStatus()
      .filter((category) => category.percentUsed >= 100)
      .sort((a, b) => b.percentUsed - a.percentUsed);
  });

  private readonly categoryBudgetStatus = computed<CategoryBudgetStatus[]>(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentMonthExpenses = this.expenseService
      .expenses()
      .filter((expense) => expense.type === 'Expense')
      .filter((expense) => {
        const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
        return (
          !Number.isNaN(expenseDate.getTime()) &&
          expenseDate.getFullYear() === currentYear &&
          expenseDate.getMonth() === currentMonth
        );
      });

    const categoriesWithExpenses = [
      ...new Set(currentMonthExpenses.map((expense) => expense.category)),
    ];

    return categoriesWithExpenses
      .map((categoryName) => {
        const budget = this.categoryService.monthlyBudget(categoryName);
        const spent = currentMonthExpenses
          .filter((expense) => expense.category === categoryName)
          .reduce((total, expense) => total + expense.amount, 0);

        const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;

        return {
          name: categoryName,
          icon: this.categoryService.getCategoryIcon(categoryName),
          color: this.categoryService.getCategoryColor(categoryName),
          budget,
          spent,
          percentUsed,
        };
      })
      .filter((category) => category.budget > 0);
  });
}
