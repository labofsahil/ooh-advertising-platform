import { Link, useLocation } from "react-router-dom";
import { Building2, LayoutDashboard, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">OOH Inventory</span>
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                asChild
                className="flex items-center space-x-2"
              >
                <Link to="/">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              
              <Button
                variant={isActive("/inventory") ? "default" : "ghost"}
                asChild
                className="flex items-center space-x-2"
              >
                <Link to="/inventory">
                  <List className="h-4 w-4" />
                  <span>Inventory</span>
                </Link>
              </Button>
              
              <Button
                variant={isActive("/inventory/new") ? "default" : "ghost"}
                asChild
                className="flex items-center space-x-2"
              >
                <Link to="/inventory/new">
                  <Plus className="h-4 w-4" />
                  <span>Add Listing</span>
                </Link>
              </Button>

              <SignedOut>
                <Button asChild variant="outline">
                  <Link to="/sign-in">Sign In</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
