import { Plane } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Plane className="h-6 w-6" />
              <span className="text-xl font-bold">DayTrippr</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
