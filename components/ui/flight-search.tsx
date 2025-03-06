"use client";
import { Check, ChevronsUpDown, Plane, CalendarIcon } from "lucide-react";
import type React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Heart, MessageCircle, Share2 } from "lucide-react";

// Sample airports data - in a real app, this would come from an API
const airports = [
  { value: "lhr", label: "London Heathrow (LHR)", country: "United Kingdom" },
  { value: "cdg", label: "Paris Charles de Gaulle (CDG)", country: "France" },
  { value: "jfk", label: "New York JFK (JFK)", country: "United States" },
  { value: "dxb", label: "Dubai International (DXB)", country: "UAE" },
];

// Sample feed data
const sampleFeedData = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg",
      level: "Elite Explorer",
    },
    trip: {
      city: "Paris",
      duration: "12 hours",
      highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame"],
      image: "/cities/paris.jpg",
    },
    stats: {
      likes: 234,
      comments: 45,
    },
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Mike Chen",
      avatar: "/avatars/mike.jpg",
      level: "Day Trip Pro",
    },
    trip: {
      city: "Amsterdam",
      duration: "10 hours",
      highlights: ["Van Gogh Museum", "Anne Frank House", "Canal Cruise"],
      image: "/cities/amsterdam.jpg",
    },
    stats: {
      likes: 189,
      comments: 32,
    },
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Emma Wilson",
      avatar: "/avatars/emma.jpg",
      level: "Weekend Warrior",
    },
    trip: {
      city: "Barcelona",
      duration: "14 hours",
      highlights: ["Sagrada Familia", "Park Güell", "La Rambla"],
      image: "/cities/barcelona.jpg",
    },
    stats: {
      likes: 312,
      comments: 67,
    },
    timestamp: "1 day ago",
  },
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
  const [children, setChildren] = useState(1);
  const [month, setMonth] = useState<Date>(new Date());
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [itineraryCity, setItineraryCity] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [feedPosts, setFeedPosts] = useState(sampleFeedData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);

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

  const handleGenerateItinerary = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      setItinerary(`Here's your perfect day in ${itineraryCity}:

Morning:
• 9:00 AM - Arrive at ${itineraryCity} Airport
• 10:00 AM - Check into hotel and freshen up
• 11:00 AM - Visit the historic city center
• 12:30 PM - Lunch at a local restaurant

Afternoon:
• 2:00 PM - Explore the main attractions
• 4:00 PM - Coffee break at a charming café
• 5:00 PM - Shopping in the local markets
• 6:30 PM - Pre-dinner drinks at a rooftop bar

Evening:
• 7:30 PM - Dinner at a traditional restaurant
• 9:00 PM - Head back to the airport
• 10:00 PM - Departure flight

This itinerary maximizes your time in ${itineraryCity} while ensuring you catch your return flight.`);
      setIsGenerating(false);
    }, 2000);
  };

  const loadMorePosts = () => {
    console.log("loadMorePosts");
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    // Simulate API call
    setTimeout(() => {
      const newPosts = sampleFeedData.map((post) => ({
        ...post,
        id: post.id + feedPosts.length,
      }));
      setFeedPosts((prev) => [...prev, ...newPosts]);
      setIsLoadingMore(false);

      // Simulate reaching the end after 3 loads
      if (feedPosts.length >= 9) {
        setHasMore(false);
      }
    }, 1000);
  };

  useEffect(() => {
    console.log("Setting up intersection observer");
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        console.log(
          "Intersection:",
          target.isIntersecting,
          "Loading:",
          isLoadingMore,
          "HasMore:",
          hasMore
        );
        if (target.isIntersecting) {
          console.log("Triggering loadMorePosts");
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = feedRef.current;
    if (currentRef) {
      console.log("Observing element");
      observer.observe(currentRef);
    }

    return () => {
      // if (currentRef) {
      //   observer.unobserve(currentRef);
      // }
    };
  }, [isLoadingMore, hasMore]);

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

        <Tabs defaultValue="search" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="search">Search Flights</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary Generator</TabsTrigger>
            <TabsTrigger value="feed">Your Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
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
                                value={airport.value}
                                onSelect={(currentValue) => {
                                  setDeparture(
                                    currentValue === departure
                                      ? ""
                                      : currentValue
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
                                  1
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
                      onValueChange={(value) =>
                        setAdults(Number.parseInt(value))
                      }
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
                        const option = options.find(
                          (opt) => opt.value === value
                        );
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
          </TabsContent>

          <TabsContent value="itinerary">
            <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4">
                Itinerary Generator
              </h2>
              <p className="text-muted-foreground mb-6">
                Fill in the boxes below and our DayTrippr AI will generate the
                perfect itinerary to make the most of your day.
              </p>

              <form onSubmit={handleGenerateItinerary} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      placeholder="Enter city name"
                      value={itineraryCity}
                      onChange={(e) => setItineraryCity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrival" className="text-sm font-medium">
                      Arrival Time
                    </Label>
                    <Input
                      id="arrival"
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departure" className="text-sm font-medium">
                      Departure Time
                    </Label>
                    <Input
                      id="departure"
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin mr-2">◌</span>
                      Generating your perfect day...
                    </>
                  ) : (
                    "Generate Itinerary"
                  )}
                </Button>
              </form>

              {itinerary && (
                <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-4">Your Perfect Day</h3>
                  <div className="whitespace-pre-line text-sm">{itinerary}</div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="feed">
            <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4">Your Feed</h2>
              <p className="text-muted-foreground mb-6">
                See what amazing day trips your friends are taking
              </p>

              <div className="relative">
                <div className="h-[600px] overflow-y-auto pr-2">
                  <div className="space-y-6">
                    {feedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              {post.user.avatar ? (
                                <img
                                  src={post.user.avatar}
                                  alt={post.user.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-semibold">
                                  {post.user.name[0]}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {post.user.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {post.user.level}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {post.timestamp}
                          </div>
                        </div>

                        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                          {post.trip.image ? (
                            <img
                              src={post.trip.image}
                              alt={post.trip.city}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <Plane className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              {post.trip.city}
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-1" />
                              {post.trip.duration}
                            </div>
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">Highlights:</span>{" "}
                            {post.trip.highlights.join(" • ")}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center text-sm text-muted-foreground hover:text-primary">
                                <Heart className="h-4 w-4 mr-1" />
                                {post.stats.likes}
                              </button>
                              <button className="flex items-center text-sm text-muted-foreground hover:text-primary">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {post.stats.comments}
                              </button>
                              <button className="flex items-center text-sm text-muted-foreground hover:text-primary">
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div
                      ref={feedRef}
                      className="h-20 flex items-center justify-center mt-4"
                    >
                      {isLoadingMore && (
                        <div className="flex items-center text-muted-foreground">
                          <span className="animate-spin mr-2">◌</span>
                          Loading more trips...
                        </div>
                      )}
                      {!hasMore && feedPosts.length > 3 && (
                        <div className="text-muted-foreground">
                          No more trips to load
                        </div>
                      )}
                    </div>{" "}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
