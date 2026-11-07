# PayFor — Intégration MTN MoMo Remittance

**Date de validation :** 7 septembre 2026  
**Projet :** PayFor  
**Backend :** FastAPI  
**Paiement entrant :** Stripe  
**Payout :** MTN Mobile Money Remittance  
**Environnement validé :** MTN Global Sandbox

---

## 1. Objectif

L'objectif est d'automatiser le payout Mobile Money après réception d'un paiement Stripe.

```text
Payer → Stripe → PayFor → PaymentRequest = PAID → MomoPayoutTask → MTN Remittance → Bénéficiaire
```

Le système manuel avec un agent PayFor reste disponible comme fallback.

## 2. Architecture

`MomoPayoutTask` supporte désormais deux modes :

- `manual`
- `mtn_remittance`

Le champ `payout_provider` distingue les deux méthodes.

## 3. Configuration sandbox MTN

```env
MTN_REMITTANCE_ENABLED=true
MTN_REMITTANCE_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_REMITTANCE_TARGET_ENVIRONMENT=sandbox
MTN_REMITTANCE_CURRENCY=EUR
MTN_REMITTANCE_API_USER=<SECRET>
MTN_REMITTANCE_API_KEY=<SECRET>
MTN_REMITTANCE_SUBSCRIPTION_KEY=<SECRET>
MTN_REMITTANCE_CALLBACK_URL=
```

Ne jamais commiter les secrets, access tokens ou JWT. `.env` doit rester dans `.gitignore`.

## 4. Provisioning MTN Sandbox

Le provisioning fonctionnel a été réalisé sur :

```text
https://sandbox.momodeveloper.mtn.com
```

### API User

```http
POST /v1_0/apiuser
```

Un UUID v4 est utilisé comme `X-Reference-Id` :

```powershell
$ref = [guid]::NewGuid().ToString()
```

Résultat validé : `201 Created`. L'UUID devient `MTN_REMITTANCE_API_USER`.

### API Key

```http
POST /v1_0/apiuser/{api_user}/apikey
```

La réponse fournit `apiKey`, conservée dans `MTN_REMITTANCE_API_KEY`.

## 5. Authentification Remittance

```http
POST /remittance/token/
```

Headers :

```text
Authorization: Basic base64(api_user:api_key)
Ocp-Apim-Subscription-Key: <SECRET>
```

Test réussi :

```text
token_type = access_token
expires_in = 3600
```

L'authentification MTN Remittance du sandbox global est donc fonctionnelle.

## 6. Service FastAPI

Service créé :

```text
app/services/mtn_remittance.py
```

Méthodes principales :

```python
get_access_token()
transfer()
get_transfer_status()
```

Le service utilise `httpx`.

```powershell
pip install httpx
```

## 7. Modèle `MomoPayoutTask`

Champs MTN ajoutés via migration Alembic :

```text
payout_provider
mtn_reference_id
mtn_external_id
mtn_status
mtn_reason
mtn_financial_transaction_id
mtn_submitted_at
mtn_completed_at
```

`mtn_reference_id` correspond au `X-Reference-Id` envoyé à MTN. `mtn_external_id` contient la référence PayFor, par exemple `PF-2026-000016`.

Statuts techniques utilisés/prévus :

```text
SUBMITTING
SUBMITTED
SUCCESSFUL
FAILED
REJECTED
CONFIG_ERROR
SUBMISSION_FAILED
SUBMISSION_ERROR
```

## 8. Endpoint d'envoi MTN

```http
POST /admin/momo-tasks/{task_id}/send-via-mtn
```

Il vérifie notamment : droits admin, activation MTN, existence de la tâche et du PaymentRequest, `TO_PAY_MOMO`, paiement `PAID`, et absence d'une soumission MTN précédente.

Avant l'appel externe, PayFor persiste :

```text
payout_provider = mtn_remittance
mtn_reference_id = <UUID>
mtn_external_id = <PayFor reference>
mtn_status = SUBMITTING
mtn_submitted_at = ...
```

Cela protège l'idempotence et conserve la référence en cas de panne après acceptation MTN.

