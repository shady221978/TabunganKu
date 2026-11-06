import { User, Transaction, WithdrawalRequest, SystemSettings } from '@/types';
import { DEFAULT_SYSTEM_SETTINGS } from '@/constants';

// Helper to generate random ID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Helper to generate member number
const generateMemberNumber = () => {
  const users = mockUsers.getUsers();
  const number = String(users.length + 1).padStart(6, '0');
  return `TBG${number}`;
};

// Helper to generate referral code
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Mock Users Storage
export const mockUsers = {
  getUsers: (): User[] => {
    const users = localStorage.getItem('users');
    if (!users) {
      const defaultUsers: User[] = [
        {
          id: '1',
          memberNumber: 'TBG000001',
          name: 'Admin System',
          email: 'admin@tabunganku.com',
          phone: '081234567890',
          address: 'Jakarta, Indonesia',
          photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
          role: 'admin',
          registrationDate: '2024-01-01',
          balance: 0,
          points: 0,
          referralCode: 'ADMIN001',
        },
        {
          id: '2',
          memberNumber: 'TBG000002',
          name: 'Budi Santoso',
          email: 'budi@example.com',
          phone: '081987654321',
          address: 'Bandung, Indonesia',
          photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
          role: 'user',
          registrationDate: '2024-01-15',
          balance: 500000,
          points: 1000000,
          referralCode: 'BUDI2024',
          bankAccount: {
            bankName: 'BNI',
            accountNumber: '1234567890',
            accountName: 'Budi Santoso',
          },
        },
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(users);
  },
  
  saveUsers: (users: User[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  },
  
  addUser: (user: User) => {
    const users = mockUsers.getUsers();
    users.push(user);
    mockUsers.saveUsers(users);
  },
};

// Mock Transactions Storage
export const mockTransactions = {
  getTransactions: (): Transaction[] => {
    const transactions = localStorage.getItem('transactions');
    return transactions ? JSON.parse(transactions) : [];
  },
  
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  },
  
  addTransaction: (transaction: Transaction) => {
    const transactions = mockTransactions.getTransactions();
    transactions.push(transaction);
    mockTransactions.saveTransactions(transactions);
  },
};

// Mock Withdrawals Storage
export const mockWithdrawals = {
  getWithdrawals: (): WithdrawalRequest[] => {
    const withdrawals = localStorage.getItem('withdrawals');
    return withdrawals ? JSON.parse(withdrawals) : [];
  },
  
  saveWithdrawals: (withdrawals: WithdrawalRequest[]) => {
    localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
  },
  
  addWithdrawal: (withdrawal: WithdrawalRequest) => {
    const withdrawals = mockWithdrawals.getWithdrawals();
    withdrawals.push(withdrawal);
    mockWithdrawals.saveWithdrawals(withdrawals);
  },
};

// System Settings Storage
export const mockSettings = {
  getSettings: (): SystemSettings => {
    const settings = localStorage.getItem('systemSettings');
    return settings ? JSON.parse(settings) : DEFAULT_SYSTEM_SETTINGS;
  },
  
  saveSettings: (settings: SystemSettings) => {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
  },
};

// Auth Functions
export const login = (email: string, password: string): User => {
  const users = mockUsers.getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('Email atau password salah');
  }
  
  // In mock, we accept any password for demo purposes
  // In production, verify password hash
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

export const register = (userData: Partial<User>, password: string): User => {
  const users = mockUsers.getUsers();
  
  // Check if email already exists
  if (users.find(u => u.email === userData.email)) {
    throw new Error('Email sudah terdaftar');
  }
  
  const newUser: User = {
    id: generateId(),
    memberNumber: generateMemberNumber(),
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    address: userData.address || '',
    photo: userData.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
    role: 'user',
    registrationDate: new Date().toISOString().split('T')[0],
    balance: 0,
    points: 0,
    referralCode: generateReferralCode(),
    referredBy: userData.referredBy,
  };
  
  mockUsers.addUser(newUser);
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  // If referred by someone, give bonus
  if (userData.referredBy) {
    const referrer = users.find(u => u.referralCode === userData.referredBy);
    if (referrer) {
      referrer.points += 50000; // Bonus 50k points for referrer
      mockUsers.saveUsers(users);
    }
  }
  
  return newUser;
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

// Transaction Functions
export const createDeposit = (userId: string, amount: number, paymentMethod: string): Transaction => {
  const settings = mockSettings.getSettings();
  const pointsEarned = amount * settings.pointsMultiplier;
  
  const transaction: Transaction = {
    id: generateId(),
    userId,
    type: 'deposit',
    amount,
    pointsEarned,
    status: 'completed', // Auto-approve for demo
    paymentMethod,
    createdAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
  };
  
  mockTransactions.addTransaction(transaction);
  
  // Update user balance and points
  const users = mockUsers.getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.balance += amount;
    user.points += pointsEarned;
    mockUsers.saveUsers(users);
    
    // Update current user
    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }
  
  return transaction;
};

export const createWithdrawalRequest = (
  userId: string,
  amount: number,
  bankName: string,
  accountNumber: string,
  accountName: string
): WithdrawalRequest => {
  const settings = mockSettings.getSettings();
  const fee = Math.max((amount * settings.withdrawalFee) / 100, settings.withdrawalFeeFixed);
  const netAmount = amount - fee;
  
  const user = mockUsers.getUsers().find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  
  const withdrawal: WithdrawalRequest = {
    id: generateId(),
    userId,
    userName: user.name,
    userPhoto: user.photo,
    amount,
    bankName,
    accountNumber,
    accountName,
    fee,
    netAmount,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };
  
  mockWithdrawals.addWithdrawal(withdrawal);
  
  // Deduct balance immediately (will be refunded if rejected)
  user.balance -= amount;
  mockUsers.saveUsers(mockUsers.getUsers());
  
  // Update current user
  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  
  return withdrawal;
};
