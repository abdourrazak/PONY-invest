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
      if (userData.totalDeposited === undefined || userData.totalInvested === undefined) {
        const userRef = doc(db, 'users', userDoc.id)
        
        batch.update(userRef, {
          totalDeposited: userData.totalDeposited || 0,
          totalInvested: userData.totalInvested || 0,
          lastDepositDate: userData.lastDepositDate || null
        })
        
        updatedCount++
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
