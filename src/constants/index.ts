import { SystemSettings } from '@/types';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  pointsMultiplier: 2,
  minDeposit: 10000,
  minWithdrawal: 50000,
  withdrawalFee: 1, // 1%
  withdrawalFeeFixed: 2500,
  banks: [
    {
      name: 'Mandiri',
      accountNumber: '1860007640002',
      accountName: 'Halim Shady',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg'
    }
  ],
  ewallets: [
    {
      name: 'OVO',
      accountNumber: '082194909137',
      accountName: 'Halim Shady',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg'
    },
    {
      name: 'DANA',
      accountNumber: '082194909137',
      accountName: 'Halim Shady',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg'
    }
  ]
};

export const PAYMENT_METHODS = [
  { value: 'mandiri', label: 'Bank Mandiri', type: 'bank' },
  { value: 'ovo', label: 'OVO', type: 'ewallet' },
  { value: 'dana', label: 'DANA', type: 'ewallet' },
];

export const TRANSACTION_STATUS_LABELS = {
  pending: 'Menunggu',
  completed: 'Selesai',
  rejected: 'Ditolak',
  approved: 'Disetujui',
};

export const TRANSACTION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  approved: 'bg-blue-100 text-blue-800',
};
