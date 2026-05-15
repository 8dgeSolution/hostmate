import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Plus } from "lucide-react";
import { BrandingSettings } from "@/components/dashboard/branding-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [user, properties] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { companyLogoUrl: true },
    }),
    db.property.findMany({
      where: { hostId: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <main className="space-y-6">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Your properties</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage guest-ready information, maps, house rules, and shareable property links.
          </p>
        </div>
        <Link href="/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New property
          </Button>
        </Link>
      </Card>

      <BrandingSettings currentLogoUrl={user?.companyLogoUrl ?? null} />

      <section className="grid gap-4 lg:grid-cols-2">
        {properties.length ? (
          properties.map((property) => (
            <Card key={property.id} className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{property.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {property.addressLine1}, {property.city}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {property.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <div className="font-medium text-slate-900">Check-in</div>
                  <div>{property.checkInTime}</div>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Quiet hours</div>
                  <div>{property.quietHours}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/properties/${property.id}/edit`}>
                  <Button>Edit property</Button>
                </Link>
                <Link href={`/property/${property.slug}`} target="_blank">
                  <Button variant="secondary">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open guest page
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <h2 className="text-xl font-semibold text-slate-900">No properties yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Create your first property to publish a unique guest guide with maps, lockbox directions, and WiFi details.
            </p>
          </Card>
        )}
      </section>
    </main>
  );
}