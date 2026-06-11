import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const SORT_OPTIONS = {
  featured: [{ stock: 'desc' }, { createdAt: 'asc' }],
  newest: [{ createdAt: 'desc' }],
  'price-asc': [{ pricePerBag: 'asc' }],
  'price-desc': [{ pricePerBag: 'desc' }],
  'name-asc': [{ name: 'asc' }],
  'stock-desc': [{ stock: 'desc' }, { name: 'asc' }],
};

router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      category,
      origin,
      availability = 'all',
      sort = 'featured',
    } = req.query;

    const trimmedSearch = String(search).trim();

    const stockFilters = {
      'in-stock': { gt: 0 },
      'low-stock': { gt: 0, lte: 30 },
      'out-of-stock': { lte: 0 },
    };

    const where = {
      isActive: true,
      ...(category && category !== 'All' ? { category: String(category) } : {}),
      ...(origin && origin !== 'All' ? { origin: String(origin) } : {}),
      ...(availability !== 'all' && stockFilters[availability]
        ? { stock: stockFilters[availability] }
        : {}),
      ...(trimmedSearch
        ? {
            OR: [
              { name: { contains: trimmedSearch, mode: 'insensitive' } },
              { nameBn: { contains: trimmedSearch, mode: 'insensitive' } },
              { description: { contains: trimmedSearch, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [products, catalogOptions] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: SORT_OPTIONS[sort] || SORT_OPTIONS.featured,
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { category: true, origin: true },
      }),
    ]);

    const filters = {
      categories: [...new Set(catalogOptions.map((item) => item.category))].sort(),
      origins: [...new Set(catalogOptions.map((item) => item.origin))].sort(),
      total: products.length,
    };

    res.json({ success: true, data: products, filters });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
