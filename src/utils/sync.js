import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithCredential, 
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';
import { 
  initializeFirestore, 
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
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

// Authentication functions
export const signInWithGoogle = async () => {
  return new Promise((resolve, reject) => {
    try {
      const WEB_CLIENT_ID = "181936506374-efuakp5dt0lblsru66rpcq1atde2u087.apps.googleusercontent.com";
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
    if (e?.code !== 'permission-denied') {
      console.error("FAILED TO SYNC TO CLOUD:", e);
    }
  }
};

export const subscribeToCloudData = (userId, onUpdate, onError) => {
  if (!userId) return () => {};
  
  console.log("SUBSCRIBING FOR USER:", userId);
  
  if (auth.currentUser) {
    auth.currentUser.getIdToken(true).then((token) => {
      console.log("Token acquired, length:", token.length);
      
      // Test REST API to see if it's an SDK issue or a token issue
      fetch(`https://firestore.googleapis.com/v1/projects/bashamark/databases/(default)/documents/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => console.log("REST API Response:", data))
      .catch(err => console.log("REST API Fetch Error:", err));
      
    }).catch(e => {
      console.log("Failed to get token:", e);
    });
  } else {
    console.log("auth.currentUser is null when subscribing!");
  }

  const userDoc = doc(db, 'users', userId);
  return onSnapshot(userDoc, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onUpdate(data);
    } else {
      onUpdate(null);
    }
  }, (error) => {
    // Using console.log instead of error/warn so Edge doesn't flag it as an extension issue
    console.log("FIRESTORE SYNC ERROR:", error?.code, error?.message);
    if (onError) onError(error);
  });
};
