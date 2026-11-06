import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { mockUsers, getCurrentUser, login as authLogin, logout as authLogout, register as authRegister } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = authLogin(email, password);
    setUser(loggedInUser);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const register = async (userData: Partial<User>, password: string) => {
    const newUser = authRegister(userData, password);
    setUser(newUser);
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    const users = mockUsers.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      mockUsers.saveUsers(users);
      setUser(updatedUser);
      
      // Update current user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
