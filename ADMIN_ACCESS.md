# Accès Interface Admin - AXML Global

## 🔐 URL d'accès sécurisée

L'interface d'administration est accessible via une route sécurisée unique :

**Production:** `https://axml-global.vercel.app/admin-x7k9m2p4`
**Local:** `http://localhost:3000/admin-x7k9m2p4`

⚠️ **IMPORTANT:** Cette URL doit rester confidentielle et ne pas être partagée publiquement.

## 🛡️ Configuration d'un compte administrateur

Pour accéder à l'interface admin, un utilisateur doit avoir le rôle `admin` dans Firestore.

### Étapes pour créer un admin :

1. **Créer un compte utilisateur normal** via l'inscription sur l'application
2. **Accéder à la console Firebase** : https://console.firebase.google.com/
3. **Naviguer vers Firestore Database**
4. **Trouver la collection `users`**
5. **Localiser l'utilisateur par son numéro de téléphone**
6. **Ajouter le champ `role`** avec la valeur `admin`

### Structure du document utilisateur admin :
```json
{
  "uid": "...",
  "numeroTel": "+237697058617",
  "referralCode": "...",
  "createdAt": "...",
  "role": "admin",  // ← Champ requis pour l'accès admin
  "balance": 0
}
```

## 🚀 Fonctionnalités de l'interface admin

L'interface admin permet de :

- **Visualiser toutes les transactions** (dépôts et retraits)
- **Filtrer les transactions** par statut (en attente, approuvées, rejetées)
- **Approuver ou rejeter** les transactions en attente
- **Voir les statistiques** globales (totaux, compteurs)
- **Consulter les preuves** de transaction (images)
- **Mise à jour automatique** des soldes utilisateurs lors de l'approbation

## 📊 Workflow des transactions

1. **Utilisateur soumet** une transaction (dépôt/retrait)
2. Transaction créée avec statut `pending`
3. **Admin examine** la transaction dans le dashboard
4. **Admin approuve** → statut `success` + mise à jour du solde
5. **Admin rejette** → statut `rejected` (pas de mise à jour du solde)

## 🔒 Sécurité

### Protections mises en place :

1. **URL unique et difficile à deviner** (`admin-x7k9m2p4`)
2. **Vérification du rôle** côté client et serveur
3. **Règles Firestore** restrictives :
   - Seuls les admins peuvent modifier les transactions
   - Les utilisateurs ne peuvent créer que des transactions `pending`
   - Protection contre la modification du solde par les utilisateurs
4. **Authentification Firebase** requise

### Règles Firestore appliquées :

- ✅ Utilisateurs peuvent lire leurs propres données
- ✅ Admins peuvent lire toutes les données
- ✅ Seuls les admins peuvent valider/rejeter les transactions
- ✅ Les soldes sont protégés contre les modifications directes
- ✅ Les rôles utilisateurs sont protégés

## 📝 Notes importantes

- Le premier admin doit être configuré manuellement via Firebase Console
- Les admins suivants peuvent être ajoutés de la même manière
- L'URL d'administration ne doit pas être indexée par les moteurs de recherche
- Toujours vérifier les preuves de transaction avant approbation
- Les transactions approuvées sont irréversibles

## 🆘 Support

En cas de problème d'accès ou de configuration, vérifier :

1. L'utilisateur est bien connecté
2. Le champ `role: "admin"` est présent dans Firestore
3. Les règles Firestore sont bien déployées
4. Le cache du navigateur (essayer en navigation privée)

---

**Dernière mise à jour:** Décembre 2024
**Version:** 1.0.0
