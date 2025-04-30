
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister: () => void;
}

const LoginForm = ({ onSuccess, onSwitchToRegister }: LoginFormProps) => {
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Attempting to login with:", email);
      await login(email, password);
      console.log("Login successful, triggering onSuccess callback");
      onSuccess?.();
    } catch (error: any) {
      console.error("Login form error:", error);
      toast.error(error.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setPassword("");
  };

  // Either context loading or local loading will disable the form
  const formDisabled = authLoading || isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" onReset={handleReset}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={formDisabled}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button type="button" variant="link" className="px-0 h-auto font-normal text-xs">
            Forgot password?
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={formDisabled}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-pawsitive-primary hover:bg-pawsitive-secondary"
        disabled={formDisabled}
      >
        {formDisabled ? "Logging in..." : "Log in"}
      </Button>
      
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account?</span>
        {' '}
        <Button type="button" variant="link" onClick={onSwitchToRegister} className="p-0 h-auto">
          Sign up
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
