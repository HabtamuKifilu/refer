import { prisma } from "@/lib/db";
import { ReferralEventType, RewardStatus } from "@/lib/db";

const ANALYTICS_DAYS = 30;

function getStartDate(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (ANALYTICS_DAYS - 1));
  return date;
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function createDateSeries(startDate: Date): string[] {
  return Array.from({ length: ANALYTICS_DAYS }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return getDateKey(date);
  });
}

function createEmptySeries(startDate: Date): Map<string, number> {
  return new Map(createDateSeries(startDate).map((date) => [date, 0]));
}

export type ReferralFunnelAnalytics = {
  clicks: number;
  registered: number;
  qualified: number;
  completed: number;
};

export type ReferralActivityPoint = {
  date: string;
  clicks: number;
  registered: number;
  qualified: number;
  completed: number;
};

export type RewardStatusAnalytics = {
  status: RewardStatus;
  count: number;
  amount: number;
};

export type RewardValuePoint = {
  date: string;
  amount: number;
};

export type RejectionReasonAnalytics = {
  reasonCode: string;
  reasonLabel: string;
  count: number;
  amount: number;
};

export type RejectionTrendPoint = {
  date: string;
  count: number;
  amount: number;
};

export type AdminAnalytics = {
  periodDays: number;
  periodStart: Date;
  funnel: ReferralFunnelAnalytics;
  referralActivity: ReferralActivityPoint[];
  rewardStatuses: RewardStatusAnalytics[];
  rewardValue: RewardValuePoint[];
  rejectionReasons: RejectionReasonAnalytics[];
  rejectionTrend: RejectionTrendPoint[];
};

