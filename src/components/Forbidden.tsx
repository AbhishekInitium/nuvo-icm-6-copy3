
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <ShieldOff className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground mt-2 mb-6 max-w-md">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate(-1)}>Go Back</Button>
        <Button variant="outline" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </div>
    </div>
  );
}