## 9. Requête MTN Transfer

```http
POST /remittance/v1_0/transfer
```

Headers :

```http
Authorization: Bearer <ACCESS_TOKEN>
Ocp-Apim-Subscription-Key: <SECRET>
X-Reference-Id: <UUID>
X-Target-Environment: sandbox
Content-Type: application/json
```

Payload du test réussi :

```json
{
  "amount": "100.00",
  "currency": "EUR",
  "externalId": "PF-2026-000016",
  "payee": {
    "partyIdType": "MSISDN",
    "partyId": "123456789012"
  },
  "payerMessage": "PayFor payment",
  "payeeNote": "PayFor payout 28"
}
```

Paramètres sandbox validés : `EUR`, `100.00`, MSISDN `123456789012`, target environment `sandbox`.

Les montants RWF réels ne doivent pas être copiés directement en EUR. La conversion, le settlement et le financement du wallet seront traités séparément pour la production.

## 10. Premier transfert accepté

Task : `15`  
Référence PayFor : `PF-2026-000016`  
MTN Reference ID : `cf90c1d5-bdf2-4835-a92e-5b793b90172c`

Réponse PayFor :

```json
{
  "ok": true,
  "task_id": 15,
  "payout_provider": "mtn_remittance",
  "mtn_reference_id": "cf90c1d5-bdf2-4835-a92e-5b793b90172c",
  "mtn_external_id": "PF-2026-000016",
  "mtn_status": "SUBMITTED",
  "mtn_http_status": 202,
  "mtn_amount": "100.00",
  "mtn_currency": "EUR",
  "payee_msisdn": "123456789012",
  "mtn_submitted_at": "2026-09-07T12:16:47.312294-04:00"
}
```

`mtn_http_status = 202` confirme que MTN a accepté le transfert.

## 11. Vérification du statut

Endpoint PayFor :

```http
POST /admin/momo-tasks/{task_id}/refresh-mtn-status
```

PayFor appelle :

```http
GET /remittance/v1_0/transfer/{referenceId}
```

## 12. Premier transfert `SUCCESSFUL`

La task 15 a retourné :

```text
mtn_status = SUCCESSFUL
mtn_financial_transaction_id = 28270780
```

Réponse MTN :

```json
{
  "amount": "100",
  "currency": "EUR",
  "financialTransactionId": "28270780",
  "externalId": "PF-2026-000016",
  "payee": {
    "partyIdType": "MSISDN",
    "partyId": "123456789012"
  },
  "payerMessage": "PayFor payment",
  "payeeNote": "PayFor payout 28",
  "status": "SUCCESSFUL"
}
```

Soumis : `2026-09-07T12:16:47.312294-04:00`  
Confirmé : `2026-09-07T12:19:07.609560-04:00`

## 13. Problèmes rencontrés

- Provisioning sur le domaine Rwanda : erreurs `404` / `500`.
- Postman : réponse HTML `Request Rejected`; PowerShell a permis de poursuivre.
- MTN désactivé : correction avec `MTN_REMITTANCE_ENABLED=true`.
- Subscription Key manquante : `CONFIG_ERROR`, puis configuration corrigée.
- Premier transfert : HTTP `400` avec réponse vide.
- Test final avec `EUR`, `100.00` et `123456789012` : `202 Accepted`, puis `SUCCESSFUL`.

## 14. Flux validé

```text
Payer
  ↓
Stripe Checkout
  ↓
Stripe Webhook
  ↓
PaymentRequest = PAID
  ↓
MomoPayoutTask = TO_PAY_MOMO
  ↓
PayFor /send-via-mtn
  ↓
MTN access token
  ↓
MTN /transfer
  ↓
202 Accepted
  ↓
mtn_status = SUBMITTED
  ↓
PayFor /refresh-mtn-status
  ↓
MTN GET /transfer/{referenceId}
  ↓
SUCCESSFUL
  ↓
financialTransactionId sauvegardé
```

Résultat :

```text
Stripe → PayFor → MTN Remittance → SUCCESSFUL
```

## 15. Flow manuel conservé

