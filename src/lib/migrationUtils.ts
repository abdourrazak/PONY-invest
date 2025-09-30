import { doc, updateDoc, getDocs, collection, writeBatch } from 'firebase/firestore'
import { db } from './firebase'

// Migration pour ajouter les nouveaux champs aux utilisateurs existants
export async function migrateUsersForInvestmentRules(): Promise<void> {
  try {
    console.log('🔄 Début de la migration des utilisateurs...')
    
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const batch = writeBatch(db)
    let updatedCount = 0
    
    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data()
      
      // Vérifier si les nouveaux champs existent déjà
      if (userData.depositBalance === undefined || userData.withdrawableBalance === undefined) {
        const userRef = doc(db, 'users', userDoc.id)
        
        const currentBalance = userData.balance || 0
        
        // Pour les comptes existants, tout le solde actuel devient retirable
        // (considéré comme des gains/bonus accumulés avant la mise à jour)
        batch.update(userRef, {
          depositBalance: 0, // Pas de dépôt en attente pour les anciens comptes
          withdrawableBalance: currentBalance, // Tout le solde actuel devient retirable
          totalDeposited: userData.totalDeposited || 0,
          totalInvested: userData.totalInvested || 0,
          lastDepositDate: userData.lastDepositDate || null
        })
        
        updatedCount++
        console.log(`Migration utilisateur ${userDoc.id}: balance ${currentBalance} → withdrawableBalance`)
      }
    })
    
    if (updatedCount > 0) {
      await batch.commit()
      console.log(`✅ Migration terminée: ${updatedCount} utilisateurs mis à jour`)
    } else {
      console.log('✅ Aucune migration nécessaire')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  }
}

// Fonction pour réinitialiser les totaux d'un utilisateur (utile pour les tests)
export async function resetUserInvestmentTotals(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      depositBalance: 0,
      withdrawableBalance: 1000, // Remettre le bonus d'inscription
      totalDeposited: 0,
      totalInvested: 0,
      lastDepositDate: null
    })
    console.log(`✅ Totaux réinitialisés pour l'utilisateur ${userId}`)
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error)
    throw error
  }
}
