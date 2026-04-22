import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../../../firebase.config';
import { UserService } from '../../../services/user-services/user.services';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly profileForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    budgetGoal: [0, [Validators.required, Validators.min(0)]],
  });

  async ngOnInit(): Promise<void> {
    await this.loadProfile();
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const currentUser = await this.getAuthenticatedUser();
    if (!currentUser) {
      this.errorMessage.set('You must be logged in to update your profile.');
      return;
    }

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const formValue = this.profileForm.getRawValue();

    try {
      await this.userService.updateUserProfile(currentUser.uid, {
        name: formValue.name.trim(),
        email: formValue.email.trim(),
        budgetGoal: formValue.budgetGoal,
      });
      this.successMessage.set('Profile updated successfully.');
    } catch {
      this.errorMessage.set('Unable to update profile right now. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }

  private async loadProfile(): Promise<void> {
    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    try {
      const currentUser = await this.getAuthenticatedUser();
      if (!currentUser) {
        this.errorMessage.set('Please log in to manage your profile.');
        await this.router.navigateByUrl('/login');
        return;
      }

      const profile = await this.userService.getUserProfile(currentUser.uid);
      if (profile) {
        this.profileForm.setValue({
          name: profile.name,
          email: profile.email,
          budgetGoal: profile.budgetGoal,
        });
      } else {
        this.profileForm.setValue({
          name: currentUser.displayName ?? '',
          email: currentUser.email ?? '',
          budgetGoal: 0,
        });
      }
    } catch {
      this.errorMessage.set('Unable to load profile. Please refresh and try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async getAuthenticatedUser(): Promise<FirebaseUser | null> {
    if (auth.currentUser) {
      return auth.currentUser;
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}
