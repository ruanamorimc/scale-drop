import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/reset-password/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    // 👇 Mudança principal: min-h-screen (altura total) e p-4 (para não colar na borda em celular)
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  );
}
