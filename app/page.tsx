import { Suspense } from "react";
import AuthFlow from "@/components/auth/AuthFlow";

export const metadata = {
  title: "Entrar · AwSales",
};

export default function Home() {
  return (
    <Suspense>
      <AuthFlow />
    </Suspense>
  );
}
