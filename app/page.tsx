"use client";

import { AppLayout } from "@/components/AppLayout";
import { useAuthContext } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user } = useAuthContext();

  return (
    <AppLayout>
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome, {user?.name || "there"}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Start preparing for your next interview.
        </p>
      </div>
    </AppLayout>
  );
}