const REJECTION_REASON_LABELS: Record<string, string> = {
  INVALID_REFERRAL: "Invalid referral",
  DUPLICATE_REFERRAL: "Duplicate referral",
  NOT_ELIGIBLE: "Eligibility requirement not met",
  INVALID_INFORMATION: "Invalid or incomplete information",
  SUSPICIOUS_ACTIVITY: "Suspicious activity",
  OTHER: "Other",
};

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const periodStart = getStartDate();

  const [
    totalClicks,
    registered,
    qualified,
    completed,
    recentClicks,
    recentReferralEvents,
    rewardStatusRows,
    recentRewards,
    rejectionEvents,
  ] = await Promise.all([
    prisma.referralClick.count(),
    prisma.referralEvent.count({
      where: { eventType: ReferralEventType.USER_REGISTERED },
    }),
    prisma.referralEvent.count({
      where: { eventType: ReferralEventType.REFERRAL_QUALIFIED },
    }),
    prisma.referralEvent.count({
      where: { eventType: ReferralEventType.REFERRAL_COMPLETED },
    }),
    prisma.referralClick.findMany({
      where: { createdAt: { gte: periodStart } },
      select: { createdAt: true },
    }),
    prisma.referralEvent.findMany({
      where: {
        createdAt: { gte: periodStart },
        eventType: {
          in: [
            ReferralEventType.USER_REGISTERED,
            ReferralEventType.REFERRAL_QUALIFIED,
            ReferralEventType.REFERRAL_COMPLETED,
          ],
        },
      },
      select: {
        eventType: true,
        createdAt: true,
      },
    }),
    prisma.reward.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.reward.findMany({
      where: { createdAt: { gte: periodStart } },
      select: {
        amount: true,
        createdAt: true,
      },
    }),
    prisma.referralEvent.findMany({
      where: {
        createdAt: { gte: periodStart },
        eventType: ReferralEventType.REWARD_REJECTED,
      },
      select: {
        createdAt: true,
        metadata: true,
      },
    }),
  ]);

  const funnel: ReferralFunnelAnalytics = {
    clicks: totalClicks,
    registered,
    qualified,
    completed,
  };

  const clickSeries = createEmptySeries(periodStart);
  const registeredSeries = createEmptySeries(periodStart);
  const qualifiedSeries = createEmptySeries(periodStart);
  const completedSeries = createEmptySeries(periodStart);

  for (const click of recentClicks) {
    const key = getDateKey(click.createdAt);
    clickSeries.set(key, (clickSeries.get(key) ?? 0) + 1);
  }

  for (const event of recentReferralEvents) {
    const key = getDateKey(event.createdAt);

    if (event.eventType === ReferralEventType.USER_REGISTERED) {
      registeredSeries.set(key, (registeredSeries.get(key) ?? 0) + 1);
    }

    if (event.eventType === ReferralEventType.REFERRAL_QUALIFIED) {
      qualifiedSeries.set(key, (qualifiedSeries.get(key) ?? 0) + 1);
    }

    if (event.eventType === ReferralEventType.REFERRAL_COMPLETED) {
      completedSeries.set(key, (completedSeries.get(key) ?? 0) + 1);
    }
  }

  const referralActivity: ReferralActivityPoint[] = createDateSeries(
    periodStart,
  ).map((date) => ({
    date,
    clicks: clickSeries.get(date) ?? 0,
    registered: registeredSeries.get(date) ?? 0,
    qualified: qualifiedSeries.get(date) ?? 0,
    completed: completedSeries.get(date) ?? 0,
  }));

  const rewardStatuses: RewardStatusAnalytics[] = Object.values(
    RewardStatus,
  ).map((status) => {
    const row = rewardStatusRows.find((item) => item.status === status);

    return {
      status,
      count: row?._count._all ?? 0,
      amount: row?._sum.amount ?? 0,
    };
  });

  const rewardValueSeries = createEmptySeries(periodStart);

  for (const reward of recentRewards) {
    const key = getDateKey(reward.createdAt);
    rewardValueSeries.set(
      key,
      (rewardValueSeries.get(key) ?? 0) + reward.amount,
    );
  }

  const rewardValue: RewardValuePoint[] = createDateSeries(periodStart).map(
    (date) => ({
      date,
      amount: rewardValueSeries.get(date) ?? 0,
    }),
  );

  const rejectionReasonMap = new Map<
    string,
    { count: number; amount: number }
  >();
  const rejectionTrendSeries = createEmptySeries(periodStart);
  const rejectionAmountSeries = createEmptySeries(periodStart);

  for (const event of rejectionEvents) {
    const metadata =
      event.metadata &&
      typeof event.metadata === "object" &&
      !Array.isArray(event.metadata)
        ? event.metadata
        : null;

    const reasonCode =
      metadata && typeof metadata.reasonCode === "string"
        ? metadata.reasonCode
        : "OTHER";

    const amount =
      metadata && typeof metadata.rewardAmount === "number"
        ? metadata.rewardAmount
        : 0;

    const current = rejectionReasonMap.get(reasonCode) ?? {
      count: 0,
      amount: 0,
    };

    rejectionReasonMap.set(reasonCode, {
      count: current.count + 1,
      amount: current.amount + amount,
    });

    const dateKey = getDateKey(event.createdAt);
    rejectionTrendSeries.set(
      dateKey,
      (rejectionTrendSeries.get(dateKey) ?? 0) + 1,
    );
    rejectionAmountSeries.set(
      dateKey,
      (rejectionAmountSeries.get(dateKey) ?? 0) + amount,
    );
  }

  const rejectionReasons: RejectionReasonAnalytics[] = Array.from(
    rejectionReasonMap.entries(),
  )
    .map(([reasonCode, data]) => ({
      reasonCode,
      reasonLabel: REJECTION_REASON_LABELS[reasonCode] ?? reasonCode,
      count: data.count,
      amount: data.amount,
    }))
    .sort((a, b) => b.count - a.count);

  const rejectionTrend: RejectionTrendPoint[] = createDateSeries(
    periodStart,
  ).map((date) => ({
    date,
    count: rejectionTrendSeries.get(date) ?? 0,
    amount: rejectionAmountSeries.get(date) ?? 0,
  }));

  return {
    periodDays: ANALYTICS_DAYS,
    periodStart,
    funnel,
    referralActivity,
    rewardStatuses,
    rewardValue,
    rejectionReasons,
    rejectionTrend,
  };
}
