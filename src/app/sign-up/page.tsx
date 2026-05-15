import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function SignUpPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-md">
      <Card>
        <h1 className="text-3xl font-semibold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Start with email and password today. Google sign-in can be added later without changing the data model.
        </p>
        <div className="mt-6">
          <AuthForm mode="sign-up" />
        </div>
      </Card>
    </main>
  );
}