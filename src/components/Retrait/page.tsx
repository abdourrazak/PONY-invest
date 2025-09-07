'use client'
import Link from 'next/link'
import NavigationLink from '../NavigationLink/NavigationLink'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import { createTransaction, getUserBalance, subscribeToUserBalance } from '@/lib/transactions'
import { CreateTransactionData } from '@/types/transactions'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Fonction pour hasher le mot de passe avec SHA-256
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function RetraitPage() {
  const { currentUser, userData } = useAuth()
  const router = useRouter()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0)
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [fundsPassword, setFundsPassword] = useState('')
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasConfiguredPassword, setHasConfiguredPassword] = useState(false)
  const [hasWithdrawalAccount, setHasWithdrawalAccount] = useState(false)
  const [withdrawalAccountInfo, setWithdrawalAccountInfo] = useState<any>(null)

  const paymentMethods = [
    {
      name: 'Orange Money',
      value: 'orange',
      color: 'border-orange-200 bg-orange-50',
      selectedColor: 'border-orange-500 bg-orange-100'
    },
    {
      name: 'MTN Money',
      value: 'mtn',
      color: 'border-yellow-200 bg-yellow-50',
      selectedColor: 'border-yellow-500 bg-yellow-100'
    }
  ]

  // Charger le solde de l'utilisateur
  useEffect(() => {
    if (currentUser) {
      // S'abonner aux changements de solde en temps réel
      const unsubscribe = subscribeToUserBalance(currentUser.uid, (newBalance) => {
        setBalance(newBalance)
      })

      // Vérifier si l'utilisateur a configuré un mot de passe des fonds
      const checkFundsPassword = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setHasConfiguredPassword(!!data.fundsPassword?.hash)
            
            // Vérifier les informations de retrait
            if (data.withdrawalAccount) {
              setHasWithdrawalAccount(true)
              setWithdrawalAccountInfo(data.withdrawalAccount)
            } else {
              setHasWithdrawalAccount(false)
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du mot de passe:', error)
        }
      }

      checkFundsPassword()
      return () => unsubscribe()
    }
  }, [currentUser])

  const handleSubmit = async () => {
    if (!amount || !currentUser || !userData) return

    // Vérifier si l'utilisateur a configuré un mot de passe des fonds
    if (!hasConfiguredPassword) {
      alert('Vous devez d\'abord configurer un mot de passe des fonds dans le Centre membre')
      router.push('/centre-membre/mot-de-passe-fonds')
      return
    }

    // Vérifier si l'utilisateur a configuré ses informations de retrait
    if (!hasWithdrawalAccount) {
      alert('Vous devez d\'abord configurer vos informations de retrait dans le Centre membre')
      router.push('/centre-membre/compte-retrait')
      return
    }

    // Vérifier le mot de passe des fonds
    if (!fundsPassword) {
      alert('Veuillez entrer votre mot de passe des fonds')
      return
    }

    // Validation du montant minimum
    const numericAmount = parseFloat(amount)
    if (numericAmount < 5000) {
      alert('Le montant minimum de retrait est de 5000 FCFA')
      return
    }

    // Vérifier le solde
    if (numericAmount > balance) {
      alert('Solde insuffisant pour effectuer ce retrait')
      return
    }

    setLoading(true)

    try {
      // Vérifier le mot de passe des fonds
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        const storedPasswordHash = data.fundsPassword?.hash
        const enteredPasswordHash = await hashPassword(fundsPassword)
        
        if (storedPasswordHash !== enteredPasswordHash) {
          alert('Mot de passe des fonds incorrect')
          setLoading(false)
          return
        }
      }

      // Créer la transaction dans Firestore
      const transactionData: CreateTransactionData = {
        type: 'withdrawal',
        amount: numericAmount,
        paymentMethod: paymentMethods[selectedPaymentMethod].value as 'orange' | 'mtn',
        phoneNumber: '693098877', // Utiliser le numéro fixe
        withdrawalAccount: withdrawalAccountInfo // Inclure les informations de retrait pour l'admin
      }

      await createTransaction(
        currentUser.uid,
        userData.numeroTel,
        transactionData
      )

      // Réinitialiser le formulaire
      setAmount('')
      setFundsPassword('')
      setSelectedPaymentMethod(0)
      
      alert('Demande de retrait soumise avec succès!')
      
      // Rediriger vers le portefeuille
      router.push('/portefeuille')
    } catch (error) {
      console.error('Erreur lors de la soumission du retrait:', error)
      alert('Erreur lors de la soumission du retrait. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 px-4 py-4 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-blue-500/20 animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-between">
          <NavigationLink href="/" className="hover:scale-110 transition-transform duration-200">
            <ArrowLeft className="text-white" size={18} />
          </NavigationLink>
          <div className="flex items-center">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-base">💸</span>
            </div>
            <h1 className="text-white text-base font-black tracking-wide drop-shadow-lg">Retrait</h1>
          </div>
          <div className="w-5"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Title & Balance */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-gray-800 mb-3">Retirer mes fonds</h1>
          <div className="bg-gradient-to-r from-blue-100 to-green-100 px-4 py-2 rounded-xl inline-block shadow-sm border border-white/50">
            <div className="flex items-center justify-center">
              <span className="text-lg mr-2">💰</span>
              <span className="text-gray-800 font-bold text-sm">Solde: {balance.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="mb-6">
          <h2 className="text-gray-800 font-black text-base mb-4 text-center">Formulaire de retrait</h2>
          
          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-gray-800 font-black text-sm mb-2">
              💰 Montant à retirer (FCFA)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Minimum 5,000 FCFA"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-3 border-2 border-blue-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-blue-50 bg-white shadow-sm font-medium text-base transition-all duration-300"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-4">
            <label className="block text-gray-800 font-black text-sm mb-2">
              📱 Mode de paiement
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPaymentMethod(index)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-[1.01] active:scale-[0.99] shadow-sm ${
                    selectedPaymentMethod === index
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-green-200'
                      : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {index === 0 && (
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                          <Image src="/org.png" alt="Orange Money" width={16} height={16} className="object-contain" />
                        </div>
                        <span className={`font-bold text-xs ${
                          selectedPaymentMethod === index ? 'text-green-700' : 'text-orange-600'
                        }`}>Orange Money</span>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-2">
                          <Image src="/mtn.png" alt="MTN Money" width={16} height={16} className="object-contain" />
                        </div>
                        <span className={`font-bold text-xs ${
                          selectedPaymentMethod === index ? 'text-green-700' : 'text-yellow-600'
                        }`}>MTN Money</span>
                      </div>
                    )}
                  </div>
                  {selectedPaymentMethod === index && (
                    <div className="flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Informations de retrait configurées */}
          {hasWithdrawalAccount && withdrawalAccountInfo && (
            <div className="mb-4">
              <label className="block text-gray-800 font-black text-sm mb-2">
                💳 Informations de retrait configurées
              </label>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="text-green-800 text-sm">
                  <div className="font-bold">{withdrawalAccountInfo.operator === 'bank' ? 'Compte bancaire' : 
                    withdrawalAccountInfo.operator === 'orange' ? 'Orange Money' :
                    withdrawalAccountInfo.operator === 'mtn' ? 'MTN Mobile Money' :
                    withdrawalAccountInfo.operator === 'moov' ? 'Moov Money' :
                    withdrawalAccountInfo.operator === 'wave' ? 'Wave' : withdrawalAccountInfo.operator}</div>
                  <div>Compte: {withdrawalAccountInfo.accountNumber}</div>
                  <div>Titulaire: {withdrawalAccountInfo.holderName}</div>
                </div>
              </div>
            </div>
          )}

          {/* Phone Number Display */}
          <div className="mb-6">
            <label className="block text-gray-800 font-black text-sm mb-2">
              📞 Numéro du destinataire
            </label>
            <div className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-800 font-medium text-base">
              693098877
            </div>
          </div>

          {/* Mot de passe des fonds */}
          <div className="mb-6">
            <label className="block text-gray-800 font-black text-sm mb-2">
              🔐 Mot de passe des fonds
            </label>
            {!hasConfiguredPassword ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm mb-2">Vous devez configurer un mot de passe des fonds</p>
                <button 
                  onClick={() => router.push('/centre-membre/mot-de-passe-fonds')}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  Configurer maintenant
                </button>
              </div>
            ) : (
              <input
                type="password"
                placeholder="Entrez votre mot de passe des fonds"
                value={fundsPassword}
                onChange={(e) => setFundsPassword(e.target.value)}
                className="w-full px-3 py-3 border-2 border-blue-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-blue-50 bg-white shadow-sm font-medium text-base transition-all duration-300"
              />
            )}
          </div>

          {/* Informations de retrait manquantes */}
          {!hasWithdrawalAccount && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm mb-2">Vous devez configurer vos informations de retrait</p>
                <button 
                  onClick={() => router.push('/centre-membre/compte-retrait')}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  Configurer maintenant
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={!amount || !hasConfiguredPassword || !fundsPassword || !hasWithdrawalAccount || loading}
            className={`w-full py-3 rounded-xl font-black text-sm transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg ${
              amount && hasConfiguredPassword && fundsPassword && hasWithdrawalAccount && !loading
                ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <span className="text-lg mr-2">💸</span>
                  Soumettre la demande
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
