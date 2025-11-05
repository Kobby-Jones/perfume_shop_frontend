// app/account/auth/layout.tsx

import { ReactNode } from "react";
// No AuthGuard here!

/**
 * Layout component for all PUBLIC authentication routes (Login, Register, Forgot Password).
 * No AuthGuard is applied, ensuring these pages are always accessible.
 */
export default function AuthLayoutPublic({ children }: { children: ReactNode }) {
  // The AuthLayout component already contains the centering and card structure.
  return (
    <>
      {children}
    </>
  );
}