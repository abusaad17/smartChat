import { createContext, useContext, useState } from "react";

interface authProviderProps {
  children?: React.ReactNode;
}

interface iAuthContext {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  token: string | null;
  setToken: (value: string | null) => void;
  user: IUser | null;
  setUser: (value: IUser | null) => void;
}

interface IUser {
  username: string;
  id: string | undefined;
}

const defaultAuthContext: iAuthContext = {
  isAuthenticated: false,
  setIsAuthenticated: () => {}, // Provide a no-op function as the default
  token: null,
  setToken: () => {}, // Provide a no-op function as the default
  user: null,
  setUser: () => {}, // Provide a no-op function as the default
};

const AuthContext = createContext<iAuthContext>(defaultAuthContext);

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

const AuthProvider: React.FC<authProviderProps> = ({ children }) => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!storedToken && !!storedUser);
  const [token, setToken] = useState<string | null>(storedToken ?  JSON.parse(storedToken) : null);
  const [user, setUser] = useState<IUser | null>(storedUser ? JSON.parse(storedUser) : null);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, token, setToken, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
