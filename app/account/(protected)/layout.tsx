// app/account/(protected)/layout.tsx

import { ReactNode } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AccountLayout } from "@/components/account/AccountLayout";

/**
 * Layout component for all PROTECTED user account routes.
 * Applies the AuthGuard to everything nested within (protected)/.
 */
export default function ProtectedAccountLayout({ children }: { children: ReactNode }) {
  // NOTE: The AuthGuard will redirect if the user is not logged in.
  // The AccountLayout is now rendered *inside* the protected zone.
  return (
    <AuthGuard>
        {/* We can now safely wrap the protected content with the visual AccountLayout */}

            {children}
    </AuthGuard>
  );
}