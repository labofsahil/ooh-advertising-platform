import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Eye, Edit, Plus, Home } from "lucide-react";
import type { AdSpaceType, AdSpaceStatus } from "~backend/inventory/types";
import { useBackend } from "../lib/useBackend";
import { useAuth } from "@clerk/clerk-react";

export default function InventoryList() {
  const { isSignedIn } = useAuth();
  const backend = useBackend();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AdSpaceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AdSpaceStatus | "all">("all");

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["inventory", "list", search, typeFilter, statusFilter],
    queryFn: async () => {
      const params: any = {};
      if (search) params.location = search;
      if (typeFilter !== "all") params.type = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      
      const response = await backend.inventory.listInventory(params);
      return response;
    },
  });

  const listings = data?.listings || [];

  const getStatusVariant = (status: AdSpaceStatus) => {
    switch (status) {
      case "available": return "default";
      case "booked": return "secondary";
      case "maintenance": return "outline";
      case "inactive": return "secondary";
      default: return "secondary";
    }
  };

  const formatType = (type: AdSpaceType) => {
    return type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load inventory listings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Listings</h1>
          <p className="text-muted-foreground mt-2">
            Browse and manage advertising spaces
          </p>
        </div>
        <Button asChild>
          <Link to="/inventory/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as AdSpaceType | "all")}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="billboard">Billboard</SelectItem>
                <SelectItem value="digital_display">Digital Display</SelectItem>
                <SelectItem value="transit_ad">Transit Ad</SelectItem>
                <SelectItem value="street_furniture">Street Furniture</SelectItem>
                <SelectItem value="airport">Airport</SelectItem>
                <SelectItem value="mall">Mall</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AdSpaceStatus | "all")}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">No inventory listings found</p>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or create a new listing
            </p>
            <Button asChild className="mt-4">
              <Link to="/inventory/new">Create New Listing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg leading-tight">{listing.title}</h3>
                      <Badge variant={getStatusVariant(listing.status)} className="capitalize">
                        {listing.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{listing.location}</span>
                      </div>
                      {listing.address && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Home className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{listing.address}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formatType(listing.type)} • {listing.size.replace("_", " ")}
                      </p>
                      {listing.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {listing.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">${listing.daily_price}/day</p>
                        {listing.traffic_count && (
                          <p className="text-xs text-muted-foreground">
                            {listing.traffic_count.toLocaleString()} daily views
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/inventory/${listing.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/inventory/${listing.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {data && data.total > listings.length && (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">
                  Showing {listings.length} of {data.total} listings
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pagination coming soon
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
