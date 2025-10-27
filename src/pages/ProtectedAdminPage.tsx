import { useEffect, useState } from "react";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export default function ProtectedAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/check-auth", { credentials: "include" })
      .then((res) => setAuthorized(res.ok))
      .catch(() => setAuthorized(false));
  }, []);

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Checking access...</p>
      </div>
    );
  }
  
  if (!authorized) {
    window.location.href = "/admin/login";
    return null;
  }

  // 👇 Show the actual analytics dashboard
  return <AnalyticsDashboard />;
}