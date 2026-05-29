import { updateUserProfile, updateUserProfile as updateFirestoreUser } from './authHooks';
import { updateDoc, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { WalletTransaction, AppUser } from './types';

// Initialize ZapUPI payment gateway
const ZAPUPI_API_KEY = process.env.REACT_APP_ZAPUPI_API_KEY || 'test_key';
const ZAPUPI_MERCHANT_ID = process.env.REACT_APP_ZAPUPI_MERCHANT_ID || 'test_merchant';

// Generate unique transaction ID
function generateTransactionId(): string {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create payment order with ZapUPI
export async function createZapUPIOrder(
  amount: number,
  userId: string,
  userEmail: string,
  userName: string
) {
  try {
    const transactionId = generateTransactionId();
    
    // Create order payload for ZapUPI
    const orderData = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: transactionId,
      customer: {
        email: userEmail,
        name: userName,
        phone: '+91', // Placeholder, add real phone if available
      },
      notes: {
        userId: userId,
        appName: 'Kill2Win',
      },
    };

    // In production, make API call to ZapUPI backend
    // For now, we'll use a mock implementation
    console.log('[v0] ZapUPI Order Created:', orderData);
    
    return {
      success: true,
      transactionId,
      orderId: `ORDER_${transactionId}`,
      amount,
      currency: 'INR',
      status: 'initiated',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create ZapUPI order',
    };
  }
}

// Process successful payment
export async function processPaymentSuccess(
  transactionId: string,
  orderId: string,
  amount: number,
  userId: string,
  paymentMethod: string = 'ZapUPI'
) {
  try {
    // Create transaction record in Firestore
    const transaction: WalletTransaction = {
      id: transactionId,
      uid: userId,
      amount,
      type: 'deposit',
      status: 'success',
      paymentMethod,
      createdAt: new Date().toISOString(),
      utrNo: orderId,
    };

    // Add to transactions collection
    await addDoc(collection(db, 'transactions'), transaction);

    // Update user wallet in Firestore
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentBalance = userSnap.data().walletBalance || 0;
      await updateDoc(userRef, {
        walletBalance: currentBalance + amount,
      });
    }

    return {
      success: true,
      transactionId,
      message: 'Payment processed successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to process payment',
    };
  }
}

// Handle payment failure
export async function processPaymentFailure(
  transactionId: string,
  orderId: string,
  userId: string,
  reason: string
) {
  try {
    const transaction: WalletTransaction = {
      id: transactionId,
      uid: userId,
      amount: 0,
      type: 'deposit',
      status: 'failed',
      paymentMethod: 'ZapUPI',
      createdAt: new Date().toISOString(),
      utrNo: orderId,
    };

    // Add failed transaction to records
    await addDoc(collection(db, 'transactions'), transaction);

    return {
      success: true,
      message: `Payment failed: ${reason}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to log payment failure',
    };
  }
}

// Initiate UPI payment flow
export async function initiateUPIPayment(
  amount: number,
  userId: string,
  userEmail: string,
  userName: string,
  onSuccess: (data: any) => void,
  onFailure: (error: string) => void
) {
  try {
    // Create order
    const orderResult = await createZapUPIOrder(amount, userId, userEmail, userName);
    
    if (!orderResult.success) {
      onFailure(orderResult.error);
      return;
    }

    // In production, this would open ZapUPI checkout
    // For demo, we'll simulate the flow
    const isSimulated = true; // Set to false when real gateway is ready
    
    if (isSimulated) {
      // Simulate successful payment after 2 seconds
      setTimeout(() => {
        processPaymentSuccess(
          orderResult.transactionId,
          orderResult.orderId,
          amount,
          userId,
          'UPI'
        ).then(result => {
          if (result.success) {
            onSuccess({
              transactionId: orderResult.transactionId,
              orderId: orderResult.orderId,
              amount,
              status: 'completed',
            });
          } else {
            onFailure(result.error);
          }
        });
      }, 2000);
    }

    return orderResult;
  } catch (error: any) {
    onFailure(error.message);
  }
}

// Request withdrawal to bank account
export async function requestWithdrawal(
  userId: string,
  amount: number,
  bankAccount: string,
  ifscCode: string,
  accountHolder: string
) {
  try {
    const transactionId = generateTransactionId();
    
    const withdrawal: WalletTransaction = {
      id: transactionId,
      uid: userId,
      amount,
      type: 'withdrawal',
      status: 'pending',
      paymentMethod: 'Bank Transfer',
      createdAt: new Date().toISOString(),
      utrNo: bankAccount,
    };

    // Add to transactions
    await addDoc(collection(db, 'transactions'), withdrawal);

    // Deduct from wallet
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentBalance = userSnap.data().walletBalance || 0;
      if (currentBalance >= amount) {
        await updateDoc(userRef, {
          walletBalance: currentBalance - amount,
        });
      } else {
        throw new Error('Insufficient balance');
      }
    }

    return {
      success: true,
      transactionId,
      message: 'Withdrawal request submitted',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to request withdrawal',
    };
  }
}

// Import for side effects
import { getDoc } from 'firebase/firestore';
