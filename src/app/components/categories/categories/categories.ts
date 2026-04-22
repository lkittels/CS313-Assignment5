import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { auth } from '../../../firebase.config';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category-services/category-services';

@Component({
  selector: 'app-categories',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent implements OnInit {
  readonly categoryService = inject(CategoryService);
  private readonly formBuilder = inject(FormBuilder);

  readonly editingCategoryId = signal<string | null>(null);
  readonly formSubmitted = signal(false);
  readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    icon: ['category', [Validators.required]],
    color: ['#607d8b', [Validators.required]],
    monthlyBudget: [0, [Validators.required, Validators.min(0)]],
  });

  readonly isNameValid = computed(() => this.categoryForm.controls.name.valid);
  readonly isBudgetValid = computed(() => this.categoryForm.controls.monthlyBudget.valid);
  readonly isFormValid = computed(() => this.categoryForm.valid);

  readonly iconOptions = [
    'category',
    'label',
    'bookmark',
    'star',
    'restaurant',
    'fastfood',
    'local_cafe',
    'lunch_dining',
    'local_pizza',
    'local_bar',
    'bakery_dining',
    'home',
    'house',
    'apartment',
    'bed',
    'water_drop',
    'electric_bolt',
    'wifi',
    'lightbulb',
    'shopping_cart',
    'shopping_bag',
    'storefront',
    'sell',
    'card_giftcard',
    'local_mall',
    'directions_car',
    'commute',
    'local_taxi',
    'directions_bus',
    'train',
    'two_wheeler',
    'local_gas_station',
    'flight',
    'luggage',
    'map',
    'hotel',
    'beach_access',
    'local_hospital',
    'medical_services',
    'medication',
    'fitness_center',
    'self_improvement',
    'spa',
    'school',
    'menu_book',
    'computer',
    'science',
    'payments',
    'attach_money',
    'credit_card',
    'account_balance_wallet',
    'receipt_long',
    'request_quote',
    'work',
    'business_center',
    'work_history',
    'badge',
    'savings',
    'account_balance',
    'trending_up',
    'show_chart',
    'pie_chart',
    'movie',
    'sports_esports',
    'music_note',
    'headphones',
    'celebration',
    'pets',
    'child_care',
    'volunteer_activism',
  ];

  readonly categories = computed(() =>
    [...this.categoryService.categories()].sort((a, b) => a.name.localeCompare(b.name)),
  );

  ngOnInit(): void {
    this.categoryService.loadCategories();
  }

  async saveCategory() {
    this.formSubmitted.set(true);
    if (this.categoryForm.invalid) {
      return;
    }

    const formValue = this.categoryForm.getRawValue();
    const trimmedName = formValue.name.trim();
    if (!trimmedName) {
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      return;
    }

    const payload: Category = {
      userId,
      name: trimmedName,
      icon: formValue.icon,
      color: formValue.color,
      monthlyBudget: formValue.monthlyBudget,
      isActive: true,
      createdAt: Date.now(),
    };

    const id = this.editingCategoryId();
    if (id) {
      await this.categoryService.updateCategory(id, {
        name: payload.name,
        icon: payload.icon,
        color: payload.color,
        monthlyBudget: payload.monthlyBudget,
      });
    } else {
      await this.categoryService.addCategory(payload);
    }

    this.resetForm();
  }

  startEdit(category: Category) {
    this.editingCategoryId.set(category.id ?? null);
    this.categoryForm.patchValue({
      name: category.name,
      icon: category.icon || 'category',
      color: category.color || '#607d8b',
      monthlyBudget: category.monthlyBudget ?? 0,
    });
    this.formSubmitted.set(false);
  }

  resetForm() {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({
      name: '',
      icon: 'category',
      color: '#607d8b',
      monthlyBudget: 0,
    });
    this.formSubmitted.set(false);
  }

  getMonthlyBudget(categoryType: string): number {
    return this.categoryService.monthlyBudget(categoryType);
  }
}
