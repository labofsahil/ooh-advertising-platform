import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2, MapPin, TrendingUp, Plus, List } from "lucide-react";
import type { InventoryListing } from "~backend/inventory/types";
import { useBackend } from "../lib/useBackend";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

function DashboardContent() {
  const backend = useBackend();

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory", "dashboard"],
    queryFn: async () => {
      const response = await backend.inventory.listInventory({ limit: 10 });
      return response;
    },
  });

  const { data: organizationsData } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await backend.inventory.listOrganizations();
      return response;
    },
  });

  const listings = inventoryData?.listings || [];
  const organizations = organizationsData?.organizations || [];

  const availableListings = listings.filter(listing => listing.status === "available").length;
  const totalValue = listings.reduce((sum, listing) => sum + listing.daily_price, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your out-of-home advertising inventory
          </p>
        </div>
        <Button asChild>
          <Link to="/inventory/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {availableListings} available listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
            <p className="text-xs text-muted-foreground">
              Partner organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total daily inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
            <CardDescription>
              Your latest inventory submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No listings yet</p>
                <Button asChild className="mt-4">
                  <Link to="/inventory/new">Create your first listing</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.slice(0, 5).map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{listing.title}</h4>
                      <p className="text-sm text-muted-foreground">{listing.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${listing.daily_price}/day</p>
                      <p className="text-sm text-muted-foreground capitalize">{listing.status}</p>
                    </div>
                  </div>
                ))}
                {listings.length > 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/inventory">View All Listings</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link to="/inventory/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Inventory Listing
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/inventory">
                <List className="h-4 w-4 mr-2" />
                Browse All Inventory
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WelcomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <Building2 className="mx-auto h-24 w-24 text-primary mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to OOH Inventory
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The complete solution for managing your out-of-home advertising inventory. 
          Track billboards, digital displays, and advertising spaces with ease.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link to="/sign-up">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle>Location Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              Easily manage and track all your advertising locations with detailed geographic information and mapping capabilities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle>Revenue Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              Monitor your inventory performance with comprehensive pricing and revenue analytics across all your properties.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle>Organization Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              Organize your inventory by type, size, and availability to streamline your advertising space management.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
      <SignedOut>
        <WelcomePage />
      </SignedOut>
    </>
  );
}
