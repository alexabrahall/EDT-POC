"use client";
import { Check, ChevronsUpDown, Plane, CalendarIcon } from "lucide-react";
import type React from "react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDropdowns } from "./custom-dropdowns";

// Sample airports data - in a real app, this would come from an API
const airports = [
  { value: "lhr", label: "London Heathrow (LHR)", country: "United Kingdom" },
  { value: "cdg", label: "Paris Charles de Gaulle (CDG)", country: "France" },
  { value: "jfk", label: "New York JFK (JFK)", country: "United States" },
  { value: "dxb", label: "Dubai International (DXB)", country: "UAE" },
];




export default function FlightSearch() {
  const router = useRouter();
  const [departureOpen, setDepartureOpen] = useState(false);
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [isMonthSelection, setIsMonthSelection] = useState(false);
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [month, setMonth] = useState<Date>(new Date());

  // Create a Date object for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Function to disable dates before tomorrow
  const disablePastDates = (date: Date) => {
    return date < tomorrow;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!departure || !date) {
      alert("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Create search params
    const params = new URLSearchParams({
      departure,
      destination,
      date: date.toISOString(),
      weekendOnly: weekendOnly.toString(),
      adults: adults.toString(),
      children: children.toString(),
      isMonthSelection: isMonthSelection.toString(),
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-between text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {date
                        ? isMonthSelection
                          ? format(date, "MMMM yyyy")
                          : format(date, "PPP")
                        : "Pick a date"}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Date Selection</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="weekend-only"
                            checked={weekendOnly}
                            onCheckedChange={(checked) => {
                              setWeekendOnly(checked === true);
                            }}
                          />
                          <Label htmlFor="weekend-only" className="text-sm">
                            Weekend only
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-3 border-b">
                    <div>
                      <Label htmlFor="adults" className="text-sm font-medium">
                        Adults
                      </Label>
                      <Select
                        value={adults.toString()}
                        onValueChange={(value) =>
                          setAdults(Number.parseInt(value))
                        }
                      >
                        <SelectTrigger id="adults" className="mt-1">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="children" className="text-sm font-medium">
                        Children
                      </Label>
                      <Select
                        value={children.toString()}
                        onValueChange={(value) =>
                          setChildren(Number.parseInt(value))
                        }
                      >
                        <SelectTrigger id="children" className="mt-1">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Select by:</Label>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "text-xs",
                            !isMonthSelection &&
                              "bg-primary text-primary-foreground"
                          )}
                          onClick={() => setIsMonthSelection(false)}
                          type="button"
                        >
                          Day
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "text-xs",
                            isMonthSelection &&
                              "bg-primary text-primary-foreground"
                          )}
                          onClick={() => setIsMonthSelection(true)}
                          type="button"
                        >
                          Month
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isMonthSelection ? (
                    <div className={cn("p-3")}>
                      <div className="space-y-4">
                        <CustomDropdowns
                          currMonth={month}
                          setCurrMonth={setMonth}
                        />

                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => {
                              // if (props.onSelect) {
                              //   const firstDay = new Date(
                              //     month.getFullYear(),
                              //     month.getMonth(),
                              //     1
                              //   );
                              //   props.onSelect(firstDay);
                              // }
                            }}
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              "justify-start text-left font-normal",
                              "hover:bg-primary hover:text-primary-foreground"
                            )}
                          >
                            {format(month, "MMMM yyyy")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Calendar
                      mode={"single"}
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={disablePastDates}
                    />
                  )}
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
