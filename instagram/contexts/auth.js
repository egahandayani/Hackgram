const { createContext, useState } = require("react");

export const AuthContext = createContext({
  isSignedIn: false,
  setIsSignedIn: () => {},
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider
      value={{ isSignedIn, setIsSignedIn, user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
