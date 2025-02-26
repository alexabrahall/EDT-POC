"use client";
import { Check, ChevronsUpDown, Plane } from "lucide-react";
import type React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, 
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Sample airports data - in a real app, this would come from an API
const airports = [
  { value: "lhr", label: "London Heathrow (LHR)", country: "United Kingdom" },
  { value: "cdg", label: "Paris Charles de Gaulle (CDG)", country: "France" },
  { value: "jfk", label: "New York JFK (JFK)", country: "United States" },
  { value: "dxb", label: "Dubai International (DXB)", country: "UAE" },
];

const countries = [
  { value: "fr", label: "France", flag: "🇫🇷" },
  { value: "de", label: "Germany", flag: "🇩🇪" },
  { value: "it", label: "Italy", flag: "🇮🇹" },
  { value: "es", label: "Spain", flag: "🇪🇸" },
  { value: "pt", label: "Portugal", flag: "🇵🇹" },
];

export default function FlightSearch() {
  const router = useRouter();
  const [departureOpen, setDepartureOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!departure || !destination || !date) {
      alert("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Create search params
    const params = new URLSearchParams({
      departure,
      destination,
      date: date.toISOString(),
    });

    // Navigate to results page
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plane className="h-6 w-6" />
            <span className="text-xl font-bold">DayTripper</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-sm font-medium hover:underline">
              About
            </a>
            <a href="#" className="text-sm font-medium hover:underline">
              Destinations
            </a>
            <a href="#" className="text-sm font-medium hover:underline">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Find Your Ultimate Day Trip
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing destinations just a short flight away. Perfect for
            spontaneous adventures.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="grid gap-6 p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm"
          >
            <div className="grid gap-6 md:grid-cols-[1fr,1fr,auto]">
              <Popover open={departureOpen} onOpenChange={setDepartureOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={departureOpen}
                    className="justify-between"
                  >
                    {departure
                      ? airports.find((airport) => airport.value === departure)
                          ?.label
                      : "Departure Airport..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search airports..." />
                    <CommandList>
                      <CommandEmpty>No airport found.</CommandEmpty>
                      <CommandGroup>
                        {airports.map((airport) => (
                          <CommandItem
                            key={airport.value}
                            value={airport.value}
                            onSelect={(currentValue) => {
                              setDeparture(
                                currentValue === departure ? "" : currentValue
                              );
                              setDepartureOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                departure === airport.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {airport.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={destinationOpen}
                    className="justify-between"
                  >
                    {destination
                      ? countries.find(
                          (country) => country.value === destination
                        )?.label
                      : "Destination Country..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search countries..." />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map((country) => (
                          <CommandItem
                            key={country.value}
                            value={country.value}
                            onSelect={(currentValue) => {
                              setDestination(
                                currentValue === destination ? "" : currentValue
                              );
                              setDestinationOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                destination === country.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="mr-2">{country.flag}</span>
                            {country.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-between text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto md:ml-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Searching...
                </>
              ) : (
                "Search Flights"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Plane className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Quick Flights</h3>
            <p className="text-sm text-muted-foreground">
              Find the perfect destination within a few hours flight time.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Day Trips</h3>
            <p className="text-sm text-muted-foreground">
              Perfect for spontaneous one-day adventures.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Best Prices</h3>
            <p className="text-sm text-muted-foreground">
              Compare prices across multiple airlines.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
