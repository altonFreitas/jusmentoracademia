import type { Metadata } from "next";
import { Suspense } from "react";
import RegistrationForm from "@/components/RegistrationForm";

export const metadata: Metadata = {
  title: "Course Registration",
  description: "Register for a JusMentor Academia course or program.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegistrationForm />
    </Suspense>
  );
}
