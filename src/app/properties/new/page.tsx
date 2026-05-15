import { redirect } from "next/navigation";
import { PropertyForm } from "@/components/dashboard/property-form";
import { auth } from "@/lib/auth";

export default async function NewPropertyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return (
    <main>
      <PropertyForm />
    </main>
  );
}