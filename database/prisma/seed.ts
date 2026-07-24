import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Mot de passe partagé des comptes démo (documenté dans le README). */
const DEMO_PASSWORD = "demo1234";

const DEMO_USERS = [
  {
    email: "client@viewbeforebuy.ma",
    name: "Amine Alaoui",
    role: "CLIENT" as const,
  },
  {
    email: "agency@viewbeforebuy.ma",
    name: "Youssef Benali",
    role: "AGENCY" as const,
  },
  {
    email: "admin@viewbeforebuy.ma",
    name: "Admin DiNext",
    role: "ADMIN" as const,
  },
];

const PROPERTIES = [
  {
    id: "1",
    name: "Villa Agdal",
    type: "Villa",
    city: "Rabat",
    neighborhood: "Agdal",
    price: 2400000,
    superficie: 240,
    rooms: 4,
    bathrooms: 2,
    floor: 0,
    locationScore: 8.4,
    status: "Disponible",
    description: "Belle villa moderne au cœur d'Agdal, avec jardin et parking.",
    hasPool: false,
    hasGarden: true,
    hasParking: true,
    lat: 34.0005,
    lng: -6.8475,
  },
  {
    id: "2",
    name: "Appartement Maarif",
    type: "Appartement",
    city: "Casablanca",
    neighborhood: "Maarif",
    price: 850000,
    superficie: 95,
    rooms: 3,
    bathrooms: 1,
    floor: 4,
    locationScore: 9.1,
    status: "Disponible",
    description: "Appartement lumineux au 4ème étage, proche de toutes commodités.",
    hasPool: false,
    hasGarden: false,
    hasParking: true,
    lat: 33.5835,
    lng: -7.6325,
  },
  {
    id: "3",
    name: "Riad Marrakech",
    type: "Riad",
    city: "Marrakech",
    neighborhood: "Médina",
    price: 1800000,
    superficie: 180,
    rooms: 5,
    bathrooms: 3,
    floor: 0,
    locationScore: 7.8,
    status: "En négociation",
    description: "Riad authentique rénové dans la médina, patio et piscine.",
    hasPool: true,
    hasGarden: true,
    hasParking: false,
    lat: 31.6295,
    lng: -7.9811,
  },
  {
    id: "4",
    name: "Duplex Anfa",
    type: "Duplex",
    city: "Casablanca",
    neighborhood: "Anfa",
    price: 3200000,
    superficie: 210,
    rooms: 5,
    bathrooms: 3,
    floor: 6,
    locationScore: 9.4,
    status: "Disponible",
    description: "Duplex haut standing avec terrasse panoramique.",
    hasPool: false,
    hasGarden: false,
    hasParking: true,
    lat: 33.5882,
    lng: -7.6615,
  },
  {
    id: "5",
    name: "Villa Californie",
    type: "Villa",
    city: "Casablanca",
    neighborhood: "Californie",
    price: 4500000,
    superficie: 320,
    rooms: 6,
    bathrooms: 4,
    floor: 0,
    locationScore: 8.9,
    status: "Disponible",
    description: "Villa contemporaine avec piscine et grand jardin.",
    hasPool: true,
    hasGarden: true,
    hasParking: true,
    lat: 33.548,
    lng: -7.628,
  },
  {
    id: "6",
    name: "Appartement Hassan",
    type: "Appartement",
    city: "Rabat",
    neighborhood: "Hassan",
    price: 1100000,
    superficie: 110,
    rooms: 3,
    bathrooms: 2,
    floor: 2,
    locationScore: 8.7,
    status: "Disponible",
    description: "Appartement rénové au cœur du quartier Hassan.",
    hasPool: false,
    hasGarden: false,
    hasParking: true,
    lat: 34.0209,
    lng: -6.835,
  },
];

const CONVERSATIONS = [
  {
    id: "1",
    propertyId: "1",
    propertyName: "Villa Agdal",
    propertyType: "Villa",
    lastMessage: "Quelle est la superficie du jardin ?",
    timestamp: "Il y a 5 min",
    unread: true,
    messages: [
      {
        role: "user" as const,
        content: "Bonjour, je suis intéressé par la Villa Agdal",
        timestamp: "10:00",
      },
      {
        role: "assistant" as const,
        content:
          "Bonjour ! La Villa Agdal est une magnifique propriété de 240m² à Agdal, Rabat. Prix : 2 400 000 DH. 4 chambres, 2 SDB, jardin, parking. Que souhaitez-vous savoir ?",
        timestamp: "10:01",
      },
      {
        role: "user" as const,
        content: "Quelle est la superficie du jardin ?",
        timestamp: "10:05",
      },
    ],
  },
  {
    id: "2",
    propertyId: "2",
    propertyName: "Appartement Maarif",
    propertyType: "Appartement",
    lastMessage: "Le prix est-il négociable ?",
    timestamp: "Il y a 2 h",
    unread: false,
    messages: [
      {
        role: "user" as const,
        content: "Le prix est-il négociable ?",
        timestamp: "08:30",
      },
    ],
  },
  {
    id: "3",
    propertyId: "3",
    propertyName: "Riad Marrakech",
    propertyType: "Riad",
    lastMessage: "Puis-je visiter ce weekend ?",
    timestamp: "Hier",
    unread: false,
    messages: [
      {
        role: "user" as const,
        content: "Puis-je visiter ce weekend ?",
        timestamp: "14:00",
      },
    ],
  },
];

