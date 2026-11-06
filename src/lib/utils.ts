import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Points Unlock System ───────────────────────────────────────────────────

const POINTS_UNLOCK_DAYS = 100;
const BALANCE_UNIT = 10000; // Every 10,000 = 1 day adjustment

/**
 * Calculate days remaining before points can be withdrawn.
 * Returns:
 *   - positive number = days remaining
 *   - 0 or negative   = already unlocked
 *   - null             = no deposit yet (never started)
 */
export function getPointsDaysRemaining(user: User): number | null {
  const startDate = user.firstDepositApprovedDate;
  if (!startDate) return null;

  const offset = user.pointsDayOffset ?? 0;
  const daysSince = Math.floor(
    (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  // offset > 0 means extra days added (punishment from withdrawals)
  const remaining = POINTS_UNLOCK_DAYS + offset - daysSince;
  return remaining;
}

/**
 * Returns true when points are fully unlocked (remaining <= 0).
 */
export function arePointsUnlocked(user: User): boolean {
  const remaining = getPointsDaysRemaining(user);
  return remaining !== null && remaining <= 0;
}

/**
 * Calculate updated day offset based on a balance change.
 * balanceChange < 0 → withdrawal → adds penalty days
 * balanceChange > 0 → deposit    → removes penalty days (min 0)
 */
export function calcDayOffsetForBalanceChange(
  currentOffset: number,
  balanceChange: number
): number {
  const units = Math.floor(Math.abs(balanceChange) / BALANCE_UNIT);
  if (balanceChange < 0) {
    return currentOffset + units;
  } else {
    return Math.max(0, currentOffset - units);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}
