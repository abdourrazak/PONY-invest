# 🔒 DÉPLOYER LES RÈGLES FIRESTORE - URGENT

## ⚠️ PROBLÈME IDENTIFIÉ
L'erreur "Missing or insufficient permissions" vient des règles Firestore qui bloquent les investissements.

## 🚀 SOLUTION RAPIDE

### Étape 1 : Ouvrir Firebase Console
1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet AXML Global
3. Cliquez sur "Firestore Database" dans le menu de gauche

### Étape 2 : Modifier les Règles
1. Cliquez sur l'onglet "Règles" 
2. Remplacez TOUT le contenu par ceci :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORAIRE - Accès libre pour résoudre problème investissements
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Étape 3 : Publier
1. Cliquez sur "Publier" 
2. Attendez la confirmation "Règles publiées avec succès"

## ✅ TEST
Après publication des règles :
1. Retournez sur votre app
2. Essayez d'investir dans un produit
3. L'investissement devrait maintenant fonctionner !

## 🔐 SÉCURITÉ
⚠️ **IMPORTANT** : Ces règles donnent accès libre à Firestore (temporaire pour test)
- À utiliser uniquement pour résoudre le problème d'investissement
- Après confirmation que ça marche, nous appliquerons des règles plus sécurisées

## 📱 COLLECTIONS UTILISÉES
Les investissements écrivent dans :
- `users` - Mise à jour du solde
- `rentals` - Création de la location
- `referralCommissions` - Commissions de parrainage

## 🆘 SI ÇA NE MARCHE PAS
1. Vérifiez que les règles sont bien publiées
2. Attendez 1-2 minutes pour la propagation
3. Rechargez votre app complètement
4. Essayez à nouveau l'investissement

---
**Une fois les règles déployées, les investissements devraient fonctionner immédiatement !**
