import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { onAuthStateChanged, type Unsubscribe as AuthUnsubscribe } from 'firebase/auth';
import { ExpenseCategory } from '../../models/expense';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../../firebase.config';
import { Category } from '../../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService implements OnDestroy {
  categories = signal<Category[]>([]);

  private readonly defaultCategoryIcon = 'category';
  private readonly defaultCategoryColor = '#607d8b';
  private readonly predefinedCategoryMeta: Record<
    ExpenseCategory,
    { icon: string; color: string }
  > = {
    Food: { icon: 'restaurant', color: '#ff9800' },
    Rent: { icon: 'home', color: '#3f51b5' },
    Travel: { icon: 'flight', color: '#00acc1' },
    Entertainment: { icon: 'movie', color: '#9c27b0' },
    Healthcare: { icon: 'local_hospital', color: '#e53935' },
    Shopping: { icon: 'shopping_cart', color: '#43a047' },
    Utilities: { icon: 'electric_bolt', color: '#fb8c00' },
    Education: { icon: 'school', color: '#3949ab' },
    Salary: { icon: 'payments', color: '#00897b' },
    Freelance: { icon: 'work', color: '#5e35b1' },
    Investment: { icon: 'trending_up', color: '#2e7d32' },
    Other: { icon: 'category', color: '#607d8b' },
  };

  predefinedCategoryList = signal<ExpenseCategory[]>([
    'Food',
    'Rent',
    'Travel',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Utilities',
    'Education',
    'Salary',
    'Freelance',
    'Investment',
    'Other',
  ]);

  userDefinedCategories = computed(() => {
    const predefinedSet = new Set(this.predefinedCategoryList());
    const custom = this.categories()
      .map((category) => category.name.trim())
      .filter((name) => name.length > 0 && !predefinedSet.has(name as ExpenseCategory));

    return [...new Set(custom)].sort((a, b) => a.localeCompare(b));
  });

  allCategories = computed(() => [
    ...this.predefinedCategoryList(),
    ...this.userDefinedCategories(),
  ]);

  private categoryCollection = collection(db, 'categories');
  private categorySnapshotUnsubscribe: Unsubscribe | null = null;
  private authUnsubscribe: AuthUnsubscribe | null = null;

  monthlyBudget(categoryName: string): number {
    const category = this.findCategoryByName(categoryName);
    return category ? category.monthlyBudget : 0;
  }

  getCategoryIcon(categoryName: string): string {
    const category = this.findCategoryByName(categoryName);
    if (category?.icon?.trim()) {
      return category.icon;
    }

    const predefinedMeta = this.predefinedCategoryMeta[categoryName as ExpenseCategory];
    return predefinedMeta?.icon ?? this.defaultCategoryIcon;
  }

  getCategoryColor(categoryName: string): string {
    const category = this.findCategoryByName(categoryName);
    if (category?.color?.trim()) {
      return category.color;
    }

    const predefinedMeta = this.predefinedCategoryMeta[categoryName as ExpenseCategory];
    return predefinedMeta?.color ?? this.defaultCategoryColor;
  }

  //READ (real-time)
  loadCategories() {
    if (this.authUnsubscribe) {
      return;
    }

    this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
      this.categorySnapshotUnsubscribe?.();
      this.categorySnapshotUnsubscribe = null;

      if (!user) {
        this.categories.set([]);
        return;
      }

      const categoryQuery = query(this.categoryCollection, where('userId', '==', user.uid));

      this.categorySnapshotUnsubscribe = onSnapshot(categoryQuery, (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Category[];

        this.categories.set(categoriesData);
      });
    });
  }

  //CREATE
  async addCategory(category: Category) {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to add a category.');
    }

    await addDoc(this.categoryCollection, {
      ...category,
      userId,
    });
  }

  async ensureCategoryExists(categoryName: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      return;
    }

    const normalizedName = categoryName.trim();
    if (!normalizedName) {
      return;
    }

    const exists = this.allCategories().some(
      (existingCategory) => existingCategory.toLowerCase() === normalizedName.toLowerCase(),
    );

    if (exists) {
      return;
    }

    await this.addCategory({
      userId,
      name: normalizedName,
      icon: '',
      color: '',
      monthlyBudget: 0,
      isActive: true,
      createdAt: Date.now(),
    });
  }

  private findCategoryByName(categoryName: string): Category | undefined {
    return this.categories().find(
      (category) => category.name.trim().toLowerCase() === categoryName.trim().toLowerCase(),
    );
  }
  //UPDATE
  async updateCategory(id: string, category: Partial<Category>) {
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, { ...category });
  }
  //DELETE
  async deleteCategory(id: string) {
    const categoryRef = doc(db, 'categories', id);
    await deleteDoc(categoryRef);
  }

  ngOnDestroy(): void {
    this.authUnsubscribe?.();
    this.authUnsubscribe = null;
    this.categorySnapshotUnsubscribe?.();
    this.categorySnapshotUnsubscribe = null;
  }
}
