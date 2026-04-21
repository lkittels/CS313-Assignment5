import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AgCharts } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { ExpenseService } from '../../../services/expense-services/expense-service';

type MonthlyChartDatum = {
  month: string;
  income: number;
  expense: number;
};

@Component({
  selector: 'app-bar-chart',
  imports: [AgCharts],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChart {
  private readonly expenseService = inject(ExpenseService);
  private readonly monthLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  readonly selectedYear = signal(new Date().getFullYear());
  readonly selectedCategory = signal<string | null>(null);

  readonly chartOptions = computed<AgChartOptions>(() => ({
    title: {
      text: 'Monthly Income Vs Expenses',
    },
    data: this.getData(),
    series: [
      {
        type: 'bar',
        xKey: 'month',
        yKey: 'income',
        yName: 'Income',
        fill: '#15803d',
      },
      {
        type: 'bar',
        xKey: 'month',
        yKey: 'expense',
        yName: 'Expense',
        fill: '#b91c1c',
      },
    ],
    axes: {
      x: {
        type: 'category',
        position: 'bottom',
      },
      y: {
        type: 'number',
        position: 'left',
      },
    },
  }));

  getData(): MonthlyChartDatum[] {
    const selectedYear = this.selectedYear();
    const selectedCategory = this.selectedCategory();

    const filteredExpenses = this.expenseService.expenses().filter((entry) => {
        const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
        return !Number.isNaN(entryDate.getTime()) && entryDate.getFullYear() === selectedYear;
      })
      .filter((entry) => (selectedCategory ? entry.category === selectedCategory : true));

    const incomeByMonth = Array.from({ length: 12 }, () => 0);
    const expenseByMonth = Array.from({ length: 12 }, () => 0);

    for (const entry of filteredExpenses) {
      const monthIndex = new Date(entry.date).getMonth();
      if (entry.type === 'Income') {
        incomeByMonth[monthIndex] += entry.amount;
      } else {
        expenseByMonth[monthIndex] += entry.amount;
      }
    }

    return this.monthLabels.map((month, index) => ({
      month,
      income: incomeByMonth[index],
      expense: expenseByMonth[index],
    }));
  }
}
