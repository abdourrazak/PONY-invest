// Système de parrainage avec codes d'invitation uniques

export interface User {
  id: string;
  phone?: string;
  password?: string;
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
  
  // Détection automatique de l'URL Vercel ou locale
  const baseUrl = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    ? window.location.origin
    : process.env.NODE_ENV === 'production' 
      ? 'https://pony-invest.vercel.app' 
      : window.location.origin;
    
  return `${baseUrl}/register-auth?ref=${referralCode}`;
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

// Crée un utilisateur avec informations complètes
export function createUserWithReferral(userData: {
  phone: string;
  password: string;
  referredBy?: string;
}): boolean {
  try {
    // Vérifier si le code de parrainage est valide (si fourni)
    if (userData.referredBy && !isReferralCodeValid(userData.referredBy)) {
      return false;
    }

    const users = getAllUsers();
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(u => u.phone === userData.phone);
    if (existingUser) {
      return false;
    }
    
    // Génère un code unique
    let referralCode = generateReferralCode();
    while (users.some(u => u.referralCode === referralCode)) {
      referralCode = generateReferralCode();
    }

    const newUser: User = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      phone: userData.phone,
      password: userData.password, // En production, il faudrait hasher le mot de passe
      referralCode,
      referredBy: userData.referredBy,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveAllUsers(users);
    
    // Sauvegarde l'utilisateur actuel
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('userId', newUser.id);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return false;
  }
}

// Initialise un utilisateur s'il n'existe pas
export function initializeUserIfNeeded(referredByCode?: string): User {
  let currentUser = getCurrentUser();
  
  if (!currentUser) {
    currentUser = createUser(referredByCode);
  }
  
  return currentUser;
}
