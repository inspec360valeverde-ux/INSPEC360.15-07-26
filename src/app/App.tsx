import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { TecnicoApp } from './components/TecnicoApp';
import { SupervisorApp } from './components/SupervisorApp';
import { SuperAdmApp } from './components/SuperAdmApp';

export type UserRole = 'tecnico' | 'supervisor' | 'superadm' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  switch (user.role) {
    case 'tecnico':
      return <TecnicoApp user={user} onLogout={handleLogout} />;
    case 'supervisor':
      return <SupervisorApp user={user} onLogout={handleLogout} />;
    case 'superadm':
      return <SuperAdmApp user={user} onLogout={handleLogout} />;
    default:
      return <LoginScreen onLogin={handleLogin} />;
  }
}
