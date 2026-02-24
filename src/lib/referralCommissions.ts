import { doc, updateDoc, getDoc, collection, query, where, getDocs, runTransaction, increment, addDoc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db } from './firebase'

// Interface pour les commissions de parrainage
export interface ReferralCommission {
  id?: string
  sponsorId: string
  referredUserId: string
  referredUserPhone: string
  investmentAmount: number
  commissionPercentage: number
  commissionAmount: number
  level: 'A' | 'B' | 'C'
  productName: string
  createdAt: any
}

// Pourcentages de commission par niveau
const COMMISSION_RATES = {
  A: 0.10, // 10% Équipe A
  B: 0.05, // 5% Équipe B  
  C: 0.03  // 3% Équipe C
}

// Traiter les commissions de parrainage
export async function processReferralCommissions(
  investorUserId: string,
  investorPhone: string,
  investmentAmount: number,
  productName: string
): Promise<void> {
  try {
    console.log('🎯 Début traitement commissions parrainage:', {
      investorUserId,
      investorPhone,
      investmentAmount,
      productName
    })
    
    // Récupérer la chaîne de parrainage
    const referralChain = await getReferralChain(investorUserId)
    console.log('👥 Chaîne de parrainage trouvée:', referralChain)
    
    if (referralChain.length === 0) {
      console.log('❌ Aucun parrain trouvé pour cet utilisateur')
      return
    }
    
    // Traiter les commissions pour chaque niveau
    const levels = ['A', 'B', 'C'] as const
    
    for (let i = 0; i < Math.min(referralChain.length, 3); i++) {
      const sponsorId = referralChain[i]
      const level = levels[i]
      const commissionRate = COMMISSION_RATES[level]
      const commissionAmount = Math.round(investmentAmount * commissionRate)
      
      console.log(`💰 Traitement commission Équipe ${level}:`, {
        sponsorId,
        commissionRate: `${commissionRate * 100}%`,
        commissionAmount
      })
      
      // Mettre à jour le solde du parrain
      await runTransaction(db, async (transaction) => {
        const sponsorRef = doc(db, 'users', sponsorId)
        const sponsorDoc = await transaction.get(sponsorRef)
        
        if (sponsorDoc.exists()) {
          transaction.update(sponsorRef, {
            balance: increment(commissionAmount),
            withdrawableBalance: increment(commissionAmount) // Ajouter au solde retirable
          })
          
          // Enregistrer la commission
          const commissionRef = doc(collection(db, 'referralCommissions'))
          transaction.set(commissionRef, {
            sponsorId,
            referredUserId: investorUserId,
            referredUserPhone: investorPhone,
            investmentAmount,
            commissionPercentage: commissionRate * 100,
            commissionAmount,
            level,
            productName,
            createdAt: serverTimestamp()
          })
          
          console.log(`✅ Commission Équipe ${level} payée: ${commissionAmount} $ à ${sponsorId}`)
        } else {
          console.log(`❌ Parrain ${sponsorId} non trouvé`)
        }
      })
    }
    console.log('✅ Traitement des commissions de parrainage terminé')
  } catch (error) {
    console.error('❌ Erreur commissions parrainage:', error)
  }
}

// Récupérer la chaîne de parrainage
async function getReferralChain(userId: string): Promise<string[]> {
  const chain: string[] = []
  let currentUserId = userId
  
  for (let level = 0; level < 3; level++) {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUserId))
      if (!userDoc.exists()) break
      
      const userData = userDoc.data()
      if (!userData.referredBy) break
      
      const sponsorQuery = query(
        collection(db, 'users'),
        where('referralCode', '==', userData.referredBy)
      )
      const sponsorSnapshot = await getDocs(sponsorQuery)
      
      if (sponsorSnapshot.empty) break
      
      const sponsorDoc = sponsorSnapshot.docs[0]
      chain.push(sponsorDoc.id)
      currentUserId = sponsorDoc.id
    } catch (error) {
      break
    }
  }
  
  return chain
}

// Récupérer les commissions reçues par un utilisateur
export async function getUserCommissions(userId: string): Promise<ReferralCommission[]> {
  try {
    const commissionsQuery = query(
      collection(db, 'referralCommissions'),
      where('sponsorId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(commissionsQuery)
    const commissions: ReferralCommission[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      commissions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as ReferralCommission)
    })
    
    return commissions
  } catch (error) {
    console.error('Erreur lors de la récupération des commissions:', error)
    return []
  }
}

// Calculer le total des commissions reçues
export async function getTotalCommissions(userId: string): Promise<number> {
  try {
    const commissions = await getUserCommissions(userId)
    return commissions.reduce((total, commission) => total + commission.commissionAmount, 0)
  } catch (error) {
    console.error('Erreur calcul total commissions:', error)
    return 0
  }
}
