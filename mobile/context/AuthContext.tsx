import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = { id: string; name?: string; email?: string } | null;

interface AuthContextType {
  user: User;
  isLoading: boolean; // ✅ New: Tells the app "I'm checking if user is logged in"
  login: (userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading

  // 1. Check for saved user on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user", e);
      } finally {
        setIsLoading(false); // ✅ Done checking
      }
    };
    loadUser();
  }, []);

  // 2. Login: Save to State & Storage
  const login = async (userData: any) => {
    setIsLoading(true);
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setIsLoading(false);
  };

  // 3. Logout: Clear State & Storage
  const logout = async () => {
    setIsLoading(true);
    setUser(null);
    await AsyncStorage.removeItem('user');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);