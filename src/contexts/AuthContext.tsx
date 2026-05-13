import { useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "./auth-state";

import {
  ensureUserDocument,
  syncEmailVerification,
} from "../services/userService";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        (async () => {
          try {
            await firebaseUser.reload();
            await ensureUserDocument(
              firebaseUser.uid,
              firebaseUser.email || "",
            );

            await syncEmailVerification(
              firebaseUser.uid,
              firebaseUser.emailVerified,
            );
          } catch (err) {
            console.error("❌ Background sync failed:", err);
          }
        })();
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
