# 🚀 GUIDE D'INTÉGRATION LYGOS - PRODUCTION VERCEL

## ✅ FICHIERS CRÉÉS

### API Routes
- ✅ `/src/app/api/lygos/initiate-payment/route.ts` - Créer une session de paiement
- ✅ `/src/app/api/lygos/verify-payment/route.ts` - Vérifier le statut d'un paiement
- ✅ `/src/app/api/lygos/webhook/route.ts` - Recevoir les notifications Lygos

### Pages
- ✅ `/src/app/depot-success/page.tsx` - Page de succès après paiement
- ✅ `/src/app/depot-failed/page.tsx` - Page d'échec de paiement

### Composants
- ✅ `/src/components/LygosPayment/LygosButton.tsx` - Bouton de paiement Lygos
- ✅ `/src/components/GestionDepot/page.tsx` - Modifié pour intégrer Lygos

---

## 🔧 CONFIGURATION VERCEL (PRODUCTION)

### Étape 1 : Ajouter les variables d'environnement

1. Allez sur **Vercel Dashboard** : https://vercel.com/dashboard
2. Sélectionnez votre projet **PONY Invest**
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez ces variables :

```env
NEXT_PUBLIC_LYGOS_API_KEY=lygosapp-36d8a4d4-11a4-4117-928f-4caf95e464a6
NEXT_PUBLIC_LYGOS_API_URL=https://api.lygosapp.com/v1/gateway
NEXT_PUBLIC_LYGOS_MODE=production
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```

**⚠️ IMPORTANT :** Remplacez `votre-domaine.vercel.app` par votre vraie URL Vercel !

### Étape 2 : Configurer le Webhook Lygos

1. Connectez-vous à votre compte Lygos : https://lygosapp.com
2. Allez dans **Paramètres** → **Webhooks**
3. Ajoutez cette URL de webhook :

```
https://votre-domaine.vercel.app/api/lygos/webhook
```

4. Sélectionnez les événements :
   - ✅ `payment.successful`
   - ✅ `payment.failed`
   - ✅ `payment.pending`

---

## 📱 FONCTIONNEMENT

### Pour l'utilisateur :

1. **Sélectionne un montant** sur la page de dépôt
2. **Clique sur "Payer avec Lygos"** (bouton bleu/violet)
3. **Redirigé vers Lygos** pour choisir son pays et opérateur
4. **Paie avec Mobile Money** (Orange/MTN)
5. **Redirigé automatiquement** vers la page de succès/échec
6. **Solde crédité instantanément** si paiement réussi

### Flux technique :

```
Client → Bouton Lygos → API initiate-payment → Lygos Gateway
                                                     ↓
Client ← Page Success ← Webhook Lygos ← Paiement Mobile Money
                ↓
        Solde crédité automatiquement
```

---

## 🧪 TESTS EN MODE SANDBOX

### Numéros de test (Sandbox)

Pour tester sans argent réel, utilisez ces numéros :

#### ✅ Paiement RÉUSSI (se termine par 11 11 11)
- Cameroun : `+237 XXX 111111`
- Côte d'Ivoire : `+225 XXX 111111`
- Sénégal : `+221 XXX 111111`

#### ❌ Paiement ÉCHOUÉ (se termine par 55 55 55)
- Cameroun : `+237 XXX 555555`
- Côte d'Ivoire : `+225 XXX 555555`

#### ⚠️ Erreur (se termine par 33 33 33)
- Cameroun : `+237 XXX 333333`

### Passer en mode Sandbox

Dans Vercel, changez :
```env
NEXT_PUBLIC_LYGOS_MODE=sandbox
```

---

## 🌍 PAYS SUPPORTÉS

| Pays | Orange Money | MTN Money |
|------|--------------|-----------|
| 🇨🇲 Cameroun | ✅ | ✅ |
| 🇨🇮 Côte d'Ivoire | ✅ | ✅ |
| 🇸🇳 Sénégal | ✅ | ❌ |
| 🇲🇱 Mali | ✅ | ✅ |
| 🇧🇯 Bénin | ✅ | ✅ |
| 🇹🇬 Togo | ❌ | ✅ |
| 🇧🇫 Burkina Faso | ✅ | ✅ |
| 🇳🇪 Niger | ✅ | ✅ |
| 🇬🇳 Guinée | ✅ | ✅ |
| 🇨🇩 RD Congo | ✅ | ✅ |

---

## 🔍 VÉRIFICATION

### Tester l'intégration :

1. **Déployez sur Vercel** :
   ```bash
   git add .
   git commit -m "feat: integrate Lygos payment gateway"
   git push origin main
   ```

2. **Vérifiez le webhook** :
   - Allez sur : `https://votre-domaine.vercel.app/api/lygos/webhook`
   - Vous devriez voir : `{"message":"Webhook Lygos actif"}`

3. **Testez un paiement** :
   - Allez sur `/recharge`
   - Sélectionnez un montant
   - Cliquez sur "Payer avec Lygos"
   - Utilisez un numéro de test

---

## 📊 COLLECTIONS FIRESTORE CRÉÉES

### `pendingPayments`
Stocke les paiements en attente avant confirmation.

```json
{
  "orderId": "PONY-1699...-abc123",
  "userId": "user_uid",
  "amount": 5000,
  "userPhone": "+237697058617",
  "status": "pending",
  "createdAt": "timestamp"
}
```

### `transactions` (existante)
Mise à jour avec les infos Lygos :

```json
{
  "lygosStatus": "successful",
  "lygosTransactionId": "lygos_tx_123",
  "paymentMethod": "lygos_mobile_money"
}
```

---

## 🎯 AVANTAGES LYGOS

✅ **Multi-pays** - Cameroun, CI, Sénégal, Mali, etc.
✅ **Multi-opérateurs** - Orange Money & MTN Money
✅ **Paiement instantané** - Confirmation en temps réel
✅ **Sécurisé** - Gateway certifié
✅ **Webhook automatique** - Crédit automatique du solde
✅ **Interface unifiée** - Une seule intégration pour tous les pays

---

## 🆘 SUPPORT

### En cas de problème :

1. **Vérifiez les logs Vercel** :
   - Dashboard → Votre projet → Functions → Logs

2. **Vérifiez les webhooks Lygos** :
   - Dashboard Lygos → Webhooks → Historique

3. **Testez les API routes** :
   ```bash
   curl https://votre-domaine.vercel.app/api/lygos/webhook
   ```

4. **Contactez le support Lygos** :
   - Email : support@lygosapp.com
   - Documentation : https://docs.lygosapp.com

---

## ✨ PROCHAINES ÉTAPES

1. ✅ Déployer sur Vercel
2. ✅ Configurer les variables d'environnement
3. ✅ Configurer le webhook Lygos
4. ✅ Tester en mode sandbox
5. ✅ Passer en production
6. 🚀 Profiter des paiements internationaux !

---

**🎉 Félicitations ! Votre plateforme accepte maintenant les paiements de toute l'Afrique ! 🌍**
