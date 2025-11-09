// app/account/settings/page.tsx

'use client';

import { AccountLayout } from '@/components/account/AccountLayout';
import { UpdateProfileForm } from '@/components/account/UpdateProfileForm';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';
import { Separator } from '@/components/ui/separator';

/**
 * Account Settings Page: Combines Profile and Password update forms.
 */
export default function AccountSettingsPage() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
      <UpdateProfileForm />

      <Separator className="my-8" />

      <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
      <ChangePasswordForm />
    </>
  );
}