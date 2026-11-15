# DropAffy

Réseau commercial digital d'Afrique de l'Ouest. Les membres se découvrent par leurs publications (offres et recherches). Pas d'annuaire, pas d'ajout d'amis.

## Structure du dépôt (tous les fichiers à la racine)

| Pour modifier… | Fichier |
|---|---|
| Couleurs, tailles, design (membre + équipe) | `style.css` |
| Styles propres à l'espace équipe | `admin.css` |
| Connexion Supabase et petits outils partagés | `lib.js` |
| État, en-tête, navigation, animations (membre) | `ui.js` |
| Connexion, inscription, redirection de l'équipe | `auth.js` |
| Accueil, cartes, recherche, fiche publication, questions | `home.js` |
| Publier, photos | `publish.js` |
| Contacts, demandes, WhatsApp | `contacts.js` |
| Messagerie | `messages.js` |
| Activité, mes publications, portefeuille | `activity.js` |
| Profil, installation | `profile.js` |
| Notifications et push | `notifications.js` |
| Démarrage de l'application | `app.js` |
| Page de l'application membre | `index.html` |
| Espace équipe (page, accès, onglets) | `admin.html`, `admin.js` |
| Équipe : publications, paiements, rôles, journal, analyses | `admin-pubs.js`, `admin-pay.js`, `admin-team.js`, `admin-analysis.js` |
| Notifications push, installation | `push.js`, `sw.js`, `manifest.webmanifest`, icônes |

L'ordre de chargement des scripts est dans `index.html` et `admin.html`. L'espace équipe n'utilise aucun fichier de l'application membre, seulement `lib.js` et `style.css`.

## Règles métier
- Publications visibles **48 h** après validation (bouton Actualiser avant expiration). Toute modification de contenu repasse en validation.
- Les **5 mises en contact** sont comptées pour le membre (annonceur), toutes publications confondues. 100 FCFA débloquent 5 nouvelles mises en contact, après confirmation manuelle du paiement par l'équipe.
- Une demande de contact sans réponse disparaît après 48 h. Une fois approuvée, le demandeur accède au WhatsApp de l'annonceur.
- Messages supprimés après 48 h.

## Rôles de l'équipe (table `admins`)
`owner` (tous les droits) · `moderator` (valide les publications) · `finance` (paiements) · `support` (consultation seule). Les droits sont appliqués par le serveur (politiques RLS et fonctions), pas seulement par l'interface. Les membres de l'équipe sont redirigés vers `admin.html` à la connexion (lien « Application » pour revenir : `index.html?app=1`).

## Base de données (Supabase) : à compléter
Tables : profiles, profile_private, offers, searches, interests, contact_requests, conversations, messages, notifications, contact_quotas, payments, payment_transactions, profile_views, publication_exchanges, push_subscriptions, push_config, admins, admin_audit, match_analyses, match_results.
Fonctions principales : respond_contact_request, start_conversation, get_whatsapp, refresh_publication, ask_exchange, answer_exchange, confirm_payment, admin_confirm_payment, admin_reject_payment, admin_list_team, admin_list_members, admin_add_member, admin_set_role, admin_remove_member, admin_audit_list, admin_my_role, send_test_push.