```text
PaymentRequest = PAID
  ↓
MomoPayoutTask = TO_PAY_MOMO
  ↓
Agent PayFor
  ↓
Agent envoie Mobile Money
  ↓
MOMO_SENT_BY_AGENT
  ↓
Code bénéficiaire
  ↓
Confirmation
  ↓
MOMO_RECEIVED_CONFIRMED
  ↓
FULFILLED
```

Ce flow reste le fallback si MTN API n'est pas disponible.

## 16. Vérification bénéficiaire

PayFor possède déjà un code de vérification du type :

```text
PF-XXXXXX
```

Le backend connaît le code, le bénéficiaire le reçoit et le marchand le soumet à PayFor. La valeur attendue ne doit jamais être exposée dans les API admin/agent.

Le flow peut évoluer vers `BENEFICIARY_CODE_SENT`, puis `FULFILLED` après validation.

## 17. Prochaine étape

Brancher automatiquement :

```text
MTN SUCCESSFUL
  ↓
confirmation du payout
  ↓
génération beneficiary_code
  ↓
envoi au bénéficiaire
  ↓
PaymentRequest = BENEFICIARY_CODE_SENT
  ↓
le bénéficiaire présente le code au marchand
  ↓
le marchand soumet le code
  ↓
PaymentRequest = FULFILLED
```

## 18. Automatisation future

À prévoir :

- soumission MTN automatique après Stripe `PAID` ;
- worker/queue plutôt qu'un appel externe fragile directement dans le webhook Stripe ;
- callback MTN et/ou polling automatique ;
- retries contrôlés et idempotence robuste ;
- fallback manuel ;
- audit/logging et monitoring ;
- interface admin MTN améliorée ;
- tests automatisés.

## 19. Production Rwanda

Le sandbox est validé, mais la production nécessitera notamment :

- exigences KYC/contractuelles MTN ;
- credentials live ;
- compte/wallet de production ;
- environnement cible live ;
- devise et règles de settlement ;
- financement du wallet ;
- stratégie de change ;
- callbacks et tests de production contrôlés.

Les credentials sandbox ne doivent pas être utilisés en production.

## 20. Sécurité

Ne jamais exposer ou commiter :

```text
MTN_REMITTANCE_API_KEY
MTN_REMITTANCE_SUBSCRIPTION_KEY
MTN access_token
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
JWT_SECRET
JWT utilisateur/admin
```

Les JWT copiés depuis Swagger/cURL et partagés doivent être considérés comme exposés et renouvelés.

Le `beneficiary_code` attendu ne doit jamais être retourné au marchand, au payer ou à l'agent.

## 21. État au 7 septembre 2026

### Validé

- Stripe Checkout et webhook local
- `PaymentRequest = PAID`
- création `MomoPayoutTask`
- flow manuel existant
- provisioning MTN Global Sandbox
- API User et API Key
- authentification Remittance
- access token
- devise sandbox EUR
- `POST /remittance/v1_0/transfer`
- `202 Accepted`
- stockage `mtn_reference_id` / `mtn_external_id`
- `GET /remittance/v1_0/transfer/{referenceId}`
- statut `SUCCESSFUL`
- stockage `financialTransactionId`
- timestamps MTN
- fallback manuel conservé

### À faire

- `SUCCESSFUL → beneficiary code`
- suivi automatique/callback MTN
- soumission automatique progressive
- retries/idempotence renforcés
- tests automatisés
- UI admin MTN
- préparation production Rwanda
- funding/settlement/change
- monitoring et alertes

## 22. Résultat final de cette phase

Le 7 septembre 2026, PayFor a réussi son premier transfert via MTN MoMo Remittance Sandbox.

```text
PayFor reference: PF-2026-000016
MTN Reference ID: cf90c1d5-bdf2-4835-a92e-5b793b90172c
MTN Financial Transaction ID: 28270780
Status: SUCCESSFUL
```

**Conclusion : l'intégration technique de base PayFor → MTN Remittance Sandbox est fonctionnelle.**

La prochaine phase consiste à connecter automatiquement le succès MTN au mécanisme de vérification du bénéficiaire déjà existant dans PayFor.
