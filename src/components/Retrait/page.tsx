'use client'
import Link from 'next/link'
import NavigationLink from '../NavigationLink/NavigationLink'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Eye, EyeOff, Wallet, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import { createTransaction, getUserBalance, subscribeToUserBalance } from '@/lib/transactions'
import { CreateTransactionData } from '@/types/transactions'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { subscribeToWithdrawableBalance } from '@/lib/balanceUtils'
import AnimatedBalance from '@/components/AnimatedBalance/AnimatedBalance'

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
  const [balance, setBalance] = useState(0) // Solde retirable uniquement
  const [depositBalance, setDepositBalance] = useState(0) // Solde de dépôt (non retirable)
  const [totalBalance, setTotalBalance] = useState(0) // Solde total
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
    },
    {
      name: 'Cryptomonnaie (USDT TRC20)',
      value: 'crypto',
      color: 'border-yellow-200 bg-yellow-50',
      selectedColor: 'border-yellow-500 bg-yellow-100'
    }
  ]

  // Charger le solde retirable de l'utilisateur
  useEffect(() => {
    if (currentUser) {
      // S'abonner aux changements de solde retirable en temps réel
      const unsubscribe = subscribeToWithdrawableBalance(
        currentUser.uid, 
        (withdrawable, deposit, total) => {
          setBalance(withdrawable) // Solde retirable uniquement
          setDepositBalance(deposit) // Solde de dépôt
          setTotalBalance(total) // Solde total
        }
      )

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

    // Validation du montant minimum selon le mode de paiement
    const numericAmount = parseFloat(amount)
    const isCrypto = paymentMethods[selectedPaymentMethod].value === 'crypto'
    const minAmount = isCrypto ? 5 : 2000 // 5 USDT ou 2000 FCFA
    
    if (numericAmount < minAmount) {
      alert(`Le montant minimum de retrait est de ${isCrypto ? '5 USDT' : '2000 FCFA'}`)
      return
    }

    // Vérifier le solde (le montant demandé doit être disponible, les frais sont déduits du montant)
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

      // Calculer les frais et le montant net
      const fees = numericAmount * 0.03
      const netAmount = numericAmount * 0.97

      // Créer la transaction dans Firestore
      const transactionData: CreateTransactionData = {
        type: 'withdrawal',
        amount: numericAmount, // Montant brut demandé
        paymentMethod: paymentMethods[selectedPaymentMethod].value as 'orange' | 'mtn' | 'crypto',
        phoneNumber: '693098877', // Utiliser le numéro fixe
        withdrawalAccount: withdrawalAccountInfo, // Inclure les informations de retrait pour l'admin
        fees: fees, // Frais de retrait (3%)
        netAmount: netAmount, // Montant net à recevoir
        description: `Retrait ${paymentMethods[selectedPaymentMethod].name} - Frais: ${fees.toLocaleString()} ${isCrypto ? 'USDT' : 'FCFA'} (3%)`
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95">
                <ArrowLeft size={18} className="text-white" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center relative animate-pulse overflow-hidden">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <Image src="/ponyAI.png" alt="PONY AI" width={40} height={40} className="object-cover w-full h-full rounded-full" unoptimized />
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PONY</h1>
                <p className="text-white/60 text-xs">Retrait</p>
              </div>
            </div>
            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
              <Bell size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Title & Balance */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-4">Retirer mes fonds</h1>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 inline-block">
            <div className="flex items-center justify-center">
              <span className="text-lg mr-2">💰</span>
              <span className="text-white font-bold text-sm">
                Solde: <AnimatedBalance value={balance} suffix=" FCFA" className="inline" />
              </span>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-6 text-center">Formulaire de retrait</h2>
          
          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-white/70 font-medium text-sm mb-2">
              💰 Montant à retirer {paymentMethods[selectedPaymentMethod].value === 'crypto' ? '(USDT)' : '(FCFA)'}
            </label>
            <input
              type="text"
              placeholder={paymentMethods[selectedPaymentMethod].value === 'crypto' ? 'Minimum 5 USDT' : 'Minimum 2,000 FCFA'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all duration-300"
            />
            
            {/* Calcul des frais et montant réel */}
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-3 p-3 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-xl">
                <div className="text-orange-300 text-sm font-semibold mb-2">💳 Détails du retrait</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span>Montant demandé:</span>
                    <span>{parseFloat(amount).toLocaleString()} {paymentMethods[selectedPaymentMethod].value === 'crypto' ? 'USDT' : 'FCFA'}</span>
                  </div>
                  <div className="flex justify-between text-orange-300">
                    <span>Frais de retrait (3%):</span>
                    <span>-{(parseFloat(amount) * 0.03).toLocaleString()} {paymentMethods[selectedPaymentMethod].value === 'crypto' ? 'USDT' : 'FCFA'}</span>
                  </div>
                  <div className="border-t border-orange-400/30 pt-1 mt-2">
                    <div className="flex justify-between text-green-300 font-bold">
                      <span>Montant réel à recevoir:</span>
                      <span>{(parseFloat(amount) * 0.97).toLocaleString()} {paymentMethods[selectedPaymentMethod].value === 'crypto' ? 'USDT' : 'FCFA'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-white/70 font-medium text-sm mb-3">
              📱 Mode de paiement
            </label>
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPaymentMethod(index)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105 active:scale-95 ${
                    selectedPaymentMethod === index
                      ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm shadow-xl'
                      : 'border-white/20 bg-black/30 backdrop-blur-sm hover:border-purple-300 hover:bg-black/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {index === 0 && (
                        <>
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3 border border-orange-400/50 shadow-lg">
                            <Image src="/org.png" alt="Orange Money" width={20} height={20} className="object-contain" />
                          </div>
                          <span className="font-bold text-sm text-white">Orange Money</span>
                        </>
                      )}
                      {index === 1 && (
                        <>
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-3 border border-yellow-400/50 shadow-lg">
                            <Image src="/mtn.png" alt="MTN Money" width={20} height={20} className="object-contain" />
                          </div>
                          <span className="font-bold text-sm text-white">MTN Money</span>
                        </>
                      )}
                      {index === 2 && (
                        <>
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center mr-3 border border-yellow-400/50 shadow-lg">
                            <div className="text-yellow-900 text-lg font-bold">₿</div>
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white block">Cryptomonnaie (USDT TRC20)</span>
                            <span className="text-xs text-white/60">1 USDT = 600 FCFA</span>
                          </div>
                        </>
                      )}
                    </div>
                    {selectedPaymentMethod === index && (
                      <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Information taux de change crypto */}
          {paymentMethods[selectedPaymentMethod].value === 'crypto' && (
            <div className="mb-6">
              <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <div className="text-yellow-400 text-lg mr-2">ℹ️</div>
                  <span className="text-yellow-300 font-bold text-sm">Taux de change</span>
                </div>
                <p className="text-yellow-200 text-sm">
                  1 USDT = 600 FCFA
                </p>
                {amount && (
                  <p className="text-yellow-200 text-xs mt-1">
                    {amount} USDT ≈ {(parseFloat(amount) * 600).toLocaleString()} FCFA
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Informations de retrait configurées */}
          {hasWithdrawalAccount && withdrawalAccountInfo && (
            <div className="mb-6">
              <label className="block text-white/70 font-medium text-sm mb-2">
                💳 Informations de retrait configurées
              </label>
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="text-green-400 text-sm">
                  <div className="font-bold">{withdrawalAccountInfo.operator === 'bank' ? 'Compte bancaire' : 
                    withdrawalAccountInfo.operator === 'orange' ? 'Orange Money' :
                    withdrawalAccountInfo.operator === 'mtn' ? 'MTN Mobile Money' :
                    withdrawalAccountInfo.operator === 'moov' ? 'Moov Money' :
                    withdrawalAccountInfo.operator === 'wave' ? 'Wave' : withdrawalAccountInfo.operator}</div>
                  <div className="text-white/70">Compte: {withdrawalAccountInfo.accountNumber}</div>
                  <div className="text-white/70">Titulaire: {withdrawalAccountInfo.holderName}</div>
                </div>
              </div>
            </div>
          )}

          {/* Phone Number Display */}
          <div className="mb-6">
            <label className="block text-white/70 font-medium text-sm mb-2">
              📞 Numéro du destinataire
            </label>
            <div className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl text-white font-medium text-base">
              693098877
            </div>
          </div>

          {/* Mot de passe des fonds */}
          <div className="mb-6">
            <label className="block text-white/70 font-medium text-sm mb-2">
              🔐 Mot de passe des fonds
            </label>
            {!hasConfiguredPassword ? (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-4">
                <p className="text-red-300 text-sm mb-3">Vous devez configurer un mot de passe des fonds</p>
                <button 
                  onClick={() => router.push('/centre-membre/mot-de-passe-fonds')}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
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
                className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all duration-300"
              />
            )}
          </div>

          {/* Informations de retrait manquantes */}
          {!hasWithdrawalAccount && (
            <div className="mb-6">
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-4">
                <p className="text-red-300 text-sm mb-3">Vous devez configurer vos informations de retrait</p>
                <button 
                  onClick={() => router.push('/centre-membre/compte-retrait')}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
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
            className={`w-full py-4 rounded-xl font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg ${
              amount && hasConfiguredPassword && fundsPassword && hasWithdrawalAccount && !loading
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
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
      </main>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
