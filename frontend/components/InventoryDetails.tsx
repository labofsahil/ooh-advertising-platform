import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Eye,
  Calendar,
  Ruler,
  Users,
  Lightbulb,
  Monitor,
} from "lucide-react";
import type { AdSpaceStatus } from "~backend/inventory/types";
import { useBackend } from "../lib/useBackend";
import { useAuth } from "@clerk/clerk-react";

export default function InventoryDetails() {
  const { isSignedIn } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["inventory", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      return await backend.inventory.getInventory({ id: parseInt(id) });
    },
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No ID provided");
      await backend.inventory.deleteInventory({ id: parseInt(id) });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory listing deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      navigate("/inventory");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete inventory listing",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const getStatusVariant = (status: AdSpaceStatus) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "pending": return "outline";
      default: return "secondary";
    }
  };

  const formatType = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load inventory listing</p>
        <Button onClick={() => navigate("/inventory")} className="mt-4">
          Back to Inventory
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
            <p className="text-muted-foreground mt-2 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {listing.location}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(listing.status)} className="text-sm">
            {listing.status}
          </Badge>
          <Button variant="outline" asChild>
            <Link to={`/inventory/${listing.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {listing.image_url && (
        <Card>
          <CardContent className="p-0">
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-lg">{formatType(listing.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Size</p>
                  <p className="text-lg capitalize">{listing.size.replace("_", " ")}</p>
                </div>
              </div>
              
              {listing.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-muted-foreground mt-1">{listing.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                {listing.illuminated && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span>Illuminated</span>
                  </div>
                )}
                {listing.digital && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Monitor className="h-4 w-4 text-blue-500" />
                    <span>Digital Display</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(listing.dimensions_width || listing.dimensions_height) && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
                    </div>
                    <p>
                      {listing.dimensions_width && `${listing.dimensions_width}' W`}
                      {listing.dimensions_width && listing.dimensions_height && " × "}
                      {listing.dimensions_height && `${listing.dimensions_height}' H`}
                    </p>
                  </div>
                )}

                {(listing.latitude && listing.longitude) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Coordinates</p>
                    <p className="text-sm font-mono">
                      {listing.latitude.toFixed(6)}, {listing.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {(listing.traffic_count || listing.demographics || listing.visibility_score) && (
            <Card>
              <CardHeader>
                <CardTitle>Audience &amp; Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {listing.traffic_count && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Daily Traffic</p>
                    </div>
                    <p className="text-lg font-semibold">
                      {listing.traffic_count.toLocaleString()} views/day
                    </p>
                  </div>
                )}

                {listing.visibility_score && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Visibility Score</p>
                    <p className="text-lg">
                      {listing.visibility_score}/10
                    </p>
                  </div>
                )}

                {listing.demographics && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Target Demographics</p>
                    </div>
                    <p className="text-muted-foreground">{listing.demographics}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Pricing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Rate</p>
                <p className="text-2xl font-bold">${listing.daily_price}</p>
              </div>
              
              {listing.weekly_price && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Weekly Rate</p>
                  <p className="text-xl font-semibold">${listing.weekly_price}</p>
                </div>
              )}
              
              {listing.monthly_price && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Rate</p>
                  <p className="text-xl font-semibold">${listing.monthly_price}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {(listing.available_from || listing.available_until) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Availability</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {listing.available_from && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available From</p>
                    <p>{formatDate(listing.available_from)}</p>
                  </div>
                )}
                
                {listing.available_until && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Until</p>
                    <p>{formatDate(listing.available_until)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(listing.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{formatDate(listing.updated_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organization ID</p>
                <p className="text-sm">{listing.organization_id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