const BANKS = [
  {
    name: "CIH Bank",
    rate: 4.3,
    maxDuration: 25,
    minDownPayment: 10,
    logo: "🏦",
    recommended: true,
    features: ["Taux le plus bas", "Réponse rapide", "Sans frais de dossier"],
  },
  {
    name: "Attijariwafa Bank",
    rate: 4.5,
    maxDuration: 25,
    minDownPayment: 10,
    logo: "🏛",
    recommended: false,
    features: ["Large réseau", "Flexibilité", "Assurance incluse"],
  },
  {
    name: "BMCE Bank",
    rate: 4.7,
    maxDuration: 20,
    minDownPayment: 15,
    logo: "🏢",
    recommended: false,
    features: ["Stable", "International", "Service premium"],
  },
];

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.property.deleteMany();
  await prisma.bank.deleteMany();

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const users: Record<string, { id: string; role: string }> = {};
  for (const demo of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      create: {
        email: demo.email,
        name: demo.name,
        password,
        role: demo.role,
        provider: "local",
      },
      update: {
        name: demo.name,
        password,
        role: demo.role,
        provider: "local",
      },
    });
    users[demo.role] = { id: user.id, role: user.role };
  }

  for (const property of PROPERTIES) {
    await prisma.property.create({ data: property });
  }

  for (const conversation of CONVERSATIONS) {
    const { messages, ...rest } = conversation;
    await prisma.conversation.create({
      data: {
        ...rest,
        messages: { create: messages },
      },
    });
  }

  for (const bank of BANKS) {
    await prisma.bank.create({ data: bank });
  }

  const clientId = users.CLIENT.id;
  const agencyId = users.AGENCY.id;
  const adminId = users.ADMIN.id;

  const favoriteIds = ["1", "2", "3", "5", "6"];
  for (const propertyId of favoriteIds) {
    await prisma.favorite.create({ data: { userId: clientId, propertyId } });
  }

  const sampleReviews = [
    { propertyId: "1", rating: 5, comment: "Villa magnifique, quartier calme et verdoyant." },
    { propertyId: "2", rating: 4, comment: "Bon rapport qualité/prix, un peu bruyant le soir." },
    { propertyId: "3", rating: 5, comment: "Riad authentique, piscine superbe." },
    { propertyId: "4", rating: 4, comment: "Vue imprenable, finitions premium." },
    { propertyId: "5", rating: 5, comment: "Piscine et jardin exceptionnels." },
  ];
  for (const r of sampleReviews) {
    await prisma.review.create({
      data: {
        userId: clientId,
        propertyId: r.propertyId,
        rating: r.rating,
        comment: r.comment,
      },
    });
    await prisma.property.update({
      where: { id: r.propertyId },
      data: { avgRating: r.rating, reviewCount: 1 },
    });
  }

  const notifications = [
    {
      userId: clientId,
      type: "SYSTEM" as const,
      title: "Bienvenue",
      message: "Explorez le catalogue et sauvegardez vos favoris.",
      read: false,
    },
    {
      userId: clientId,
      type: "CREDIT_ALERT" as const,
      title: "Taux CIH",
      message: "CIH Bank propose actuellement 4,3 % sur 25 ans.",
      read: false,
      data: { bank: "CIH Bank" },
    },
    {
      userId: clientId,
      type: "REPORT_READY" as const,
      title: "Rapport IA prêt",
      message: "Votre analyse d'éligibilité est disponible.",
      read: true,
    },
    {
      userId: agencyId,
      type: "PROPERTY_LIKED" as const,
      title: "Nouveau favori",
      message: "Un client a ajouté « Villa Agdal » à ses favoris.",
      read: false,
      data: { propertyId: "1" },
    },
    {
      userId: agencyId,
      type: "REVIEW_RECEIVED" as const,
      title: "Nouvel avis",
      message: "Un avis 5/5 a été publié sur « Riad Marrakech ».",
      read: false,
      data: { propertyId: "3" },
    },
    {
      userId: agencyId,
      type: "NEW_MESSAGE" as const,
      title: "Nouveau message",
      message: "Question sur la Villa Agdal.",
      read: false,
      data: { conversationId: "1", propertyId: "1" },
    },
    {
      userId: agencyId,
      type: "SYSTEM" as const,
      title: "Bibliothèque 3D",
      message: "Pensez à uploader vos maquettes pour les visites immersives.",
      read: true,
    },
    {
      userId: adminId,
      type: "SYSTEM" as const,
      title: "Seed OK",
      message: "Données de démonstration chargées.",
      read: false,
    },
    {
      userId: clientId,
      type: "SYSTEM" as const,
      title: "Carte disponible",
      message: "Visualisez les biens sur la carte interactive.",
      read: true,
    },
    {
      userId: agencyId,
      type: "CREDIT_ALERT" as const,
      title: "Marché crédit",
      message: "Les taux immobiliers restent favorables ce mois-ci.",
      read: true,
    },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  console.log(
    `Seeded ${DEMO_USERS.length} users, ${PROPERTIES.length} properties, ${CONVERSATIONS.length} conversations, ${BANKS.length} banks, ${favoriteIds.length} favorites, ${sampleReviews.length} reviews, ${notifications.length} notifications.`,
  );
  console.log("Demo accounts (password: demo1234):");
  for (const u of DEMO_USERS) {
    console.log(`  - ${u.role.padEnd(6)} ${u.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
