// prisma/seed.js — Sample product data for MS SUMA TRADERS
// Run: npm run db:seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_PRODUCTS = [
  {
    name: 'Premium Miniket Rice',
    nameBn: 'প্রিমিয়াম মিনিকেট চাল',
    description:
      'সুক্ষ্ম দানা, সাদা রং, এবং নরম গঠন — প্রতিদিনের পারিবারিক রান্নার জন্য আদর্শ। কম ভাঙা দানা এবং উজ্জ্বল রং এর জন্য পরিচিত।',
    imageUrl:
      'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=900&q=80&auto=format&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80&auto=format&fit=crop',
    ],
    pricePerBag: 3250,
    bagWeightKg: 25,
    stock: 80,
    category: 'Fine Rice',
    origin: 'Dinajpur, Bangladesh',
    isActive: true,
  },
  {
    name: 'Nazirshail Gold',
    nameBn: 'নাজিরশাইল গোল্ড',
    description:
      'বিশেষ অনুষ্ঠান ও ভোজের জন্য premium aromatic rice। সুগন্ধি, লম্বা দানা এবং অনন্য স্বাদের জন্য বিখ্যাত।',
    imageUrl:
      'https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73?w=900&q=80&auto=format&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73?w=900&q=80&auto=format&fit=crop',
    ],
    pricePerBag: 3800,
    bagWeightKg: 25,
    stock: 40,
    category: 'Aromatic Rice',
    origin: 'Kushtia, Bangladesh',
    isActive: true,
  },
  {
    name: 'BR-28 Common Rice',
    nameBn: 'বিআর-২৮ সাধারণ চাল',
    description:
      'সাশ্রয়ী মূল্যে উন্নত মানের চাল। হোটেল, রেস্তোরাঁ এবং পাইকারি ক্রেতাদের জন্য সবচেয়ে জনপ্রিয় পছন্দ।',
    imageUrl:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80&auto=format&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80&auto=format&fit=crop',
    ],
    pricePerBag: 2600,
    bagWeightKg: 50,
    stock: 120,
    category: 'Common Rice',
    origin: 'Comilla, Bangladesh',
    isActive: true,
  },
  {
    name: 'Chinigura Aromatic',
    nameBn: 'চিনিগুঁড়া সুগন্ধি চাল',
    description:
      'ঐতিহ্যবাহী পোলাও ও বিরিয়ানির জন্য বিশেষভাবে পরিচিত সুগন্ধি চাল। ছোট গোলাকার দানা এবং মিষ্টি সুবাস।',
    imageUrl:
      'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=900&q=80&auto=format&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=900&q=80&auto=format&fit=crop',
    ],
    pricePerBag: 4200,
    bagWeightKg: 25,
    stock: 28,
    category: 'Aromatic Rice',
    origin: 'Rajshahi, Bangladesh',
    isActive: true,
  },
  {
    name: 'Siddho Parboiled Rice',
    nameBn: 'সিদ্ধ চাল (পার্বয়েলড)',
    description:
      'ভাপে সিদ্ধ প্রক্রিয়ায় তৈরি পুষ্টিগুণ সমৃদ্ধ চাল। রান্নার পরেও দানা আলাদা থাকে এবং হজম সহজ।',
    imageUrl:
      'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=900&q=80&auto=format&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=900&q=80&auto=format&fit=crop',
    ],
    pricePerBag: 2900,
    bagWeightKg: 50,
    stock: 65,
    category: 'Parboiled Rice',
    origin: 'Sylhet, Bangladesh',
    isActive: true,
  },
  {
    name: 'Red Bran Health Rice',
    nameBn: 'লাল চাল (ব্রাউন রাইস)',
    description:
      'আনপলিশড লাল চাল — উচ্চ ফাইবার, ভিটামিন ও মিনারেল সমৃদ্ধ। স্বাস্থ্য সচেতন পরিবারের জন্য আদর্শ।',
    imageUrl:
      'https://images.unsplash.com/photo-1555651539-b44c34db46a7?w=900&q=80&auto=format&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1555651539-b44c34db46a7?w=900&q=80&auto=format&fit=crop',
    ],
    pricePerBag: 3500,
    bagWeightKg: 25,
    stock: 18,
    category: 'Health Rice',
    origin: 'Jamalpur, Bangladesh',
    isActive: true,
  },
];

async function main() {
  console.log('🌾 MS SUMA TRADERS — Seeding database...');
  console.log(`📦 Inserting ${SAMPLE_PRODUCTS.length} sample products\n`);

  let created = 0;
  let skipped = 0;

  for (const product of SAMPLE_PRODUCTS) {
    const existing = await prisma.product.findFirst({
      where: { name: { equals: product.name, mode: 'insensitive' } },
      select: { id: true },
    });

    if (existing) {
      console.log(`  ⏩ Skipped (already exists): ${product.name}`);
      skipped++;
    } else {
      await prisma.product.create({ data: product });
      console.log(
        `  ✅ Created: ${product.name} — ৳${product.pricePerBag} / ${product.bagWeightKg}kg bag`,
      );
      created++;
    }
  }

  console.log(`\n🎉 Seeding complete! Created: ${created}, Skipped: ${skipped}`);
  console.log(
    '\n💡 Tip: Add products manually from the admin dashboard at /admin for future updates.',
  );
}

main()
  .catch((error) => {
    console.error('❌ Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
