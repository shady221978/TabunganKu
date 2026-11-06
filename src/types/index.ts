export interface User {
  id: string;
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  photo: string;
  role: 'user' | 'admin';
  registrationDate: string;
  balance: number;
  points: number;
  referralCode: string;
  referredBy?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  // Points unlock system
  firstDepositApprovedDate?: string | null; // ISO date string of first approved deposit
  pointsDayOffset?: number; // Extra days added (from withdrawals) or subtracted (from deposits)
  pointsUnlockNotified?: boolean; // Whether unlock notification has been sent
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'bonus';
  amount: number;
  pointsEarned?: number;
  status: 'pending' | 'completed' | 'rejected';
  paymentMethod?: string;
  paymentProof?: string; // Base64 image or URL
  proofStatus?: 'pending' | 'verified' | 'rejected'; // For deposit proof verification
  notes?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  fee: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export interface SystemSettings {
  pointsMultiplier: number; // Default 2x
  minDeposit: number;
  minWithdrawal: number;
  withdrawalFee: number; // Percentage
  withdrawalFeeFixed: number; // Fixed amount
  banks: Array<{
    name: string;
    accountNumber: string;
    accountName: string;
    logo: string;
  }>;
  ewallets: Array<{
    name: string;
    accountNumber: string;
    accountName: string;
    logo: string;
  }>;
}

export interface DashboardStats {
  totalUsers: number;
  totalBalance: number;
  totalPoints: number;
  pendingWithdrawals: number;
  todayDeposits: number;
  todayWithdrawals: number;
  monthlyDeposits: number;
  monthlyWithdrawals: number;
}
