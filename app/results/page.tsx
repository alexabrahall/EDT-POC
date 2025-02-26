import FlightResults from "@/components/ui/flight-results";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <FlightResults />
    </Suspense>
  );
}
