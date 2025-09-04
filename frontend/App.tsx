import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "./components/Dashboard";
import InventoryForm from "./components/InventoryForm";
import InventoryList from "./components/InventoryList";
import InventoryDetails from "./components/InventoryDetails";
import Layout from "./components/Layout";
import { ClerkProvider } from "@clerk/clerk-react";
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import { clerkPublishableKey } from "./config";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryList />} />
              <Route path="/inventory/new" element={<InventoryForm />} />
              <Route path="/inventory/:id" element={<InventoryDetails />} />
              <Route path="/inventory/:id/edit" element={<InventoryForm />} />
              <Route path="/sign-in/*" element={<SignInPage />} />
              <Route path="/sign-up/*" element={<SignUpPage />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
