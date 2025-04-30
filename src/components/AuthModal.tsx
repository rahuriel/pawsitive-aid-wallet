
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "register";
}

const AuthModal = ({ isOpen, onClose, initialView = "login" }: AuthModalProps) => {
  const [currentView, setCurrentView] = useState<"login" | "register">(initialView);

  // Reset the view when the modal is opened or initialView changes
  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView);
    }
  }, [isOpen, initialView]);

  const handleSuccess = () => {
    console.log("Auth success, closing modal");
    onClose();
  };

  const switchToRegister = () => {
    setCurrentView("register");
  };

  const switchToLogin = () => {
    setCurrentView("login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {currentView === "login" ? "Welcome Back" : "Join PAWsitive Aid"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentView === "login" 
              ? "Sign in to your account to continue"
              : "Create a new account to get started"
            }
          </DialogDescription>
        </DialogHeader>
        
        {currentView === "login" ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToRegister={switchToRegister} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={switchToLogin} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
