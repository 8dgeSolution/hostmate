import type { GuestThemePreset } from "@/lib/theme";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("DemoPass123!", 10);
  const demoPropertyData = {
    title: "Harbour View Suite",
    themePreset: "coastal" as GuestThemePreset,
    heroTitle: "Welcome to Harbour View Suite",
    heroSubtitle: "Everything your guest needs in one polished guide.",
    addressLine1: "18 Seabreeze Avenue",
    city: "Sydney",
    state: "NSW",
    postcode: "2000",
    country: "Australia",
    wifiSsid: "HarbourViewGuest",
    wifiPassword: "summerstay2026",
    checkInTime: "3:00 PM",
    checkOutTime: "10:00 AM",
    quietHours: "10:00 PM - 7:00 AM",
    houseRules: "No parties. No smoking. Please remove shoes indoors.",
    parkingInfo: "Secure basement parking bay 14. Enter from Ocean Lane.",
    lockboxInstructions: "The lockbox is mounted beside the blue side gate. Use the code and return the key before checkout.",
    lockboxCode: "4821",
    lockboxSteps: JSON.stringify([
      {
        id: "lockbox-step-1",
        title: "Find the blue side gate",
        description: "Walk past the front planter boxes and continue to the narrow side path on the left.",
        imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "lockbox-step-2",
        title: "Locate the lockbox",
        description: "The lockbox is mounted at chest height beside the gate latch.",
        imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
      },
    ]),
    arrivalNotes: "Use the lift to level 6. The apartment is on the right after exiting.",
    amenities: "Air conditioning, washer, dryer, Nespresso machine, balcony seating",
    propertyLat: -33.8688,
    propertyLng: 151.2093,
    lockboxLat: -33.8685,
    lockboxLng: 151.2091,
    parkingLat: -33.869,
    parkingLng: 151.2088,
    parkingSteps: JSON.stringify([
      {
        id: "parking-step-1",
        title: "Turn into Ocean Lane",
        description: "Use the second driveway after the café and keep left for visitor access.",
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "parking-step-2",
        title: "Park in bay 14",
        description: "Bay 14 is on the first basement level opposite the lift lobby doors.",
        imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=80",
      },
    ]),
    published: true,
  };

  const host = await prisma.user.upsert({
    where: { email: "demo@stayportal.app" },
    update: {},
    create: {
      email: "demo@stayportal.app",
      name: "Demo Host",
      passwordHash,
    },
  });

  await prisma.property.upsert({
    where: { slug: "harbour-view-suite" },
    update: demoPropertyData,
    create: {
      hostId: host.id,
      slug: "harbour-view-suite",
      ...demoPropertyData,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });