
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Heart, LogOut, Menu, User, X, Info, FolderOpen, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "register">("login");
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openAuthModal = (view: "login" | "register") => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false); // Close mobile menu when navigating
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Heart className="h-6 w-6 text-pawsitive-primary" />
              <span className="ml-2 font-bold text-lg text-pawsitive-dark">PAWsitive Aid</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            <Button 
              variant="ghost" 
              className="text-pawsitive-dark"
              onClick={() => navigate('/')}
            >
              Home
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-pawsitive-dark"
              onClick={() => navigate('/about')}
            >
              <Info className="mr-1 h-4 w-4" />
              About
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-pawsitive-dark"
              onClick={() => navigate('/projects')}
            >
              <FolderOpen className="mr-1 h-4 w-4" />
              Projects
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-pawsitive-dark"
              onClick={() => navigate('/contact')}
            >
              <Mail className="mr-1 h-4 w-4" />
              Contact
            </Button>
            
            {user?.role === "vet" && (
              <>
                <Button 
                  variant="ghost" 
                  className="text-pawsitive-dark"
                  onClick={() => navigate('/treatment-requests')}
                >
                  Submit Request
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-pawsitive-dark"
                  onClick={() => navigate('/treatments')}
                >
                  My Requests
                </Button>
              </>
            )}
            
            {user?.role === "moderator" && (
              <Button 
                variant="ghost" 
                className="text-pawsitive-dark"
                onClick={() => navigate('/moderator')}
              >
                Moderator Panel
              </Button>
            )}
            
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-4 relative rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Hello, {user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === "vet" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/vet-profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile {!user.is_vet_verified && "(Unverified)"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/treatment-requests')}>
                        <span>Submit Request</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/treatments')}>
                        <span>My Requests</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.role === "moderator" && (
                    <DropdownMenuItem onClick={() => navigate('/moderator')}>
                      <span>Moderator Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex ml-4">
                <Button variant="ghost" onClick={() => openAuthModal("login")}>Login</Button>
                <Button variant="default" className="ml-2 bg-pawsitive-primary hover:bg-pawsitive-secondary" onClick={() => openAuthModal("register")}>Sign Up</Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button variant="ghost" onClick={toggleMenu} size="icon">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white pb-4 px-4">
          <div className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              className="justify-start"
              onClick={() => handleNavigation('/')}
            >
              Home
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start"
              onClick={() => handleNavigation('/about')}
            >
              <Info className="mr-2 h-4 w-4" />
              About
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start"
              onClick={() => handleNavigation('/projects')}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Projects
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start"
              onClick={() => handleNavigation('/contact')}
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact
            </Button>
            
            {user?.role === "vet" && (
              <>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => handleNavigation('/treatment-requests')}
                >
                  Submit Request
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => handleNavigation('/treatments')}
                >
                  My Requests
                </Button>
              </>
            )}
            
            {user?.role === "moderator" && (
              <Button 
                variant="ghost" 
                className="justify-start"
                onClick={() => handleNavigation('/moderator')}
              >
                Moderator Panel
              </Button>
            )}
            
            {isLoggedIn ? (
              <>
                <div className="flex items-center py-2">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{user?.name}</span>
                </div>
                
                {user?.role === "vet" && (
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={() => handleNavigation('/vet-profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile {!user.is_vet_verified && "(Unverified)"}</span>
                  </Button>
                )}
                
                <Button variant="ghost" className="justify-start" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="outline" onClick={() => openAuthModal("login")}>Login</Button>
                <Button variant="default" className="bg-pawsitive-primary hover:bg-pawsitive-secondary" onClick={() => openAuthModal("register")}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authModalView}
      />
    </nav>
  );
};

export default NavBar;
