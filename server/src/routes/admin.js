import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireClerkAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const VALID_ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED'];
const VALID_IMPORT_CONFLICT_MODES = ['skip', 'overwrite'];
const STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'DELIVERED', 'CANCELLED'],
  PROCESSING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};
const DEFAULT_PRODUCT_IMAGE_URL =
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80&auto=format&fit=crop';

router.use(requireClerkAuth, requireAdmin);

function trimString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeNumberValue(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    return Number(trimmed.replace(/,/g, ''));
  }

  return Number(value);
}

function normalizeBooleanValue(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', 'yes', 'y', '1', 'active', 'visible'].includes(normalized)) {
      return true;
    }

    if (['false', 'no', 'n', '0', 'inactive', 'hidden'].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}

function normalizeImageUrls(value) {
  if (Array.isArray(value)) {
    return value.map((url) => trimString(url)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|[|,]/)
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return undefined;
}

function normalizeProductPayload(body, options = {}) {
  const { partial = false } = options;

  const name = trimString(body.name);
  const nameBn = trimString(body.nameBn);
  const description = trimString(body.description);
  const imageUrl = trimString(body.imageUrl);
  const category =
    body.category !== undefined ? trimString(body.category) : partial ? undefined : 'Fine Rice';
  const origin =
    body.origin !== undefined ? trimString(body.origin) : partial ? undefined : 'Bangladesh';

  const pricePerBag = normalizeNumberValue(body.pricePerBag);
  const bagWeightKg = normalizeNumberValue(body.bagWeightKg);
  const stock = normalizeNumberValue(body.stock);

  const normalizedImageUrls = normalizeImageUrls(body.imageUrls);
  const normalizedIsActive = normalizeBooleanValue(body.isActive);

  const requiredMissing =
    !partial && (!name || !nameBn || !description || pricePerBag === undefined || stock === undefined);

  if (requiredMissing) {
    return { error: 'name, nameBn, description, pricePerBag, and stock are required' };
  }

  if (pricePerBag !== undefined && (!Number.isFinite(pricePerBag) || pricePerBag <= 0)) {
    return { error: 'pricePerBag must be a positive number' };
  }

  if (bagWeightKg !== undefined && (!Number.isInteger(bagWeightKg) || bagWeightKg <= 0)) {
    return { error: 'bagWeightKg must be a positive integer' };
  }

  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
    return { error: 'stock must be a non-negative integer' };
  }

  const payload = {
    ...(name && { name }),
    ...(nameBn && { nameBn }),
    ...(description && { description }),
    ...(imageUrl && { imageUrl }),
    ...(normalizedImageUrls !== undefined && { imageUrls: normalizedImageUrls }),
    ...(pricePerBag !== undefined && { pricePerBag }),
    ...(bagWeightKg !== undefined && { bagWeightKg }),
    ...(stock !== undefined && { stock }),
    ...(category && { category }),
    ...(origin && { origin }),
    ...(normalizedIsActive !== undefined ? { isActive: normalizedIsActive } : {}),
  };

  if (!payload.imageUrl && normalizedImageUrls?.length) {
    payload.imageUrl = normalizedImageUrls[0];
  }

  return { data: payload };
}

function buildProductCreateData(productData) {
  const imageUrls =
    productData.imageUrls?.length
      ? productData.imageUrls
      : productData.imageUrl
        ? [productData.imageUrl]
        : [DEFAULT_PRODUCT_IMAGE_URL];

  return {
    ...productData,
    imageUrl: productData.imageUrl || imageUrls[0] || DEFAULT_PRODUCT_IMAGE_URL,
    imageUrls,
    bagWeightKg: productData.bagWeightKg || 25,
    isActive: productData.isActive ?? true,
  };
}

