# SECURITY SPECIFICATION: KILL 2 WIN FIRESTORE RULES

This document defines the zero-trust data invariants, security boundaries, and the "Dirty Dozen" exploit payloads designed to breach the system's identity, integrity, and financial ledgers.

---

## 1. Zero-Trust Data Invariants

1. **Identity Isolation (PII)**: A user's email, phone, and wallet information belong strictly to them. No user can read or write any other user's record in the `users` collection.
2. **Financially Sealed Ledgers**: Standard users are strictly forbidden from altering `walletBalance` or `bonusAmount` outside of atomic transaction audits. Direct client-side updates to financial fields inside their own profiles or other profiles are blocked.
3. **Admin Privilege Separation**: The `isAdmin()` role can only be assigned by a pre-configured database admin node in the `/admins/` document collection. Standard users cannot declare themselves as admins or create admin documents.
4. **Transaction Integrity**: Standard users can only create `transactions` for themselves (where `incoming().uid == request.auth.uid`). Once created, a standard user cannot modify (`update`) or delete (`delete`) any transaction document. Financial approvals/rejections (`approved`, `rejected`) can only be performed by the verified administration desk (`isAdmin()`).
5. **Match Slot Booking**: Standard users can read matches. Standard users cannot alter match configurations (like standard `perKill`, `prizePool`, `entryFee`, etc.). They can only participate in standard "Join" actions which append their `uid` to `joinedUsers`, subject to fee deductions.
6. **Read-Only App Assets**: `games`, `banners`, and `notifications` are globally readable by signed-in clients but strictly read-only. Standard users have zero write permissions. They are managed strictly by verified administrators.

---

## 2. The "Dirty Dozen" Exploit Payloads

Here are 12 malicious payloads and query plans designed to hijack, spoof, or deplete the system resources:

### Exploit 1: Financial Balance Elevation (Privilege Escalation)
*   **Target Path**: `users/attacker_uid` (Primary profile document)
*   **Attack Action**: `UPDATE`
*   **Payload**:
    ```json
    {
      "uid": "attacker_uid",
      "username": "ZeroHacker",
      "email": "attacker@gmail.com",
      "phone": "9999999999",
      "walletBalance": 1000000.00,
      "bonusAmount": 50000.00,
      "joinedMatches": [],
      "completedMatches": []
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED` (Direct balance tampering must fail)

### Exploit 2: Cross-User Profile Read (PII Data Breach)
*   **Target Path**: `users/rohan_123` (Target user profile)
*   **Attack Action**: `GET` (Read as `attacker_uid`)
*   **Expected Behavior**: `PERMISSION_DENIED` (Reading other users' records must fail)

### Exploit 3: Self-Assigned Administrative Privileges (Identity Spoofing)
*   **Target Path**: `admins/attacker_uid`
*   **Attack Action**: `CREATE`
*   **Payload**:
    ```json
    {
      "uid": "attacker_uid",
      "level": "superuser"
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED` (Direct administrative self-promotion must fail)

### Exploit 4: Sibling Transaction Hijack
*   **Target Path**: `transactions/txn_789`
*   **Attack Action**: `CREATE` (With spoofed user ID)
*   **Payload**:
    ```json
    {
      "id": "txn_789",
      "uid": "victim_uid",
      "amount": 5000,
      "type": "deposit",
      "status": "success",
      "createdAt": "2026-05-27T20:30:00Z"
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED` (A user can only submit transactions on their own behalf)

### Exploit 5: Self-Approval of Pending Withdrawal (Financial Theft)
*   **Target Path**: `transactions/my_withdrawal_1`
*   **Attack Action**: `UPDATE`
*   **Payload**:
    ```json
    {
      "id": "my_withdrawal_1",
      "uid": "attacker_uid",
      "amount": 2500,
      "type": "withdrawal",
      "status": "approved",
      "createdAt": "2026-05-27T20:00:00Z"
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED` (Only administrators can modify/approve transaction states)

### Exploit 6: Unauthorized Match Fee Reduction (Metadata Tampering)
*   **Target Path**: `matches/free_fire_match_1`
*   **Attack Action**: `UPDATE`
*   **Payload**:
    ```json
    {
      "entryFee": 0,
      "prizePool": 5000,
      "perKill": 100
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED` (Standard users cannot alter match costs or payouts)

### Exploit 7: Game Category Injection (Asset Defacement)
*   **Target Path**: `games/counter_strike`
*   **Attack Action**: `CREATE`
*   **Payload**:
    ```json
    {
      "id": "counter_strike",
      "name": "Malicious Game Space",
      "imageUrl": "https://phishing.site/evil.png",
      "activeMatchesCount": 0
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED` (Normal users cannot inject catalog games)

### Exploit 8: Malicious Banner Phishing Link Injection
*   **Target Path**: `banners/slide_99`
*   **Attack Action**: `CREATE`
*   **Payload**:
    ```json
    {
      "id": "slide_99",
      "title": "FREE ULTIMATE COINS CLICK HERE",
      "imageUrl": "https://malicious.cdn/phishing.png",
      "deepLink": "https://scam.site/steal-wallet",
      "active": true
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED` (Assets are read-only for non-admins)

### Exploit 9: Push Notification Spoofing (Social Engineering)
*   **Target Path**: `notifications/notif_12`
*   **Attack Action**: `CREATE`
*   **Payload**:
    ```json
    {
      "id": "notif_12",
      "title": "URGENT PAYMENT ALERT",
      "body": "System downtime! Deposit your money into UPI ID hacker@upi to rescue index",
      "sentAt": "2026-05-27T20:32:00Z"
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED` (Faux notifications are blocked)

### Exploit 10: Deny-of-Wallet Path Variable Poisoning
*   **Target Path**: `matches/%20%20%20LONG_STRING_OVER_1000_CHARACTERS_TO_CONSUME_RULES_EVAL_BUDGET%20%20%20`
*   **Attack Action**: `GET` or `CREATE`
*   **Expected Behavior**: `PERMISSION_DENIED` (Malformed ID sizes or character formats reject immediately to optimize costs)

### Exploit 11: Transaction Creation with Temporal Tampering (Time Warp Spoofing)
*   **Target Path**: `transactions/txn_999`
*   **Attack Action**: `CREATE` (With client-asserted timestamp)
*   **Payload**:
    ```json
    {
      "id": "txn_999",
      "uid": "attacker_uid",
      "amount": 100,
      "type": "deposit",
      "status": "pending",
      "createdAt": "1999-01-01T00:00:00Z"
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED` (Creation times must align with `request.time` exactly)

### Exploit 12: Database Scrape via Blanket List Request (Query Scraping)
*   **Target Path**: `transactions` (Blanket collection fetch without owner boundaries)
*   **Attack Action**: `LIST` (Executed as `attacker_uid`)
*   **Expected Behavior**: `PERMISSION_DENIED` unless filtered precisely as `resource.data.uid == request.auth.uid`.

---

## 3. Security Test Declarations

Testing structure runs in a simulated environment verifying correct authorization responses across standard roles.
An offline integration test suites assertions to guarantee rules will systematically catch and throw permission exceptions.
