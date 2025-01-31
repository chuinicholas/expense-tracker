import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  updateEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Create user document in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        email,
        displayName,
        createdAt: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password, rememberMe) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Store the rememberMe preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        // Store the user's email for future use
        localStorage.setItem("userEmail", email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("userEmail");
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Check if this is a new user
      await setDoc(
        doc(db, "users", result.user.uid),
        {
          email: result.user.email,
          displayName: result.user.displayName,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function updateUserProfile(profileData) {
    if (!currentUser) throw new Error("No user logged in");

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, profileData);

      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          displayName: profileData.displayName,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userRef, {
          email: currentUser.email,
          displayName: profileData.displayName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Update local user state with the new data
      const updatedUser = auth.currentUser;
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async function updateUserPassword(newPassword) {
    if (!currentUser) throw new Error("No user logged in");

    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
