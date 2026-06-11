import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/express';
import { requireClerkAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const VALID_PAYMENT_METHODS = ['BKASH', 'NAGAD', 'CASH_ON_DELIVERY'];
const BRAHMANBARIA_UPAZILAS = [
  'Brahmanbaria Sadar',
  'Ashuganj',
  'Sarail',
  'Bancharampur',
  'Kasba',
  'Nabinagar',
  'Nasirnagar',
  'Bijoynagar',
  'Akhaura',
];

router.use(requireClerkAuth);

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

router.post('/', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const {
      productId,
      quantity,
      customerName,
      phone,
      upazila,
      address,
      paymentMethod,
      notes,
    } = req.body;

    if (!productId || !quantity || !customerName || !phone || !upazila || !address) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const cleanedUpazila = String(upazila).trim();
    if (!BRAHMANBARIA_UPAZILAS.includes(cleanedUpazila)) {
      return res.status(400).json({ error: 'We currently deliver within Brahmanbaria district only' });
    }

    if (paymentMethod && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1 bag' });
    }

    const cleanedPhone = normalizePhone(phone);
    if (cleanedPhone.length !== 11) {
      return res.status(400).json({ error: 'Enter a valid Bangladesh phone number' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        isActive: true,
        stock: true,
        name: true,
        nameBn: true,
        imageUrl: true,
        bagWeightKg: true,
        pricePerBag: true,
      },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < parsedQty) {
      return res.status(400).json({ error: `Only ${product.stock} bags are available right now` });
    }

    const totalPrice = Number(product.pricePerBag) * parsedQty;
    const orderNumber = `MMST-${Date.now().toString().slice(-6)}`;

    const createdOrder = await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { clerkUserId: userId },
        update: {
          name: String(customerName).trim(),
          phone: cleanedPhone,
          address: String(address).trim(),
          upazila: cleanedUpazila,
        },
        create: {
          clerkUserId: userId,
          email: `${userId}@pending.clerk`,
          name: String(customerName).trim(),
          phone: cleanedPhone,
          address: String(address).trim(),
          upazila: cleanedUpazila,
        },
      });

      const stockUpdate = await tx.product.updateMany({
        where: {
          id: productId,
          isActive: true,
          stock: { gte: parsedQty },
        },
        data: { stock: { decrement: parsedQty } },
      });

      if (stockUpdate.count !== 1) {
        throw new Error('Stock changed before the order could be placed');
      }

      return tx.order.create({
        data: {
          clerkUserId: userId,
          orderNumber,
          customerName: String(customerName).trim(),
          phone: cleanedPhone,
          upazila: cleanedUpazila,
          address: String(address).trim(),
          productId,
          quantity: parsedQty,
          totalPrice,
          paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
          status: 'PENDING',
          notes: String(notes || '').trim() || null,
        },
        include: {
          product: {
            select: {
              name: true,
              nameBn: true,
              imageUrl: true,
              bagWeightKg: true,
              pricePerBag: true,
            },
          },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Our team will confirm it shortly.',
      data: createdOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);
    if (error.message === 'Stock changed before the order could be placed') {
      return res.status(409).json({
        error: 'This product stock just changed. Please review the available quantity and try again.',
      });
    }

    res.status(500).json({ error: 'Failed to place order' });
  }
});

router.get('/my', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const orders = await prisma.order.findMany({
      where: { clerkUserId: userId },
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
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
