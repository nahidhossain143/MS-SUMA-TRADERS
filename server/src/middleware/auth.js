// src/middleware/auth.js
import { requireAuth, getAuth } from '@clerk/express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Require valid Clerk session (returns 401 if missing) ──
export const requireClerkAuth = requireAuth();

// ── Require Admin role ──
export const requireAdmin = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Check env whitelist first
    const adminIds = (process.env.ADMIN_USER_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (adminIds.includes(userId)) {
      req.isAdmin = true;
      return next();
    }

    // Check DB
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }

    req.isAdmin = true;
    next();
  } catch (error) {
    console.error('requireAdmin error:', error);
    res.status(500).json({ error: 'Auth check failed' });
  }
};
