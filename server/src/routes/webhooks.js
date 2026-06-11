// src/routes/webhooks.js — Clerk Webhook handler
// Listens to Clerk events (user.created, user.updated) to sync users into the DB

import express, { Router } from 'express';
import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Webhooks need raw body — handled by express.raw() before express.json()
router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const headers = {
    'svix-id': req.headers['svix-id'],
    'svix-timestamp': req.headers['svix-timestamp'],
    'svix-signature': req.headers['svix-signature'],
  };

  let event;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(req.body, headers);
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const { type, data } = event;

  try {
    if (type === 'user.created' || type === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = data;
      const email = email_addresses?.[0]?.email_address || '';
      const name = [first_name, last_name].filter(Boolean).join(' ');

      await prisma.user.upsert({
        where: { clerkUserId: id },
        update: { email, name },
        create: { clerkUserId: id, email, name },
      });

      console.log(`✅ User synced from Clerk webhook: ${email}`);
    }

    if (type === 'user.deleted') {
      await prisma.user.deleteMany({ where: { clerkUserId: data.id } });
      console.log(`🗑️  User deleted: ${data.id}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
