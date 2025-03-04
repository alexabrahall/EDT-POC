"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Plane,
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { useRouter } from "next/navigation";
import { formatDate } from "../utils/utils";

// Fake flight data
const flights = [
  {
    id: 1,
    airline: "SkyWings",
    departureTime: "06:00",
    arrivalTime: "08:30",
    duration: "2h 30m",
    returnDepartureTime: "20:15",
    returnArrivalTime: "22:45",
    returnDuration: "2h 30m",
    price: 89,
    returnPrice: 95,
    totalPrice: 184,
    direct: true,
    airlineCode: "SW",
    flightNumber: "SW123",
    returnFlightNumber: "SW124",
    destination: "Paris, France",
    outboundDate: "2023-07-15",
    returnDate: "2023-07-22",
  },
  {
    id: 2,
    airline: "AirConnect",
    departureTime: "07:15",
    arrivalTime: "10:00",
    duration: "2h 45m",
    returnDepartureTime: "18:30",
    returnArrivalTime: "21:15",
    returnDuration: "2h 45m",
    price: 112,
    returnPrice: 118,
    totalPrice: 230,
    direct: true,
    airlineCode: "AC",
    flightNumber: "AC456",
    returnFlightNumber: "AC457",
    destination: "Berlin, Germany",
    outboundDate: "2023-07-16",
    returnDate: "2023-07-23",
  },
  {
    id: 3,
    airline: "JetSpeed",
    departureTime: "09:00",
    arrivalTime: "11:30",
    duration: "2h 30m",
    returnDepartureTime: "19:45",
    returnArrivalTime: "22:15",
    returnDuration: "2h 30m",
    price: 98,
    returnPrice: 102,
    totalPrice: 200,
    direct: true,
    airlineCode: "JS",
    flightNumber: "JS321",
    returnFlightNumber: "JS322",
    destination: "Rome, Italy",
    outboundDate: "2023-07-17",
    returnDate: "2023-07-24",
  },
  {
    id: 4,
    airline: "FlyFast",
    departureTime: "10:45",
    arrivalTime: "13:00",
    duration: "2h 15m",
    returnDepartureTime: "21:00",
    returnArrivalTime: "23:15",
    returnDuration: "2h 15m",
    price: 120,
    returnPrice: 125,
    totalPrice: 245,
    direct: true,
    airlineCode: "FF",
    flightNumber: "FF654",
    returnFlightNumber: "FF655",
    destination: "Madrid, Spain",
    outboundDate: "2023-07-18",
    returnDate: "2023-07-25",
  },
  {
    id: 5,
    airline: "SkyWings",
    departureTime: "12:30",
    arrivalTime: "15:00",
    duration: "2h 30m",
    returnDepartureTime: "17:45",
    returnArrivalTime: "20:15",
    returnDuration: "2h 30m",
    price: 105,
    returnPrice: 110,
    totalPrice: 215,
    direct: true,
    airlineCode: "SW",
    flightNumber: "SW789",
    returnFlightNumber: "SW790",
    destination: "Amsterdam, Netherlands",
    outboundDate: "2023-07-19",
    returnDate: "2023-07-26",
  },
  {
    id: 6,
    airline: "AirConnect",
    departureTime: "14:00",
    arrivalTime: "16:45",
    duration: "2h 45m",
    returnDepartureTime: "19:30",
    returnArrivalTime: "22:15",
    returnDuration: "2h 45m",
    price: 95,
    returnPrice: 100,
    totalPrice: 195,
    direct: true,
    airlineCode: "AC",
    flightNumber: "AC987",
    returnFlightNumber: "AC988",
    destination: "Vienna, Austria",
    outboundDate: "2023-07-20",
    returnDate: "2023-07-27",
  },
  {
    id: 7,
    airline: "JetSpeed",
    departureTime: "15:30",
    arrivalTime: "18:00",
    duration: "2h 30m",
    returnDepartureTime: "20:30",
    returnArrivalTime: "23:00",
    returnDuration: "2h 30m",
    price: 110,
    returnPrice: 115,
    totalPrice: 225,
    direct: true,
    airlineCode: "JS",
    flightNumber: "JS852",
    returnFlightNumber: "JS853",
    destination: "Lisbon, Portugal",
    outboundDate: "2023-07-21",
    returnDate: "2023-07-28",
  },
  {
    id: 8,
    airline: "FlyFast",
    departureTime: "17:00",
    arrivalTime: "19:30",
    duration: "2h 30m",
    returnDepartureTime: "22:00",
    returnArrivalTime: "00:30",
    returnDuration: "2h 30m",
    price: 130,
    returnPrice: 135,
    totalPrice: 265,
    direct: true,
    airlineCode: "FF",
    flightNumber: "FF753",
    returnFlightNumber: "FF754",
    destination: "Copenhagen, Denmark",
    outboundDate: "2023-07-22",
    returnDate: "2023-07-29",
  },
  {
    id: 9,
    airline: "SkyWings",
    departureTime: "18:45",
    arrivalTime: "21:15",
    duration: "2h 30m",
    returnDepartureTime: "16:30",
    returnArrivalTime: "19:00",
    returnDuration: "2h 30m",
    price: 85,
    returnPrice: 90,
    totalPrice: 175,
    direct: true,
    airlineCode: "SW",
    flightNumber: "SW159",
    returnFlightNumber: "SW160",
    destination: "Brussels, Belgium",
    outboundDate: "2023-07-23",
    returnDate: "2023-07-30",
  },
  {
    id: 10,
    airline: "AirConnect",
    departureTime: "20:00",
    arrivalTime: "22:30",
    duration: "2h 30m",
    returnDepartureTime: "18:00",
    returnArrivalTime: "20:30",
    returnDuration: "2h 30m",
    price: 140,
    returnPrice: 145,
    totalPrice: 285,
    direct: true,
    airlineCode: "AC",
    flightNumber: "AC753",
    returnFlightNumber: "AC754",
    destination: "Stockholm, Sweden",
    outboundDate: "2023-07-24",
    returnDate: "2023-07-31",
  },
];

