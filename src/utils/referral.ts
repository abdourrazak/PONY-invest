// Système de parrainage avec codes d'invitation uniques

export interface User {
  id: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  referralCode: string;
  referralLink: string;
}

// Génère un code d'invitation unique de 8 caractères
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Vérifie si un code d'invitation existe
export function isReferralCodeValid(code: string): boolean {
  const users = getAllUsers();
  return users.some(user => user.referralCode === code);
}

// Récupère tous les utilisateurs du localStorage
export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem('allUsers');
  return users ? JSON.parse(users) : [];
}

// Sauvegarde tous les utilisateurs dans localStorage
export function saveAllUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('allUsers', JSON.stringify(users));
}

// Crée un nouvel utilisateur avec code de parrainage
export function createUser(referredByCode?: string): User {
  const users = getAllUsers();
  
  // Génère un code unique
  let referralCode = generateReferralCode();
  while (users.some(u => u.referralCode === referralCode)) {
    referralCode = generateReferralCode();
  }

  const newUser: User = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    referralCode,
    referredBy: referredByCode && isReferralCodeValid(referredByCode) ? referredByCode : undefined,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveAllUsers(users);
  
  // Sauvegarde l'utilisateur actuel
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  localStorage.setItem('userId', newUser.id);
  
  return newUser;
}

// Récupère l'utilisateur actuel
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Génère le lien d'invitation complet
export function getReferralLink(referralCode: string): string {
  if (typeof window === 'undefined') return '';
  
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://axml-global.vercel.app' 
    : window.location.origin;
    
  return `${baseUrl}/register?ref=${referralCode}`;
}

// Récupère les statistiques de parrainage
export function getReferralStats(): ReferralStats {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return {
      totalReferrals: 0,
      referralCode: '',
      referralLink: ''
    };
  }

  const users = getAllUsers();
  const totalReferrals = users.filter(user => user.referredBy === currentUser.referralCode).length;

  return {
    totalReferrals,
    referralCode: currentUser.referralCode,
    referralLink: getReferralLink(currentUser.referralCode)
  };
}

// Initialise un utilisateur s'il n'existe pas
export function initializeUserIfNeeded(referredByCode?: string): User {
  let currentUser = getCurrentUser();
  
  if (!currentUser) {
    currentUser = createUser(referredByCode);
  }
  
  return currentUser;
}
