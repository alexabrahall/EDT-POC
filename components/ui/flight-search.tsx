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
import { useEffect, useState } from "react";
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
  { value: "LHR", label: "London Heathrow (LHR)", country: "United Kingdom" },
  { value: "LGW", label: "London Gatwick (LGW)", country: "United Kingdom" },
  { value: "LTN", label: "London Luton (LTN)", country: "United Kingdom" },
  { value: "STN", label: "London Stansted (STN)", country: "United Kingdom" },
  { value: "SOU", label: "Southampton (SOU)", country: "United Kingdom" },
  { value: "MAN", label: "Manchester (MAN)", country: "United Kingdom" },
  { value: "BHX", label: "Birmingham (BHX)", country: "United Kingdom" },
  { value: "EDI", label: "Edinburgh (EDI)", country: "United Kingdom" },
  { value: "GLA", label: "Glasgow (GLA)", country: "United Kingdom" },
  { value: "BRS", label: "Bristol (BRS)", country: "United Kingdom" },
  { value: "NCL", label: "Newcastle (NCL)", country: "United Kingdom" },
  { value: "LBA", label: "Leeds Bradford (LBA)", country: "United Kingdom" },
  { value: "ABZ", label: "Aberdeen (ABZ)", country: "United Kingdom" },
  {
    value: "BFS",
    label: "Belfast International (BFS)",
    country: "United Kingdom",
  },
  { value: "CWL", label: "Cardiff (CWL)", country: "United Kingdom" },
  { value: "EXT", label: "Exeter (EXT)", country: "United Kingdom" },
  { value: "BOH", label: "Bournemouth (BOH)", country: "United Kingdom" },
  { value: "EMA", label: "East Midlands (EMA)", country: "United Kingdom" },
  { value: "HUY", label: "Humberside (HUY)", country: "United Kingdom" },
  { value: "INV", label: "Inverness (INV)", country: "United Kingdom" },
  { value: "NWI", label: "Norwich (NWI)", country: "United Kingdom" },
  { value: "PLH", label: "Plymouth (PLH)", country: "United Kingdom" },
  { value: "MME", label: "Teesside (MME)", country: "United Kingdom" },
  { value: "PIK", label: "Glasgow Prestwick (PIK)", country: "United Kingdom" },
  { value: "LDY", label: "Derry (LDY)", country: "United Kingdom" },
];

export default function FlightSearch() {
  const router = useRouter();
  const [departureOpen, setDepartureOpen] = useState(false);
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isMonthSelection, setIsMonthSelection] = useState(false);
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [month, setMonth] = useState<Date>(new Date());
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Create a Date object for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Function to disable dates before tomorrow
  const disablePastDates = (date: Date) => {
    return date < tomorrow;
  };

  const options = [
    { value: "zero", label: "0", numeric: 0 },
    { value: "one", label: "1", numeric: 1 },
    { value: "two", label: "2", numeric: 2 },
    { value: "three", label: "3", numeric: 3 },
    { value: "four", label: "4", numeric: 4 },
  ];

  useEffect(() => {
    setWeekendOnly(isMonthSelection);
  }, [isMonthSelection]);

  // Find the current option based on children value
  const currentOption =
    options.find((opt) => opt.numeric === children) || options[0];

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
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Find Your Ultimate Day Trip
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing destinations just a short flight away. Perfect for
            spontaneous adventures.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This is a proof of concept - not for real bookings currently
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="grid gap-6 p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm"
          >
            <div className="grid gap-6 md:grid-cols-[1fr,1fr,1fr,1fr,auto]">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Departure</Label>
                <Popover open={departureOpen} onOpenChange={setDepartureOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={departureOpen}
                      className="justify-between w-full"
                    >
                      {departure
                        ? airports.find(
                            (airport) => airport.value === departure
                          )?.label
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
                              value={airport.label}
                              onSelect={(currentValue) => {
                                const selectedAirport = airports.find(
                                  (a) => a.label === currentValue
                                );
                                setDeparture(selectedAirport?.value || "");
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
                              <div className="flex flex-col">
                                <span>{airport.label.split(" (")[0]}</span>
                                <span className="text-xs text-muted-foreground">
                                  {airport.value}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Date</Label>
                <Popover
                  open={datePopoverOpen}
                  onOpenChange={setDatePopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-between w-full text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {date
                          ? (isMonthSelection
                              ? format(date, "MMMM yyyy")
                              : format(date, "PPP")) +
                            (weekendOnly && isMonthSelection
                              ? " (Weekend Only)"
                              : "")
                          : "Pick a date"}
                      </div>
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-3 border-b"></div>

                    <div className="p-3 border-b">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Select by:
                        </Label>
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
                      <div className={cn("p-2")}>
                        <div className="">
                          <CustomDropdowns
                            currMonth={month}
                            setCurrMonth={(newMonth) => {
                              const firstDay = new Date(
                                newMonth.getFullYear(),
                                newMonth.getMonth(),
                                15
                              );
                              setDate(firstDay);
                              setMonth(newMonth);
                              // setDatePopoverOpen(false);
                            }}
                          />

                          <div className="flex flex-col p-3">
                            {isMonthSelection && (
                              <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted/50">
                                <Checkbox
                                  id="weekend-only"
                                  checked={weekendOnly}
                                  disabled
                                  onCheckedChange={(checked) => {
                                    setWeekendOnly(checked === true);
                                  }}
                                />
                                <Label
                                  htmlFor="weekend-only"
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  Weekend only
                                </Label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate);
                          // setDatePopoverOpen(false);
                        }}
                        initialFocus
                        disabled={disablePastDates}
                      />
                    )}

                    <Button
                      onClick={() => setDatePopoverOpen(false)}
                      className="w-full  text-center font-normal mx-auto"
                    >
                      Ok
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="adults" className="text-sm font-medium">
                    Adults
                  </Label>
                  <Select
                    value={adults.toString()}
                    onValueChange={(value) => setAdults(Number.parseInt(value))}
                  >
                    <SelectTrigger id="adults" className="w-full">
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

                <div className="space-y-2">
                  <Label htmlFor="children" className="text-sm font-medium">
                    Children
                  </Label>
                  <Select
                    value={currentOption.value}
                    onValueChange={(value) => {
                      const option = options.find((opt) => opt.value === value);
                      if (option) setChildren(option.numeric);
                    }}
                  >
                    <SelectTrigger id="children" className="w-full">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto self-end"
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
            </div>
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
