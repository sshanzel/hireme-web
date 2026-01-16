"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, logout } = useAuthContext();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <h1 className="text-xl font-semibold">HireMe.dev</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.name || user?.email}
              </span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-semibold">Welcome, {user?.name || "there"}!</h2>
          <p className="mt-2 text-muted-foreground">
            Start preparing for your next interview.
          </p>
        </main>
      </div>
    </ProtectedRoute>
  );
}
