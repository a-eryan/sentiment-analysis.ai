import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
});
