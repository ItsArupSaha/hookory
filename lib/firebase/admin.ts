import { App, cert, getApps, initializeApp } from "firebase-admin/app"
import { Auth, getAuth } from "firebase-admin/auth"
import { Firestore, getFirestore } from "firebase-admin/firestore"

// Initialize a single Admin app instance and export non-optional handles,
// so downstream code doesn't need to handle undefined.
function initAdminApp(): App {
  const existingApps = getApps()
  if (existingApps.length) {
    return existingApps[0] as App
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error("Missing Firebase Admin credentials")
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

const app: App = initAdminApp()

export const adminDb: Firestore = getFirestore(app)
export const adminAuth: Auth = getAuth(app)
