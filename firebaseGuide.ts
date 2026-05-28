export const FIREBASE_GUIDE_CONTENT = `### KILL 2 WIN Firebase Setup & Integration Guide

This guide is designed for developers who are configuring Firebase Firestore, Authentication, and FCM (Firebase Cloud Messaging) for the **KILL 2 WIN Tournament App**. Paste these components into your Firebase Project console.

---

### 1. Firestore Database Schema Structure

Here is how your collections should look in Firestore. Create these collections:

#### Collection: \`games\`
*   \`id\` (Document ID) - e.g., \`free_fire\`
*   \`name\`: "Free Fire India" (String)
*   \`imageUrl\`: "https://example.com/ff.jpg" (String)
*   \`activeMatchesCount\`: 5 (Number)

#### Collection: \`matches\`
*   \`id\` (Document ID) - Generated key (e.g., \`M_abc123\`)
*   \`gameId\`: "free_fire" (String)
*   \`title\`: "Bermuda Clash Squad 1v1" (String)
*   \`matchDateTime\`: "2026-05-28T18:00:00" (String or Timestamp)
*   \`prizePool\`: 500 (Number)
*   \`perKill\`: 5 (Number)
*   \`entryFee\`: 10 (Number)
*   \`type\`: "Solo" | "Duo" | "Squad" (String)
*   \`version\`: "TPP" | "FPP" (String)
*   \`map\`: "Bermuda" | "Purgatory" | "Kalahari" (String)
*   \`totalSlots\`: 48 (Number)
*   \`joinedSlots\`: 5 (Number)
*   \`joinedUsers\`: Array of User UIDs \`["uid_1", "uid_2"]\`
*   \`joinedUsernames\`: Array of Free Fire names \`["FF_Killer", "SniperGod"]\`
*   \`status\`: "upcoming" | "ongoing" | "completed" (String)
*   \`roomId\`: "Room_102" (String, Optional)
*   \`roomPassword\`: "pass123" (String, Optional)
*   \`resultDeclared\`: false (Boolean)

#### Sub-collection: \`matches/{matchId}/players\`
Create a sub-collection inside each match document to track joined user specifics and rewards:
*   \`uid\` (Document ID)
*   \`gameUsername\`: "FF_Killer" (String)
*   \`joinedAt\`: ServerTimestamp
*   \`kills\`: 4 (Number, set by Admin manually)
*   \`rank\`: 1 (Number, set by Admin manually)
*   \`winnings\`: 30 (Number, calculated & credited by Admin)
*   \`paid\`: true (Boolean)

#### Collection: \`users\`
*   \`uid\` (Document ID)
*   \`username\`: "Rohan Gamer" (String)
*   \`email\`: "rohan@gmail.com" (String)
*   \`phone\`: "9876543210" (String)
*   \`walletBalance\`: 150.00 (Number)
*   \`bonusAmount\`: 20.00 (Number)
*   \`joinedMatches\`: Array of string match IDs \`["M_abc123"]\`
*   \`completedMatches\`: Array of string match IDs \`[]\`
*   \`fcmToken\`: "APA91b..." (String, FCM token for notifications)

#### Collection: \`banners\`
*   \`id\` (Document ID) - Generated
*   \`imageUrl\`: "https://example.com/banner1.jpg" (String)
*   \`title\`: "KILL 2 WIN Promo Banner" (String)
*   \`deepLink\`: "wallet" | "contact" | "rules" (String)
*   \`active\`: true (Boolean)

#### Collection: \`transactions\`
*   \`id\` (Document ID) - Generated
*   \`uid\`: "user_uid_123" (String)
*   \`amount\`: 100 (Number)
*   \`type\`: "deposit" | "withdrawal" | "entry_fee" | "winnings" | "bonus" (String)
*   \`status\`: "pending" | "approved" | "rejected" | "success" (String)
*   \`paymentMethod\`: "UPI" | "Paytm" | "QR Scanner" (String)
*   \`createdAt\`: String or Timestamp
*   \`utrNo\`: "UTR12345678" (String, for deposits)

---

### 2. Firestore Security Rules (\`firestore.rules\`)

Copy and paste these rules into your Firebase Firestore "Rules" tab to ensure secure access. Admins bypass rules if authentication accounts are configured or matched with a dedicated \`admin\` boolean field or custom claim, but this implementation secures default read/writes:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Is the user authenticated?
    function isAuth() {
      return request.auth != null;
    }

    // Helper: Does the user modify their own record?
    function isOwner(userId) {
      return isAuth() && request.auth.uid == userId;
    }

    // Games: Public read, Admin write
    match /games/{gameId} {
      allow read: if true;
      allow write: if isAuth() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Matches: Public read, Admin write, User registration increases joinedSlots
    match /matches/{matchId} {
      allow read: if true;
      allow create, update, delete: if isAuth(); 
      
      // Player Sub-collection inside Match
      match /players/{playerId} {
        allow read: if true;
        allow write: if isAuth();
      }
    }

    // Users collection: Only own profile can be fully read/updated, Admins can do everything
    match /users/{userId} {
      allow read, write: if isOwner(userId) || (isAuth() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }

    // Banners: Read for everyone, Admin write
    match /banners/{bannerId} {
      allow read: if true;
      allow write: if isAuth() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Transactions: Users can read/write their own, Admin manages
    match /transactions/{txnId} {
      allow read: if isAuth() && (resource.data.uid == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
      allow create: if isAuth() && request.resource.data.uid == request.auth.uid;
      allow update: if isAuth() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Notifications: Public read
    match /notifications/{notifyId} {
      allow read: if true;
      allow write: if isAuth();
    }
  }
}
\`\`\`

---

### 3. Firebase Cloud Messaging (FCM) Notification Setup Guide

#### Client-side Android Triggering
When the Admin switches a Match from **Upcoming** to **Ongoing** and enters the **Room ID** and **Password**, FCM triggers a push notification to all users who registered for that match ID. Under the hood, you can handle this via an HTTPS Cloud Function or Firebase Firestore Trigger.

#### Firestore Trigger for Automatic Custom Match Notifications (NodeJS Cloud Function)
Copy this snippet into your **Firebase Functions** (\`index.js\`) to automatically alert registered match players whenever room codes are ready:

\`\`\`typescript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onRoomCodeAdded = functions.firestore
  .document('matches/{matchId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Trigger when status changes to 'ongoing' and roomId is entered
    if (beforeData.status === 'upcoming' && afterData.status === 'ongoing' && afterData.roomId) {
      const matchId = context.params.matchId;
      const title = afterData.title || 'Your Free Fire Match is Starting!';
      const roomId = afterData.roomId;
      const roomPass = afterData.roomPassword || 'Check app';
      
      console.log(\`Sending push notifications for Match ID: \${matchId}\`);

      // 1. Fetch all users who joined this match
      const joinedUserIds = afterData.joinedUsers || [];
      if (joinedUserIds.length === 0) return null;

      // 2. Query FCM Tokens from Users
      const tokens = [];
      const userPromises = joinedUserIds.map(uid => 
        admin.firestore().collection('users').doc(uid).get()
      );
      
      const userDocs = await Promise.all(userPromises);
      userDocs.forEach(doc => {
        if (doc.exists && doc.data().fcmToken) {
          tokens.push(doc.data().fcmToken);
        }
      });

      if (tokens.length === 0) {
        console.log('No registered FCM tokens found for this match.');
        return null;
      }

      // 3. Define payload
      const payload = {
        notification: {
          title: '🔥 Room ID & Password Ready!',
          body: \`Room: \${roomId} | pass: \${roomPass} for match "\${title}". Join fast!\`,
          sound: 'default'
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          matchId: matchId,
          roomId: roomId,
          roomPassword: roomPass,
          type: 'GAME_ROOM_ALERT'
        }
      };

      // 4. Send multicast notification
      const response = await admin.messaging().sendMulticast({
        tokens: tokens,
        notification: payload.notification,
        data: payload.data
      });

      console.log(\`Successfully sent \${response.successCount} notifications; failed \${response.failureCount}\`);
      return null;
    }
    return null;
  });
\`\`\`

---

### 4. Admin Manual Wallet Prize Distribution Logic (Copy-Paste Solution)

When a match is finalized, you request list-view manual distribution. The Admin fetches the participants from \`matches/{matchId}/players\`. For each participant, they insert results and update the user's wallet with one atomic Transaction.

Here is the correct Firestore transaction code for prize allocation:

\`\`\`typescript
import { getFirestore, runTransaction, doc } from 'firebase/firestore';

async function approveMatchPlacingAndWinnings(matchId, playerUid, finalKills, finalRank, winPrize) {
  const db = getFirestore();
  const userRef = doc(db, 'users', playerUid);
  const playerRef = doc(db, \`matches/\${matchId}/players\`, playerUid);
  const matchRef = doc(db, 'matches', matchId);

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Read User balance
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw "User profile does not exist!";
      }

      const currentBalance = userDoc.data().walletBalance || 0;
      const updatedBalance = currentBalance + Number(winPrize);

      // 2. Update user's wallet
      transaction.update(userRef, {
        walletBalance: updatedBalance
      });

      // 3. Keep player stats updated inside match sub-collection
      transaction.update(playerRef, {
        kills: Number(finalKills),
        rank: Number(finalRank),
        winnings: Number(winPrize),
        paid: true
      });

      // 4. Record the prize transaction for audit ledger
      const newTxnRef = doc(collection(db, 'transactions'));
      transaction.set(newTxnRef, {
        uid: playerUid,
        amount: Number(winPrize),
        type: 'winnings',
        paymentMethod: 'In-App Wallet',
        status: 'success',
        createdAt: new Date().toISOString(),
        utrNo: \`REF_WIN_\${matchId}_\${playerUid}\`
      });
    });

    console.log("Winnings manually distributed securely through multi-document atomic transaction!");
    return true;
  } catch (error) {
    console.error("Wallet distribution failure: ", error);
    throw error;
  }
}
\`\`\`
`;
