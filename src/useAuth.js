import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider, ALLOWED_EMAIL } from './firebase.js'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && u.email !== ALLOWED_EMAIL) {
        signOut(auth)
        setUser(null)
        setError('Access denied. This app is private.')
      } else {
        setUser(u)
        setError(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function login() {
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (result.user.email !== ALLOWED_EMAIL) {
        await signOut(auth)
        setError('Access denied. This app is private.')
      }
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError('Login failed. Please try again.')
      }
    }
  }

  async function logout() {
    await signOut(auth)
  }

  return { user, loading, error, login, logout }
}
