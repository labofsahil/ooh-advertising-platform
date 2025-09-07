import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import type {
  AdSpaceType,
  AdSpaceSize,
  CreateInventoryRequest,
  UpdateInventoryRequest,
  FacingDirection,
  AdSpaceStatus,
} from "~backend/inventory/types";
import { useBackend } from "../lib/useBackend";
import { useAuth } from "@clerk/clerk-react";

export default function InventoryForm() {
  const { isSignedIn } = useAuth();
  const backend = useBackend();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "billboard" as AdSpaceType,
    size: "medium" as AdSpaceSize,
    status: "available" as AdSpaceStatus,
    location: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    latitude: "",
    longitude: "",
    daily_price: "",
    weekly_price: "",
    monthly_price: "",
    dimensions_width: "",
    dimensions_height: "",
    illuminated: false,
    digital: false,
    traffic_count: "",
    demographics: "",
    visibility_score: "",
    facing_direction: "north" as FacingDirection,
    image_url: "",
    available_from: "",
    available_until: "",
  });

  const { data: existingListing, isLoading: isLoadingListing } = useQuery({
    queryKey: ["inventory", id],
    queryFn: async () => {
      if (!id) return null;
      return await backend.inventory.getInventory({ id: parseInt(id) });
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingListing) {
      setFormData({
        title: existingListing.title,
        description: existingListing.description || "",
        type: existingListing.type,
        size: existingListing.size,
        status: existingListing.status,
        location: existingListing.location,
        address: existingListing.address || "",
        city: existingListing.city || "",
        state: existingListing.state || "",
        country: existingListing.country || "",
        postal_code: existingListing.postal_code || "",
        latitude: existingListing.latitude?.toString() || "",
        longitude: existingListing.longitude?.toString() || "",
        daily_price: existingListing.daily_price.toString(),
        weekly_price: existingListing.weekly_price?.toString() || "",
        monthly_price: existingListing.monthly_price?.toString() || "",
        dimensions_width: existingListing.dimensions_width?.toString() || "",
        dimensions_height: existingListing.dimensions_height?.toString() || "",
        illuminated: existingListing.illuminated,
        digital: existingListing.digital,
        traffic_count: existingListing.traffic_count?.toString() || "",
        demographics: existingListing.demographics || "",
        visibility_score: existingListing.visibility_score?.toString() || "",
        facing_direction: existingListing.facing_direction || "north",
        image_url: existingListing.image_url || "",
        available_from: existingListing.available_from ? new Date(existingListing.available_from).toISOString().split('T')[0] : "",
        available_until: existingListing.available_until ? new Date(existingListing.available_until).toISOString().split('T')[0] : "",
      });
    }
  }, [existingListing]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateInventoryRequest) => {
      return await backend.inventory.createInventory(data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory listing created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      navigate("/inventory");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create inventory listing",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateInventoryRequest) => {
      return await backend.inventory.updateInventory(data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory listing updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      navigate("/inventory");
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory listing",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.daily_price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const baseData = {
      title: formData.title,
      description: formData.description || undefined,
      type: formData.type,
      size: formData.size,
      status: formData.status,
      location: formData.location,
      address: formData.address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      country: formData.country || undefined,
      postal_code: formData.postal_code || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      daily_price: parseFloat(formData.daily_price),
      weekly_price: formData.weekly_price ? parseFloat(formData.weekly_price) : undefined,
      monthly_price: formData.monthly_price ? parseFloat(formData.monthly_price) : undefined,
      dimensions_width: formData.dimensions_width ? parseFloat(formData.dimensions_width) : undefined,
      dimensions_height: formData.dimensions_height ? parseFloat(formData.dimensions_height) : undefined,
      illuminated: formData.illuminated,
      digital: formData.digital,
      traffic_count: formData.traffic_count ? parseInt(formData.traffic_count) : undefined,
      demographics: formData.demographics || undefined,
      visibility_score: formData.visibility_score ? parseInt(formData.visibility_score) : undefined,
      facing_direction: formData.facing_direction || undefined,
      image_url: formData.image_url || undefined,
      available_from: formData.available_from ? new Date(formData.available_from) : undefined,
      available_until: formData.available_until ? new Date(formData.available_until) : undefined,
    };

    if (isEdit && id) {
      updateMutation.mutate({
        id: parseInt(id),
        ...baseData,
      });
    } else {
      createMutation.mutate({
        ...baseData,
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEdit && isLoadingListing) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Edit Inventory Listing" : "Create New Inventory Listing"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEdit ? "Update your advertising space details" : "Add a new advertising space to your inventory"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about your advertising space</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Highway 101 Billboard"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the advertising space, its visibility, and any special features..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="billboard">Billboard</SelectItem>
                    <SelectItem value="digital_display">Digital Display</SelectItem>
                    <SelectItem value="transit_ad">Transit Ad</SelectItem>
                    <SelectItem value="street_furniture">Street Furniture</SelectItem>
                    <SelectItem value="airport">Airport</SelectItem>
                    <SelectItem value="mall">Mall</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size *</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => handleInputChange("size", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra_large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Address</CardTitle>
            <CardDescription>Where is this advertising space located?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">General Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., 123 Main St, Downtown Los Angeles, CA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="e.g., 123 Main St"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Los Angeles"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Region</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="CA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  placeholder="90001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="United States"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="34.0522"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="-118.2437"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set your rates for different booking periods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily_price">Daily Rate ($) *</Label>
                <Input
                  id="daily_price"
                  type="number"
                  step="0.01"
                  value={formData.daily_price}
                  onChange={(e) => handleInputChange("daily_price", e.target.value)}
                  placeholder="100.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekly_price">Weekly Rate ($)</Label>
                <Input
                  id="weekly_price"
                  type="number"
                  step="0.01"
                  value={formData.weekly_price}
                  onChange={(e) => handleInputChange("weekly_price", e.target.value)}
                  placeholder="600.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_price">Monthly Rate ($)</Label>
                <Input
                  id="monthly_price"
                  type="number"
                  step="0.01"
                  value={formData.monthly_price}
                  onChange={(e) => handleInputChange("monthly_price", e.target.value)}
                  placeholder="2400.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
            <CardDescription>Physical and technical details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dimensions_width">Width (feet)</Label>
                <Input
                  id="dimensions_width"
                  type="number"
                  step="0.1"
                  value={formData.dimensions_width}
                  onChange={(e) => handleInputChange("dimensions_width", e.target.value)}
                  placeholder="14"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions_height">Height (feet)</Label>
                <Input
                  id="dimensions_height"
                  type="number"
                  step="0.1"
                  value={formData.dimensions_height}
                  onChange={(e) => handleInputChange("dimensions_height", e.target.value)}
                  placeholder="48"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="illuminated"
                  checked={formData.illuminated}
                  onCheckedChange={(checked) => handleInputChange("illuminated", checked as boolean)}
                />
                <Label htmlFor="illuminated">Illuminated</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="digital"
                  checked={formData.digital}
                  onCheckedChange={(checked) => handleInputChange("digital", checked as boolean)}
                />
                <Label htmlFor="digital">Digital Display</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facing_direction">Facing Direction</Label>
                <Select
                  value={formData.facing_direction}
                  onValueChange={(value) => handleInputChange("facing_direction", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north">North</SelectItem>
                    <SelectItem value="south">South</SelectItem>
                    <SelectItem value="east">East</SelectItem>
                    <SelectItem value="west">West</SelectItem>
                    <SelectItem value="multiple">Multiple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audience & Performance</CardTitle>
            <CardDescription>Information about traffic and audience reach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="traffic_count">Daily Traffic Count</Label>
                <Input
                  id="traffic_count"
                  type="number"
                  value={formData.traffic_count}
                  onChange={(e) => handleInputChange("traffic_count", e.target.value)}
                  placeholder="50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility_score">Visibility Score (1-10)</Label>
                <Input
                  id="visibility_score"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.visibility_score}
                  onChange={(e) => handleInputChange("visibility_score", e.target.value)}
                  placeholder="8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demographics">Target Demographics</Label>
              <Textarea
                id="demographics"
                value={formData.demographics}
                onChange={(e) => handleInputChange("demographics", e.target.value)}
                placeholder="e.g., Urban professionals, ages 25-45, high income, commuters..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Optional information and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                placeholder="https://example.com/billboard-photo.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="available_from">Available From</Label>
                <Input
                  id="available_from"
                  type="date"
                  value={formData.available_from}
                  onChange={(e) => handleInputChange("available_from", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="available_until">Available Until</Label>
                <Input
                  id="available_until"
                  type="date"
                  value={formData.available_until}
                  onChange={(e) => handleInputChange("available_until", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending
              ? (isEdit ? "Updating..." : "Creating...")
              : (isEdit ? "Update Listing" : "Create Listing")
            }
          </Button>
        </div>
      </form>
    </div>
  );
}
