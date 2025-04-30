
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the types for the context
interface AuthContextProps {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: "user" | "vet") => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

// Update the User type to include verification fields
export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "vet" | "moderator";
  avatarUrl?: string;
  is_vet_verified?: boolean;
  cin_document_url?: string;
  siret_document_url?: string;
  verification_submitted_at?: string;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUserData: async () => {},
});

// Create a provider component to wrap the app
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await refreshUserData();
      } else {
        setIsLoading(false);
      }
    };
    
    loadSession();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        refreshUserData();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
      }
    });
    
    // Set up a periodic refresh for vet verification status
    // This will check every 30 seconds if the user's verification status has changed
    let refreshInterval: NodeJS.Timeout | null = null;
    
    if (user?.role === 'vet' && user?.verification_submitted_at && !user?.is_vet_verified) {
      console.log('Setting up periodic refresh for vet verification status');
      refreshInterval = setInterval(async () => {
        console.log('Checking for verification status updates...');
        await refreshUserData();
      }, 30000); // Check every 30 seconds
    }
    
    return () => {
      subscription?.unsubscribe();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [user?.role, user?.verification_submitted_at, user?.is_vet_verified]);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        throw error;
      }
      
      await refreshUserData();
      toast.success("Logged in successfully");
      navigate('/');
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string, role: "user" | "vet") => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            role: role,
          },
        },
      });
      if (error) {
        throw error;
      }
      
      // After successful registration, update the profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user?.id, name: name, role: role, email: email }]);
      
      if (profileError) {
        throw profileError;
      }
      
      await refreshUserData();
      toast.success("Registered successfully");
      navigate('/');
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setIsLoggedIn(false);
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };

  // Update the refreshUserData method to fetch verification fields
  const refreshUserData = async () => {
    if (!supabase.auth.getUser) return;
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUser(null);
        setIsLoggedIn(false);
        return;
      }
      
      // Fetch the user profile from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, role, avatar_url, is_vet_verified, cin_document_url, siret_document_url, verification_submitted_at')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      setUser({
        id: authUser.id,
        email: authUser.email || "",
        name: profile?.name || "",
        role: (profile?.role as "user" | "vet" | "moderator") || "user",
        avatarUrl: profile?.avatar_url,
        is_vet_verified: profile?.is_vet_verified,
        cin_document_url: profile?.cin_document_url,
        siret_document_url: profile?.siret_document_url,
        verification_submitted_at: profile?.verification_submitted_at,
      });
      setIsLoggedIn(true);
      
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Provide the context value
  const value: AuthContextProps = {
    user,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    refreshUserData,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
