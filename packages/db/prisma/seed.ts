// Seed: 10 businesses, 30 youth, 2 reports, 1 engagement with timesheets. Run: pnpm db:seed
// Fictional people and businesses only. Safe to run more than once.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Demo password for ALL seeded accounts. Fictional data only; never use in production.
const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "ChangeMe-Demo1";

const PLACES: Record<string, [number, number]> = {
  Braamfontein: [-26.1929, 28.0305], Soweto: [-26.2485, 27.854], Rosebank: [-26.1467, 28.0436],
  Diepkloof: [-26.25, 27.95], Germiston: [-26.217, 28.167], Yeoville: [-26.182, 28.063],
  Jeppestown: [-26.203, 28.069], Melville: [-26.177, 28.01], Randburg: [-26.094, 27.998],
  Tembisa: [-25.996, 28.227], Hillbrow: [-26.1887, 28.0497], "Orlando East": [-26.2375, 27.9101],
  Alexandra: [-26.1034, 28.0967], "Orange Farm": [-26.47, 27.86],
};

type Tier = "UNVERIFIED" | "ID_VERIFIED" | "CIPC_VERIFIED";
const businesses: { name: string; sector: string; suburb: string; tier: Tier; title: string; skills: string[]; stipend: number }[] = [
  { name: "Mama Joy's Bakery", sector: "Food", suburb: "Braamfontein", tier: "ID_VERIFIED", title: "Bakery assistant", skills: ["baking", "customer service"], stipend: 4000 },
  { name: "Kasi Fix Electronics", sector: "Repairs", suburb: "Soweto", tier: "CIPC_VERIFIED", title: "Repair technician trainee", skills: ["soldering", "phone repair"], stipend: 4500 },
  { name: "Ubuntu Books & Print", sector: "Retail", suburb: "Rosebank", tier: "CIPC_VERIFIED", title: "Retail and print assistant", skills: ["customer service", "excel"], stipend: 4000 },
  { name: "Sunrise Spaza & Airtime", sector: "Retail", suburb: "Diepkloof", tier: "ID_VERIFIED", title: "Shop assistant", skills: ["customer service", "cash handling"], stipend: 3500 },
  { name: "Thabo's Tyre & Auto", sector: "Automotive", suburb: "Germiston", tier: "CIPC_VERIFIED", title: "Auto workshop assistant", skills: ["mechanics", "customer service"], stipend: 4500 },
  { name: "Glow Hair Studio", sector: "Beauty", suburb: "Yeoville", tier: "ID_VERIFIED", title: "Salon assistant", skills: ["hair styling", "customer service"], stipend: 3500 },
  { name: "Mzansi Stitch Tailors", sector: "Clothing", suburb: "Jeppestown", tier: "CIPC_VERIFIED", title: "Tailoring assistant", skills: ["sewing", "measuring"], stipend: 4000 },
  { name: "BrightPath Tutoring", sector: "Education", suburb: "Melville", tier: "CIPC_VERIFIED", title: "Tutoring assistant", skills: ["maths", "english", "social media"], stipend: 4500 },
  { name: "Green Thumb Nursery", sector: "Agriculture", suburb: "Randburg", tier: "UNVERIFIED", title: "Nursery assistant", skills: ["gardening", "customer service"], stipend: 3500 },
  { name: "Kasi Kitchen Catering", sector: "Food", suburb: "Tembisa", tier: "UNVERIFIED", title: "Catering assistant", skills: ["cooking", "food safety"], stipend: 3800 },
];

const youth: [string, string, string, string[]][] = [
  ["Thandi Mokoena", "2004-03-15", "Hillbrow", ["customer service", "excel", "baking"]],
  ["Sipho Ndlovu", "2002-07-02", "Orlando East", ["soldering", "phone repair"]],
  ["Lerato Khumalo", "2005-11-20", "Alexandra", ["graphic design", "canva", "social media"]],
  ["Nomsa Dlamini", "2003-01-09", "Soweto", ["sewing", "measuring"]],
  ["Kagiso Molefe", "2001-05-22", "Tembisa", ["cooking", "food safety"]],
  ["Zanele Nkosi", "2006-02-14", "Alexandra", ["maths", "english"]],
  ["Tumelo Sithole", "2004-09-30", "Diepkloof", ["customer service", "cash handling"]],
  ["Palesa Mahlangu", "2000-12-01", "Orange Farm", ["gardening"]],
  ["Bongani Zulu", "2002-04-18", "Jeppestown", ["mechanics"]],
  ["Naledi Motaung", "2005-06-06", "Hillbrow", ["hair styling", "customer service"]],
  ["Themba Khoza", "2003-08-25", "Soweto", ["phone repair", "soldering"]],
  ["Ayanda Cele", "2006-10-11", "Yeoville", ["social media", "canva"]],
  ["Lindiwe Mthembu", "2001-03-03", "Germiston", ["excel", "customer service"]],
  ["Mpho Radebe", "2004-11-27", "Randburg", ["gardening", "customer service"]],
  ["Karabo Tshabalala", "2002-01-19", "Soweto", ["baking", "cooking"]],
  ["Sizwe Ngcobo", "2005-07-08", "Orlando East", ["mechanics", "customer service"]],
  ["Refilwe Maseko", "2003-05-16", "Melville", ["maths", "social media"]],
  ["Lwazi Buthelezi", "2000-09-09", "Tembisa", ["cooking"]],
  ["Nthabiseng Pule", "2006-04-04", "Braamfontein", ["customer service", "excel"]],
  ["Tshepo Mabaso", "2004-02-23", "Diepkloof", ["cash handling", "customer service"]],
  ["Ntombi Vilakazi", "2001-12-12", "Alexandra", ["sewing"]],
  ["Mandla Zwane", "2003-10-05", "Jeppestown", ["mechanics", "soldering"]],
  ["Boitumelo Sebola", "2005-01-28", "Hillbrow", ["english", "maths"]],
  ["Siya Mkhize", "2002-06-14", "Germiston", ["mechanics"]],
  ["Dineo Kgosi", "2004-08-02", "Soweto", ["hair styling"]],
  ["Kabelo Mokwena", "2006-03-21", "Orange Farm", ["gardening", "cash handling"]],
  ["Thuli Shabalala", "2000-07-17", "Yeoville", ["graphic design", "social media"]],
  ["Andile Maluleke", "2003-11-30", "Rosebank" in PLACES ? "Braamfontein" : "Braamfontein", ["customer service"]],
  ["Precious Mohlala", "2005-09-19", "Tembisa", ["food safety", "cooking"]],
  ["Jabu Nene", "2001-02-07", "Melville", ["excel", "maths"]],
];

