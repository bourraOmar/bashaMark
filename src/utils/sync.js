import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithCredential, 
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6O-dFpY3CXCae32xTwtehyxKL-SAcSVU",
  authDomain: "bashamark.firebaseapp.com",
  projectId: "bashamark",
  storageBucket: "bashamark.firebasestorage.app",
  messagingSenderId: "181936506374",
  appId: "1:181936506374:web:00144eb96940392b042587"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication functions
export const signInWithGoogle = async () => {
  return new Promise((resolve, reject) => {
    try {
      const WEB_CLIENT_ID = "181936506374-vc6d6f4u0cq8rkrrnno0e95epqufv18v.apps.googleusercontent.com";
      const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
      const nonce = Math.random().toString(36).substring(2);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${WEB_CLIENT_ID}&response_type=id_token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20email%20profile&nonce=${nonce}`;

      chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
      }, async (responseUrl) => {
        if (chrome.runtime.lastError || !responseUrl) {
          console.error('Google Sign-In Error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        try {
          // Replace hash with question mark so URLSearchParams can easily parse it
          const urlParams = new URLSearchParams(new URL(responseUrl.replace('#', '?')).search);
          const idToken = urlParams.get('id_token');
          
          if (!idToken) {
            throw new Error("No ID Token found in response");
          }

          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          resolve(userCredential.user);
        } catch (error) {
          console.error('Firebase Auth Error:', error);
          reject(error);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const logoutUser = async () => {
  return signOut(auth);
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Database Sync Functions
export const syncDataToCloud = async (userId, data) => {
  if (!userId || !data) return;
  try {
    const userDoc = doc(db, 'users', userId);
    await setDoc(userDoc, data, { merge: true });
  } catch (e) {
    console.error("FAILED TO SYNC TO CLOUD:", e);
  }
};

export const subscribeToCloudData = (userId, onUpdate) => {
  if (!userId) return () => {};
  
  const userDoc = doc(db, 'users', userId);
  return onSnapshot(userDoc, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onUpdate(data);
    } else {
      onUpdate(null);
    }
  }, (error) => {
    console.error("ERROR SUBSCRIBING TO CLOUD:", error);
  });
};
