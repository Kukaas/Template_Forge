import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useState } from 'react';
import { CustomButton, ConfirmationDialog } from '../components/custom-components';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, LogOut, Home as HomeIcon, LayoutDashboard, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/logout`;
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const navigationItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      show: true
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      show: isAuthenticated
    }
  ];

  const NavItem = ({ item, isMobile }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link
        to={item.path}
        onClick={() => isMobile && setIsSheetOpen(false)}
        className={cn(
          "flex items-center transition-colors rounded-md",
          isMobile ? "p-2 text-base w-full justify-between" : "px-3 py-1.5 text-sm",
          isActive 
            ? "text-primary font-medium" 
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span className="flex items-center gap-2">
          <Icon className={cn("flex-shrink-0", isMobile ? "h-5 w-5" : "h-4 w-4")} />
          {item.name}
        </span>
        {isMobile && <ChevronRight className="h-4 w-4" />}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors"
          >
            <HomeIcon className="h-4 w-4" />
            <span>TemplateForge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              {navigationItems.map((item) => 
                item.show && <NavItem key={item.path} item={item} isMobile={false} />
              )}
            </div>

            {/* Desktop Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l pl-4">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <CustomButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowLogoutDialog(true)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                </CustomButton>
              </div>
            ) : (
              <Link to="/login">
                <CustomButton variant="gradient" size="sm">
                  Login
                </CustomButton>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <CustomButton variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </CustomButton>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[300px] p-0">
                <div className="border-b p-6">
                  <Link 
                    to="/" 
                    onClick={() => setIsSheetOpen(false)}
                    className="flex items-center gap-2 font-medium"
                  >
                    <HomeIcon className="h-5 w-5" />
                    <span>TemplateForge</span>
                  </Link>
                </div>

                <div className="flex flex-col p-6 space-y-6">
                  {/* Mobile Navigation Items */}
                  <div className="space-y-1">
                    {navigationItems.map((item) => 
                      item.show && <NavItem key={item.path} item={item} isMobile={true} />
                    )}
                  </div>

                  {/* Mobile User Info & Auth */}
                  {isAuthenticated ? (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {user?.email}
                      </div>
                      <CustomButton 
                        variant="ghost"
                        className="w-full justify-between text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setIsSheetOpen(false);
                          setShowLogoutDialog(true);
                        }}
                      >
                        Logout
                        <LogOut className="h-4 w-4" />
                      </CustomButton>
                    </div>
                  ) : (
                    <Link 
                      to="/login" 
                      onClick={() => setIsSheetOpen(false)}
                      className="w-full"
                    >
                      <CustomButton 
                        variant="gradient"
                        className="w-full justify-between"
                      >
                        Login
                        <ChevronRight className="h-4 w-4" />
                      </CustomButton>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutDialog}
        onClose={setShowLogoutDialog}
        onConfirm={handleLogout}
        title="Are you sure you want to logout?"
        description="You will need to login again to access your account."
        confirmText="Logout"
        isLoading={isLoggingOut}
        variant="danger"
      />
    </nav>
  );
};

export default Navbar;