const emailOf = (name: string) => `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.co.za`;
const MODES = ["taxi", "walk", "bus"] as const;

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: "admin@example.co.za" },
    update: { passwordHash, role: "ADMIN" },
    create: { email: "admin@example.co.za", name: "Demo Admin", role: "ADMIN", passwordHash },
  });

  for (const b of businesses) {
    const coords = PLACES[b.suburb];
    if (!coords) throw new Error(`Unknown suburb: ${b.suburb}`);
    const [lat, lng] = coords;
    const email = emailOf(b.name);
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: {
        email, name: b.name, role: "BUSINESS", passwordHash,
        business: { create: {
          name: b.name, sector: b.sector, suburb: b.suburb, lat, lng,
          verificationTier: b.tier, payeRegistered: b.tier !== "UNVERIFIED", taxCompliant: b.tier !== "UNVERIFIED",
          placements: { create: [{
            title: b.title, description: `Hands-on work experience at ${b.name}.`,
            requiredSkills: b.skills, monthlyStipend: b.stipend, status: "OPEN",
          }] },
        } },
      },
    });
  }

  for (const [i, [name, dob, suburb, skills]] of youth.entries()) {
    const coords = PLACES[suburb];
    if (!coords) throw new Error(`Unknown suburb: ${suburb}`);
    const [lat, lng] = coords;
    await prisma.user.upsert({
      where: { email: emailOf(name) },
      update: { passwordHash },
      create: {
        email: emailOf(name), name, role: "YOUTH", passwordHash,
        youthProfile: { create: {
          dateOfBirth: new Date(dob), suburb, lat, lng, skills, highestGrade: 12, transportMode: MODES[i % 3],
        } },
        consents: { create: [
          { type: "POPIA_PROCESSING", version: "v1", granted: true },
          { type: "AI_MATCHING", version: "v1", granted: true },
        ] },
      },
    });
  }

  // Two sample reports, so the admin queue is not empty in the demo.
  if ((await prisma.report.count()) === 0) {
    const reporter = await prisma.user.findUnique({ where: { email: emailOf("Sipho Ndlovu") } });
    const target1 = await prisma.user.findUnique({ where: { email: emailOf("Green Thumb Nursery") } });
    const target2 = await prisma.user.findUnique({ where: { email: emailOf("Kasi Kitchen Catering") } });
    if (reporter && target1 && target2) {
      await prisma.report.createMany({
        data: [
          { reporterId: reporter.id, targetUserId: target1.id, reason: "Asked me to pay a fee before starting. Sample report." },
          { reporterId: reporter.id, targetUserId: target2.id, reason: "Hours on the contract did not match what was agreed. Sample report." },
        ],
      });
    }
  }

  // One real-looking engagement with weekly timesheets, for the ETI and evidence demo.
  const thandi = await prisma.user.findUnique({ where: { email: emailOf("Thandi Mokoena") }, include: { youthProfile: true } });
  const joy = await prisma.business.findFirst({ where: { name: "Mama Joy's Bakery" }, include: { placements: true } });
  if (thandi?.youthProfile && joy?.placements[0]) {
    const exists = await prisma.engagement.findFirst({ where: { youthId: thandi.youthProfile.id } });
    if (!exists) {
      const weeks = ["2026-08-03", "2026-08-10", "2026-08-17", "2026-08-24"];
      await prisma.engagement.create({
        data: {
          placementId: joy.placements[0].id,
          youthId: thandi.youthProfile.id,
          startDate: new Date("2026-08-03"),
          monthlyRemuneration: 4000,
          uifRegistered: true,
          timesheets: { create: weeks.map((w, i) => ({
            weekStart: new Date(w),
            hours: 40,
            tasks: "Baking prep, counter service and stock counts.",
            skillsPracticed: ["baking", "customer service"],
            status: i < 3 ? "SIGNED_OFF" : "SUBMITTED",
            signedOffById: i < 3 ? joy.ownerId : null,
            signedOffAt: i < 3 ? new Date(w) : null,
          })) },
        },
      });
    }
  }

  console.log("Admin login: admin@example.co.za / (SEED_PASSWORD or default ChangeMe-Demo1)");
  console.log(`Seeded ${businesses.length} businesses and ${youth.length} youth.`);
}

main().finally(() => prisma.$disconnect());
