import { Prisma } from "@/lib/generated/prisma";
import { prisma } from "@/lib/db";
import { ReferralStatus, RewardStatus } from "@/lib/db";

/** Admin read queries for the management pages. */

type RejectionMetadata = {
  reasonCode?: string;
  note?: string | null;
  rejectedById?: string;
  rejectedByName?: string;
  rejectedByEmail?: string;
  previousStatus?: string;
  rewardAmount?: number;
  currency?: string;
};

function parseRejectionMetadata(metadata: Prisma.JsonValue | null): RejectionMetadata | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  return metadata as RejectionMetadata;
}

export async function getAllRewards(statusFilter?: RewardStatus) {
  const rewards = await prisma.reward.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      reason: true,
      createdAt: true,
      user: { select: { name: true } },
      referral: {
        select: {
          referredUser: { select: { name: true } },
          events: {
            where: { eventType: "REWARD_REJECTED" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              createdAt: true,
              metadata: true,
            },
          },
        },
      },
    },
  });

  return rewards.map((reward) => {
    const rejectionEvent = reward.referral.events[0];

    return {
      ...reward,
      rejection: rejectionEvent
        ? {
            rejectedAt: rejectionEvent.createdAt,
            ...parseRejectionMetadata(rejectionEvent.metadata),
          }
        : null,
    };
  });
}

export async function getAllReferrals(statusFilter?: ReferralStatus) {
  return prisma.referral.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      referralCode: true,
      referrer: { select: { name: true } },
      referredUser: { select: { name: true } },
      reward: { select: { amount: true, status: true } },
      events: {
        orderBy: { createdAt: "asc" },
        select: { eventType: true, createdAt: true },
      },
    },
  });
}

export async function getAllReferralClicks(skip: number, take: number) {
  const [totalClicks, clicks] = await Promise.all([
    prisma.referralClick.count(),
    prisma.referralClick.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        referralCode: true,
        landingPage: true,
        userAgent: true,
        createdAt: true,
        referrer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return { totalClicks, clicks };
}

export async function getAllUsers(skip: number, take: number) {
  const [totalUsers, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        referralCode: true,
        profileComplete: true,
        createdAt: true,
      },
    }),
  ]);

  return { totalUsers, users };
}
