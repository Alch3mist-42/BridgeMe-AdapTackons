// Starter seed (role D expands to 10 SMEs / 30 youth). Run: pnpm db:seed
// Fictional people and businesses only.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const businesses = [
  { name: "Mama Joy's Bakery", sector: "Food", suburb: "Braamfontein", lat: -26.1929, lng: 28.0305, tier: "ID_VERIFIED" as const },
  { name: "Kasi Fix Electronics", sector: "Repairs", suburb: "Soweto", lat: -26.2485, lng: 27.854, tier: "CIPC_VERIFIED" as const },
  { name: "Ubuntu Books & Print", sector: "Retail", suburb: "Rosebank", lat: -26.1467, lng: 28.0436, tier: "CIPC_VERIFIED" as const },
];

const youth = [
  { name: "Thandi Mokoena", dob: "2004-03-15", suburb: "Hillbrow", lat: -26.1887, lng: 28.0497, skills: ["customer service", "excel", "baking"] },
  { name: "Sipho Ndlovu", dob: "2002-07-02", suburb: "Orlando East", lat: -26.2375, lng: 27.9101, skills: ["soldering", "phone repair"] },
  { name: "Lerato Khumalo", dob: "2005-11-20", suburb: "Alexandra", lat: -26.1034, lng: 28.0967, skills: ["graphic design", "canva", "social media"] },
];

async function main() {
  for (const b of businesses) {
    const email = `${b.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.co.za`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email, name: b.name, role: "BUSINESS",
        business: { create: {
          name: b.name, sector: b.sector, suburb: b.suburb, lat: b.lat, lng: b.lng,
          verificationTier: b.tier, payeRegistered: true, taxCompliant: true,
          placements: { create: [{
            title: `${b.sector} assistant`, description: `Hands-on work experience at ${b.name}.`,
            requiredSkills: ["customer service", "excel"], monthlyStipend: 4000, status: "OPEN",
          }] },
        } },
      },
    });
  }
  for (const y of youth) {
    const email = `${y.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.co.za`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email, name: y.name, role: "YOUTH",
        youthProfile: { create: {
          dateOfBirth: new Date(y.dob), suburb: y.suburb, lat: y.lat, lng: y.lng,
          skills: y.skills, highestGrade: 12, transportMode: "taxi",
        } },
        consents: { create: [
          { type: "POPIA_PROCESSING", version: "v1", granted: true },
          { type: "AI_MATCHING", version: "v1", granted: true },
        ] },
      },
    });
  }
  console.log("Seeded", businesses.length, "businesses and", youth.length, "youth.");
}

main().finally(() => prisma.$disconnect());
