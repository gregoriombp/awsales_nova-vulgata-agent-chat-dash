import { Suspense } from "react";
import AuthFlow from "@/components/auth/AuthFlow";

export const metadata = {
  title: "Entrar · Aswork",
};

export default function AsworkLoginPage() {
  return (
    <Suspense>
      <AuthFlow />
    </Suspense>
  );
}
