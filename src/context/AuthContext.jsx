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
  collection,
  query,
  where,
  getDocs,
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
      // Update the user's profile with display name
      await updateProfile(result.user, { displayName });
      // Store user data in Firestore
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

  async function updateUserProfile(updates) {
    if (!currentUser) throw new Error("No user logged in");

    try {
      await updateProfile(currentUser, updates);
      // Update user data in Firestore
      if (updates.displayName) {
        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            displayName: updates.displayName,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      // Force a refresh of the current user
      setCurrentUser({ ...currentUser, ...updates });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async function updateUserPassword(newPassword) {
    if (!currentUser) throw new Error("No user logged in");

    try {
      await updatePassword(currentUser, newPassword);
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  // Add function to get user's display name
  async function getUserDisplayName(email) {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().displayName;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user display name:", error);
      return null;
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
    getUserDisplayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
