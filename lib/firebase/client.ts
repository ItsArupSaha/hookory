import { FirebaseApp, getApps, initializeApp } from "firebase/app"
import { Auth, browserLocalPersistence, getAuth, setPersistence } from "firebase/auth"
import { Firestore, getFirestore } from "firebase/firestore"

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

if (typeof window !== "undefined") {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }

  auth = getAuth(app)
  // Explicitly set persistence to LOCAL so auth state persists across browser sessions
  // This ensures the user stays logged in even after page refresh or server restart
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      // Persistence set successfully - auth state will be restored from localStorage
      console.log("Firebase Auth persistence set to localStorage")
    })
    .catch((error) => {
      console.error("Failed to set auth persistence:", error)
    })
  db = getFirestore(app)
}

export { auth, db }