export default function FlightResults() {
  const [maxPrice, setMaxPrice] = useState(200);
  const [directOnly, setDirectOnly] = useState(false);
  const [sortBy, setSortBy] = useState("price");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter and sort flights
  const filteredFlights = flights
    .filter((flight) => flight.price <= maxPrice)
    .filter((flight) => !directOnly || flight.direct)
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "duration") return a.duration.localeCompare(b.duration);
      if (sortBy === "departure")
        return a.departureTime.localeCompare(b.departureTime);
      return 0;
    });

  const FiltersContent = () => (
    <>
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Filters</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Maximum Price</Label>
              <div className="space-y-4">
                <Slider
                  value={[maxPrice]}
                  onValueChange={(value) => setMaxPrice(value[0])}
                  max={500}
                  step={10}
                />
                <div className="text-sm text-muted-foreground">
                  Up to £{maxPrice}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sort by</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="departure">Departure Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Airlines</h2>
          <div className="space-y-2">
            {Array.from(new Set(flights.map((f) => f.airline))).map(
              (airline) => (
                <div key={airline} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={airline}
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                  <Label htmlFor={airline}>{airline}</Label>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Destinations</h2>
          <div className="space-y-2">
            {Array.from(new Set(flights.map((f) => f.destination))).map(
              (destination) => (
                <div key={destination} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={destination}
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                  <Label htmlFor={destination}>{destination}</Label>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );

  let router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      

      <main className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between my-2">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              London → Paris • Thu 27 Mar • 1 Adult
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push("/");
            }}
          >
            Modify Search
          </Button>
        </div>
        <div className="md:hidden mb-4">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                {isFiltersOpen ? (
                  <>
                    Hide Filters <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show Filters <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <FiltersContent />
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="grid gap-6 md:grid-cols-[280px,1fr]">
          <div className="hidden md:block space-y-6">
            <FiltersContent />
          </div>

          <div className="space-y-4">
            {filteredFlights.map((flight) => (
              <Card key={flight.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{flight.destination}</div>
                      <div className="text-sm text-muted-foreground">
                        {flight.airline}
                      </div>
                    </div>

                    {/* Outbound Flight */}
                    <div className="flex items-center space-x-4">
                      <div className="grid text-center">
                        <span className="font-semibold">
                          {flight.departureTime}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          LHR
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-sm text-muted-foreground mb-2">
                          {flight.duration}
                        </div>
                        <div className="w-full flex items-center">
                          <div className="h-[2px] flex-1 bg-border" />
                          <Plane className="h-4 w-4 mx-2 rotate-90" />
                          <div className="h-[2px] flex-1 bg-border" />
                        </div>
                      </div>
                      <div className="grid text-center">
                        <span className="font-semibold">
                          {flight.arrivalTime}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          CDG
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border my-2 w-1/2 mx-auto" />

                    {/* Return Flight */}
                    <div className="flex items-center space-x-4">
                      <div className="grid text-center">
                        <span className="font-semibold">
                          {flight.returnDepartureTime}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          CDG
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-sm text-muted-foreground mb-2">
                          {flight.returnDuration}
                        </div>
                        <div className="w-full flex items-center">
                          <div className="h-[2px] flex-1 bg-border" />
                          <Plane className="h-4 w-4 mx-2 -rotate-90" />
                          <div className="h-[2px] flex-1 bg-border" />
                        </div>
                      </div>
                      <div className="grid text-center">
                        <span className="font-semibold">
                          {flight.returnArrivalTime}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          LHR
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-row flex-col sm:justify-between items-center mt-4">
                      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(new Date(flight.outboundDate))}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-bold sm:text-xl">
                          From £{flight.totalPrice}
                        </div>
                        <Button
                          className="min-w-[140px]"
                          onClick={() => {
                            router.push(`/details?flight=${flight.id}`);
                          }}
                        >
                          Select <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
