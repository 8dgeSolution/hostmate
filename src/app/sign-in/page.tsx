import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-md">
      <Card>
        <h1 className="text-3xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Access your property dashboard and guest links.</p>
        <div className="mt-6">
          <AuthForm mode="sign-in" />
        </div>
      </Card>
    </main>
  );
}