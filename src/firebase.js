import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBFLT2yICgBx6_rZ8OGzAlDRFSYXCyuC_E",
  authDomain: "trip-planner-9d29f.firebaseapp.com",
  projectId: "trip-planner-9d29f",
  storageBucket: "trip-planner-9d29f.firebasestorage.app",
  messagingSenderId: "633570134037",
  appId: "1:633570134037:web:ba2034af32b4f25a78e61c",
  measurementId: "G-SQN04JMY06"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const ALLOWED_EMAIL = 'podlackr@gmail.com'
