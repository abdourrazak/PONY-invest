import { Timestamp } from 'firebase/firestore';

// Types de base
export type TransactionStatus = 'pending' | 'success' | 'rejected' | 'approved';
export type TransactionType = 'deposit' | 'withdrawal';
export type PaymentMethod = 'orange' | 'mtn' | 'crypto';
export type UserRole = 'user' | 'admin';

// Interface Transaction
export interface Transaction {
  createdAt: any;
  userPhone: string;
  proofImage: any;
  id: string;
  type: TransactionType;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  userId: string;
  userNumeroTel: string;
  beneficiaryName?: string;
  phoneNumber?: string;
  cryptoAddress?: string;
  transactionImage?: string;
  submittedAt: Timestamp | Date;
  adminNotes?: string;
  updatedAt?: Timestamp | Date;
}

// Interface User
export interface User {
  uid: string;
  numeroTel: string;
  displayName: string;
  balance: number;
  role: UserRole;
  createdAt: Timestamp | Date;
  referralCode?: string;
  referredBy?: string;
}

// Filtres pour l'admin
export interface TransactionFilters {
  status?: TransactionStatus;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

// Stats pour le dashboard
export interface TransactionStats {
  totalPending: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  volume24h: number;
  totalTransactions: number;
}

// Données de création de transaction
export interface CreateTransactionData {
  type: TransactionType;
  amount: number;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  beneficiaryCode?: string;
  beneficiaryName?: string;
  proofImage?: string; // Base64 image pour les dépôts
  cryptoAddress?: string;
  transactionImage?: string;
}

// Options pour mise à jour admin
export interface AdminUpdateOptions {
  adminNotes?: string;
  updatedAt?: Timestamp;
}
