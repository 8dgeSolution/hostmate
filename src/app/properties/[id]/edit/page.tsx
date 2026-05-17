import { notFound, redirect } from "next/navigation";
import { PropertyForm } from "@/components/dashboard/property-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type EditPropertyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const property = await db.property.findFirst({
    where: {
      id,
      hostId: session.user.id,
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <main>
      <PropertyForm property={{ ...property, themePreset: property.themePreset as import("@/lib/theme").GuestThemePreset }} />
    </main>
  );
}