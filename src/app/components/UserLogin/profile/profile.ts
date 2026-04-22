import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  onAuthStateChanged,
  updateEmail,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
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
    const trimmedName = formValue.name.trim();
    const trimmedEmail = formValue.email.trim().toLowerCase();

    try {
      if (trimmedName !== (currentUser.displayName ?? '')) {
        await updateProfile(currentUser, { displayName: trimmedName });
      }

      if (trimmedEmail !== (currentUser.email ?? '')) {
        await updateEmail(currentUser, trimmedEmail);
      }

      await this.userService.updateUserProfile(currentUser.uid, {
        name: trimmedName,
        email: trimmedEmail,
        budgetGoal: formValue.budgetGoal,
      });
      this.successMessage.set('Profile updated successfully.');
    } catch (error: unknown) {
      this.errorMessage.set(this.mapProfileUpdateError(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  private mapProfileUpdateError(error: unknown): string {
    const errorCode = this.getErrorCode(error);
    if (!errorCode) {
      return 'Unable to update profile right now. Please try again.';
    }

    switch (errorCode) {
      case 'auth/requires-recent-login':
        return 'For security, please log out and log back in before changing your email.';
      case 'auth/email-already-in-use':
        return 'That email is already in use by another account.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'permission-denied':
        return 'You do not have permission to update this profile.';
      case 'unauthenticated':
        return 'Your session has expired. Please log in again.';
      case 'unavailable':
        return 'Service is temporarily unavailable. Please try again shortly.';
      default:
        return 'Unable to update profile right now. Please try again.';
    }
  }

  private getErrorCode(error: unknown): string | null {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return null;
    }

    const code = (error as { code: unknown }).code;
    return typeof code === 'string' ? code : null;
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