function buildProductImportUpdateData(existingProduct, productData) {
  const existingImageUrls = existingProduct.imageUrls?.length
    ? existingProduct.imageUrls
    : existingProduct.imageUrl
      ? [existingProduct.imageUrl]
      : [DEFAULT_PRODUCT_IMAGE_URL];

  const imageUrls =
    productData.imageUrls?.length
      ? productData.imageUrls
      : productData.imageUrl
        ? [productData.imageUrl]
        : existingImageUrls;

  return {
    ...productData,
    imageUrl: productData.imageUrl || imageUrls[0] || DEFAULT_PRODUCT_IMAGE_URL,
    imageUrls,
    bagWeightKg: productData.bagWeightKg ?? existingProduct.bagWeightKg ?? 25,
    isActive: productData.isActive ?? existingProduct.isActive ?? true,
  };
}

router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ isActive: 'desc' }, { category: 'asc' }, { createdAt: 'asc' }],
      include: { _count: { select: { orders: true } } },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Failed to fetch admin products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const normalized = normalizeProductPayload(req.body);
    if (normalized.error) {
      return res.status(400).json({ error: normalized.error });
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        name: { equals: normalized.data.name, mode: 'insensitive' },
        isActive: true,
      },
      select: { id: true },
    });

    if (existingProduct) {
      return res.status(409).json({ error: 'An active product with this name already exists' });
    }

    const product = await prisma.product.create({
      data: buildProductCreateData(normalized.data),
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.post('/products/bulk-import', async (req, res) => {
  try {
    const { products, conflictMode = 'skip' } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'At least one product row is required' });
    }

    if (!VALID_IMPORT_CONFLICT_MODES.includes(conflictMode)) {
      return res.status(400).json({ error: 'Invalid conflictMode value' });
    }

    const fileDuplicates = new Set();
    const preparedRows = [];
    const issues = [];

    products.forEach((rawProduct, index) => {
      const sourceRow =
        Number.isInteger(rawProduct?.sourceRow) && rawProduct.sourceRow > 0
          ? rawProduct.sourceRow
          : index + 2;

      const normalized = normalizeProductPayload(rawProduct);
      if (normalized.error) {
        issues.push({
          sourceRow,
          name: trimString(rawProduct?.name, 'Untitled product'),
          reason: normalized.error,
        });
        return;
      }

      const nameKey = normalized.data.name.toLowerCase();
      if (fileDuplicates.has(nameKey)) {
        issues.push({
          sourceRow,
          name: normalized.data.name,
          reason: 'Duplicate product name found inside the import file',
        });
        return;
      }

      fileDuplicates.add(nameKey);
      preparedRows.push({
        sourceRow,
        nameKey,
        data: normalized.data,
      });
    });

    if (!preparedRows.length) {
      return res.status(400).json({
        error: 'No valid product rows found in the import file',
        data: {
          totalReceived: products.length,
          validRows: 0,
          createdCount: 0,
          updatedCount: 0,
          skippedCount: issues.length,
          issues,
        },
      });
    }

    const existingProducts = await prisma.product.findMany({
      where: {
        OR: preparedRows.map((row) => ({
          name: { equals: row.data.name, mode: 'insensitive' },
        })),
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        imageUrls: true,
        bagWeightKg: true,
        isActive: true,
      },
    });

    const existingProductsByName = new Map(
      existingProducts.map((product) => [product.name.toLowerCase(), product]),
    );

    const createQueue = [];
    const updateQueue = [];

    preparedRows.forEach((row) => {
      const existingProduct = existingProductsByName.get(row.nameKey);

      if (!existingProduct) {
        createQueue.push(row);
        return;
      }

      if (conflictMode === 'skip') {
        issues.push({
          sourceRow: row.sourceRow,
          name: row.data.name,
          reason: existingProduct.isActive
            ? 'Product already exists in the catalog'
            : 'Product already exists but is currently inactive',
        });
        return;
      }

      updateQueue.push({
        id: existingProduct.id,
        data: buildProductImportUpdateData(existingProduct, row.data),
      });
    });

    const result = await prisma.$transaction(async (tx) => {
      const createdProducts = [];
      const updatedProducts = [];

      for (const row of createQueue) {
        const product = await tx.product.create({
          data: buildProductCreateData(row.data),
          select: { id: true, name: true },
        });
        createdProducts.push(product);
      }

      for (const row of updateQueue) {
        const product = await tx.product.update({
          where: { id: row.id },
          data: row.data,
          select: { id: true, name: true },
        });
        updatedProducts.push(product);
      }

      return { createdProducts, updatedProducts };
    });

    res.json({
      success: true,
      data: {
        totalReceived: products.length,
        validRows: preparedRows.length,
        createdCount: result.createdProducts.length,
        updatedCount: result.updatedProducts.length,
        skippedCount: issues.length,
        conflictMode,
        issues,
      },
    });
  } catch (error) {
    console.error('Failed to bulk import products:', error);
    res.status(500).json({ error: 'Failed to bulk import products' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const normalized = normalizeProductPayload(req.body, { partial: true });
    if (normalized.error) {
      return res.status(400).json({ error: normalized.error });
    }

    if (
      normalized.data.name &&
      (await prisma.product.findFirst({
        where: {
          name: { equals: normalized.data.name, mode: 'insensitive' },
          isActive: true,
          NOT: { id: req.params.id },
        },
        select: { id: true },
      }))
    ) {
      return res.status(409).json({ error: 'Another active product already uses this name' });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: normalized.data,
    });

    res.json({ success: true, data: product });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.error('Failed to update product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'Product archived from the storefront' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.error('Failed to archive product:', error);
    res.status(500).json({ error: 'Failed to deactivate product' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { status, upazila, page = 1, limit = 25 } = req.query;
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 25));
    const skip = (parsedPage - 1) * parsedLimit;

    const where = {
      ...(status ? { status } : {}),
      ...(upazila ? { upazila } : {}),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              nameBn: true,
              imageUrl: true,
              bagWeightKg: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parsedLimit,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parsedPage, limit: parsedLimit },
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        status: true,
        quantity: true,
        productId: true,
      },
    });

    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (currentOrder.status === status) {
      const unchanged = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: { product: { select: { id: true, name: true } } },
      });

      return res.json({ success: true, data: unchanged, message: 'Status was already set' });
    }

    if (!STATUS_TRANSITIONS[currentOrder.status].includes(status)) {
      return res.status(400).json({
        error: `Cannot change order from ${currentOrder.status} to ${status}`,
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: req.params.id },
        data: { status },
        include: { product: { select: { id: true, name: true } } },
      });

      if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
        await tx.product.update({
          where: { id: currentOrder.productId },
          data: { stock: { increment: currentOrder.quantity } },
        });
      }

      return order;
    });

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      revenue,
      activeProductsCount,
      inactiveProductsCount,
      lowStockProductsCount,
      outOfStockProductsCount,
      activeProducts,
      upazilaBreakdown,
      categoryBreakdown,
    ] = await prisma.$transaction([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalPrice: true },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: false } }),
      prisma.product.count({ where: { isActive: true, stock: { gt: 0, lte: 30 } } }),
      prisma.product.count({ where: { isActive: true, stock: { lte: 0 } } }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { stock: true, pricePerBag: true },
      }),
      prisma.order.groupBy({
        by: ['upazila'],
        _count: { upazila: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { upazila: 'desc' } },
      }),
      prisma.product.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: { category: true },
        _sum: { stock: true },
        orderBy: { _count: { category: 'desc' } },
      }),
    ]);

    const inventoryBags = activeProducts.reduce((sum, product) => sum + product.stock, 0);
    const inventoryValue = activeProducts.reduce(
      (sum, product) => sum + Number(product.pricePerBag) * product.stock,
      0,
    );

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: revenue._sum.totalPrice || 0,
        totalProducts: activeProductsCount,
        inactiveProducts: inactiveProductsCount,
        lowStockProducts: lowStockProductsCount,
        outOfStockProducts: outOfStockProductsCount,
        inventoryBags,
        inventoryValue,
        upazilaBreakdown,
        categoryBreakdown,
      },
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
