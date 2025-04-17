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
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate } from "../utils/utils";
import { Flight } from "@prisma/client";
import { format } from "date-fns";
import { DateTime } from "luxon";
// Sample airports data
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

export type ApiResponse = {
  routes: Array<{
    departure: {
      id: string;
      date: string;
      departureLocalTime: string;
      departureGMTTime: string;
      arrivalLocalTime: string;
      arrivalGMTTime: string;
      airline: string;
      flightNumber: string;
      createdAt: string;
      updatedAt: string;
      airportId: string;
      arrivalAirportId: string;
      slug: string;
      departureAirport: {
        id: string;
        name: string;
        code: string;
        city: string;
        country: string;
        createdAt: string;
        updatedAt: string;
        timezone: string;
      };
      arrivalAirport: {
        id: string;
        name: string;
        code: string;
        city: string;
        country: string;
        createdAt: string;
        updatedAt: string;
        timezone: string;
      };
    };
    return: {
      id: string;
      date: string;
      departureLocalTime: string;
      departureGMTTime: string;
      arrivalLocalTime: string;
      arrivalGMTTime: string;
      airline: string;
      flightNumber: string;
      createdAt: string;
      updatedAt: string;
      airportId: string;
      arrivalAirportId: string;
      slug: string;
      departureAirport: {
        id: string;
        name: string;
        code: string;
        city: string;
        country: string;
        createdAt: string;
        updatedAt: string;
        timezone: string;
      };
      arrivalAirport: {
        id: string;
        name: string;
        code: string;
        city: string;
        country: string;
        createdAt: string;
        updatedAt: string;
        timezone: string;
      };
    };
  }>;
  success: boolean;
};

// Fake flight data
// const flights = [
//   {
//     id: 1,
//     airline: "SkyWings",
//     departureTime: "06:00",
//     arrivalTime: "08:30",
//     duration: "2h 30m",
//     returnDepartureTime: "20:15",
//     returnArrivalTime: "22:45",
//     returnDuration: "2h 30m",
//     price: 89,
//     returnPrice: 95,
//     totalPrice: 184,
//     direct: true,
//     airlineCode: "SW",
//     flightNumber: "SW123",
//     returnFlightNumber: "SW124",
//     destination: "Paris, France",
//     outboundDate: "2023-07-15",
//     returnDate: "2023-07-22",
//   },
//   {
//     id: 2,
//     airline: "AirConnect",
//     departureTime: "07:15",
//     arrivalTime: "10:00",
//     duration: "2h 45m",
//     returnDepartureTime: "18:30",
//     returnArrivalTime: "21:15",
//     returnDuration: "2h 45m",
//     price: 112,
//     returnPrice: 118,
//     totalPrice: 230,
//     direct: true,
//     airlineCode: "AC",
//     flightNumber: "AC456",
//     returnFlightNumber: "AC457",
//     destination: "Berlin, Germany",
//     outboundDate: "2023-07-16",
//     returnDate: "2023-07-23",
//   },
//   {
//     id: 3,
//     airline: "JetSpeed",
//     departureTime: "09:00",
//     arrivalTime: "11:30",
//     duration: "2h 30m",
//     returnDepartureTime: "19:45",
//     returnArrivalTime: "22:15",
//     returnDuration: "2h 30m",
//     price: 98,
//     returnPrice: 102,
//     totalPrice: 200,
//     direct: true,
//     airlineCode: "JS",
//     flightNumber: "JS321",
//     returnFlightNumber: "JS322",
//     destination: "Rome, Italy",
//     outboundDate: "2023-07-17",
//     returnDate: "2023-07-24",
//   },
//   {
//     id: 4,
//     airline: "FlyFast",
//     departureTime: "10:45",
//     arrivalTime: "13:00",
//     duration: "2h 15m",
//     returnDepartureTime: "21:00",
//     returnArrivalTime: "23:15",
//     returnDuration: "2h 15m",
//     price: 120,
//     returnPrice: 125,
//     totalPrice: 245,
//     direct: true,
//     airlineCode: "FF",
//     flightNumber: "FF654",
//     returnFlightNumber: "FF655",
//     destination: "Madrid, Spain",
//     outboundDate: "2023-07-18",
//     returnDate: "2023-07-25",
//   },
//   {
//     id: 5,
//     airline: "SkyWings",
//     departureTime: "12:30",
//     arrivalTime: "15:00",
//     duration: "2h 30m",
//     returnDepartureTime: "17:45",
//     returnArrivalTime: "20:15",
//     returnDuration: "2h 30m",
//     price: 105,
//     returnPrice: 110,
//     totalPrice: 215,
//     direct: true,
//     airlineCode: "SW",
//     flightNumber: "SW789",
//     returnFlightNumber: "SW790",
//     destination: "Amsterdam, Netherlands",
//     outboundDate: "2023-07-19",
//     returnDate: "2023-07-26",
//   },
//   {
//     id: 6,
//     airline: "AirConnect",
//     departureTime: "14:00",
//     arrivalTime: "16:45",
//     duration: "2h 45m",
//     returnDepartureTime: "19:30",
//     returnArrivalTime: "22:15",
//     returnDuration: "2h 45m",
//     price: 95,
//     returnPrice: 100,
//     totalPrice: 195,
//     direct: true,
//     airlineCode: "AC",
//     flightNumber: "AC987",
//     returnFlightNumber: "AC988",
//     destination: "Vienna, Austria",
//     outboundDate: "2023-07-20",
//     returnDate: "2023-07-27",
//   },
//   {
//     id: 7,
//     airline: "JetSpeed",
//     departureTime: "15:30",
//     arrivalTime: "18:00",
//     duration: "2h 30m",
//     returnDepartureTime: "20:30",
//     returnArrivalTime: "23:00",
//     returnDuration: "2h 30m",
//     price: 110,
//     returnPrice: 115,
//     totalPrice: 225,
//     direct: true,
//     airlineCode: "JS",
//     flightNumber: "JS852",
//     returnFlightNumber: "JS853",
//     destination: "Lisbon, Portugal",
//     outboundDate: "2023-07-21",
//     returnDate: "2023-07-28",
//   },
//   {
//     id: 8,
//     airline: "FlyFast",
//     departureTime: "17:00",
//     arrivalTime: "19:30",
//     duration: "2h 30m",
//     returnDepartureTime: "22:00",
//     returnArrivalTime: "00:30",
//     returnDuration: "2h 30m",
//     price: 130,
//     returnPrice: 135,
//     totalPrice: 265,
//     direct: true,
//     airlineCode: "FF",
//     flightNumber: "FF753",
//     returnFlightNumber: "FF754",
//     destination: "Copenhagen, Denmark",
//     outboundDate: "2023-07-22",
//     returnDate: "2023-07-29",
//   },
//   {
//     id: 9,
//     airline: "SkyWings",
//     departureTime: "18:45",
//     arrivalTime: "21:15",
//     duration: "2h 30m",
//     returnDepartureTime: "16:30",
//     returnArrivalTime: "19:00",
//     returnDuration: "2h 30m",
//     price: 85,
//     returnPrice: 90,
//     totalPrice: 175,
//     direct: true,
//     airlineCode: "SW",
//     flightNumber: "SW159",
//     returnFlightNumber: "SW160",
//     destination: "Brussels, Belgium",
//     outboundDate: "2023-07-23",
//     returnDate: "2023-07-30",
//   },
//   {
//     id: 10,
//     airline: "AirConnect",
//     departureTime: "20:00",
//     arrivalTime: "22:30",
//     duration: "2h 30m",
//     returnDepartureTime: "18:00",
//     returnArrivalTime: "20:30",
//     returnDuration: "2h 30m",
//     price: 140,
//     returnPrice: 145,
//     totalPrice: 285,
//     direct: true,
//     airlineCode: "AC",
//     flightNumber: "AC753",
//     returnFlightNumber: "AC754",
//     destination: "Stockholm, Sweden",
//     outboundDate: "2023-07-24",
//     returnDate: "2023-07-31",
//   },
// ];

export default function FlightResults() {
  const [maxPrice, setMaxPrice] = useState(200);
  const [directOnly, setDirectOnly] = useState(false);
  const [sortBy, setSortBy] = useState("timeindestination");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [flights, setFlights] = useState<ApiResponse["routes"]>([]);
  const [loading, setLoading] = useState(true);
  const [departureAiport, setDepartureAiport] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    []
  );
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchFlights = async () => {
      const params = new URLSearchParams(window.location.search);
      const queryString = params.toString();
      const paramsObject = {};
      for (const [key, value] of params.entries()) {
        paramsObject[key] = value;
      }
      console.log("Query string:", queryString);
      console.log("Search params:", paramsObject);
      const response = await fetch("/api/search?" + queryString);
      const data = await response.json();
      setFlights(data.routes);
      // Initialize selected destinations with all available destinations
      const destinations = Array.from(
        new Set(
          data.routes.map(
            (f: ApiResponse["routes"][0]) => f.departure.arrivalAirport.city
          )
        )
      ) as string[];
      setSelectedDestinations(destinations);
      setLoading(false);
    };

    fetchFlights();

    const params = new URLSearchParams(window.location.search);
    const departure =
      airports
        .find((a) => a.value === params.get("departure"))
        ?.label?.split(" (")[0] || "Loading...";
    const date = params.get("date")
      ? format(new Date(params.get("date")!), "EEE dd MMM")
      : "";

    setDepartureAiport(departure);
    setDate(date);
  }, []);

  // Filter and sort flights
  const filteredFlights = flights
    .filter((flight) => {
      // Filter by destination
      if (
        selectedDestinations.length > 0 &&
        !selectedDestinations.includes(flight.departure.arrivalAirport.city)
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "departure")
        return (
          new Date(a.departure.departureGMTTime).getTime() -
          new Date(b.departure.departureGMTTime).getTime()
        );
      if (sortBy === "timeindestination") {
        const timeA =
          new Date(a.return.departureGMTTime).getTime() -
          new Date(a.departure.arrivalGMTTime).getTime();
        const timeB =
          new Date(b.return.departureGMTTime).getTime() -
          new Date(b.departure.arrivalGMTTime).getTime();
        return timeB - timeA; // Sort in descending order (longest stays first)
      }
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
                  <SelectItem value="departure">Departure Time</SelectItem>
                  <SelectItem value="timeindestination">
                    Time in destination
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Destinations</h2>
          <div className="space-y-2">
            {Array.from(
              new Set(flights.map((f) => f.departure.arrivalAirport.city))
            )
              .sort()
              .map((city) => (
                <div key={city} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`dest-${city}`}
                    className="rounded border-gray-300"
                    checked={selectedDestinations.includes(city)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDestinations([
                          ...selectedDestinations,
                          city,
                        ]);
                      } else {
                        setSelectedDestinations(
                          selectedDestinations.filter((d) => d !== city)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`dest-${city}`}>{city}</Label>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Airlines</h2>
          <div className="space-y-2">
            {Array.from(new Set(flights.map((f) => f.departure.airline)))
              .sort()
              .map((airline) => (
                <div key={airline} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={airline}
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                  <Label htmlFor={airline}>{airline}</Label>
                </div>
              ))}
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
              {(() => {
                return `From ${departureAiport} • ${date} `;
              })()}
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
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px] flex-col">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading...</p>
                <p className="text-muted-foreground">
                  This is a PoC - bugs are expected
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {Array.from(
                  new Set(
                    filteredFlights.map((f) => f.departure.arrivalAirport.city)
                  )
                ).map((city) => (
                  <AccordionItem key={city} value={city}>
                    <AccordionTrigger className="text-lg font-semibold text-center justify-center">
                      {city} -{" "}
                      {
                        filteredFlights.filter(
                          (flight) =>
                            flight.departure.arrivalAirport.city === city
                        ).length
                      }{" "}
                      flights • Avg{" "}
                      {(() => {
                        const cityFlights = filteredFlights.filter(
                          (flight) =>
                            flight.departure.arrivalAirport.city === city
                        );
                        const totalHours = cityFlights.reduce((acc, flight) => {
                          const arrivalTime = new Date(
                            flight.departure.arrivalLocalTime
                          );
                          const departureTime = new Date(
                            flight.return.departureLocalTime
                          );
                          const diffHours =
                            (departureTime.getTime() - arrivalTime.getTime()) /
                            (1000 * 60 * 60);
                          return acc + diffHours;
                        }, 0);
                        return `${Math.round(
                          totalHours / cityFlights.length
                        )}h`;
                      })()}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {filteredFlights
                          .filter(
                            (flight) =>
                              flight.departure.arrivalAirport.city === city
                          )
                          .map((flight) => (
                            <Card
                              key={flight.departure.slug + flight.return.slug}
                            >
                              <CardContent className="p-6">
                                <div className="flex flex-col space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="font-semibold">
                                      Day Trip -{" "}
                                      {flight.departure.departureAirport.city}{" "}
                                      -&gt;{" "}
                                      {flight.departure.arrivalAirport.city}
                                    </div>
                                  </div>

                                  {/* Outbound Flight */}
                                  <div className="flex items-center space-x-4">
                                    <div className="grid text-center">
                                      <span className="font-semibold">
                                        {DateTime.fromISO(
                                          flight.departure.departureGMTTime,
                                          { zone: "utc" }
                                        )
                                          .setZone(
                                            flight.departure.departureAirport
                                              .timezone
                                          )
                                          .toFormat("HH:mm")}
                                      </span>

                                      <span className="text-xs text-muted-foreground">
                                        {flight.departure.departureAirport.code}
                                      </span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center">
                                      <div className="text-sm text-muted-foreground mb-2">
                                        {flight.departure.airline}
                                        {" - "}
                                        {(() => {
                                          const departureTime = new Date(
                                            flight.departure.departureGMTTime
                                          );
                                          const arrivalTime = new Date(
                                            flight.departure.arrivalGMTTime
                                          );
                                          const diffHours = Math.floor(
                                            (arrivalTime.getTime() -
                                              departureTime.getTime()) /
                                              (1000 * 60 * 60)
                                          );
                                          const diffMinutes = Math.floor(
                                            ((arrivalTime.getTime() -
                                              departureTime.getTime()) %
                                              (1000 * 60 * 60)) /
                                              (1000 * 60)
                                          );
                                          return `${diffHours}h ${diffMinutes}m`;
                                        })()}
                                      </div>
                                      <div className="w-full flex items-center">
                                        <div className="h-[2px] flex-1 bg-border" />
                                        <Plane className="h-4 w-4 mx-2 rotate-90" />
                                        <div className="h-[2px] flex-1 bg-border" />
                                      </div>
                                    </div>
                                    <div className="grid text-center">
                                      <span className="font-semibold">
                                        {DateTime.fromISO(
                                          flight.departure.arrivalGMTTime,
                                          { zone: "utc" }
                                        )
                                          .setZone(
                                            flight.departure.arrivalAirport
                                              .timezone
                                          )
                                          .toFormat("HH:mm")}
                                      </span>

                                      <span className="text-xs text-muted-foreground">
                                        {flight.departure.arrivalAirport.code}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Divider with Time at Destination */}
                                  <div className="relative border-t border-border my-2 w-1/2 mx-auto">
                                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-xs text-muted-foreground">
                                      {(() => {
                                        const arrivalTime = new Date(
                                          flight.departure.arrivalGMTTime
                                        );
                                        const departureTime = new Date(
                                          flight.return.departureGMTTime
                                        );
                                        const diffHours = Math.round(
                                          (departureTime.getTime() -
                                            arrivalTime.getTime()) /
                                            (1000 * 60 * 60)
                                        );
                                        return `${diffHours} hours at destination`;
                                      })()}
                                    </div>
                                  </div>

                                  {/* Return Flight */}
                                  <div className="flex items-center space-x-4">
                                    <div className="grid text-center">
                                      <span className="font-semibold">
                                        {DateTime.fromISO(
                                          flight.return.departureGMTTime,
                                          { zone: "utc" }
                                        )
                                          .setZone(
                                            flight.return.arrivalAirport
                                              .timezone
                                          )
                                          .toFormat("HH:mm")}
                                      </span>

                                      <span className="text-xs text-muted-foreground">
                                        {flight.return.departureAirport.code}
                                      </span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center">
                                      <div className="text-sm text-muted-foreground mb-2">
                                        {flight.departure.airline}
                                        {" - "}
                                        {(() => {
                                          const departureTime = new Date(
                                            flight.departure.departureGMTTime
                                          );
                                          const arrivalTime = new Date(
                                            flight.departure.arrivalGMTTime
                                          );
                                          const diffHours = Math.floor(
                                            (arrivalTime.getTime() -
                                              departureTime.getTime()) /
                                              (1000 * 60 * 60)
                                          );
                                          const diffMinutes = Math.floor(
                                            ((arrivalTime.getTime() -
                                              departureTime.getTime()) %
                                              (1000 * 60 * 60)) /
                                              (1000 * 60)
                                          );
                                          return `${diffHours}h ${diffMinutes}m`;
                                        })()}
                                      </div>
                                      <div className="w-full flex items-center">
                                        <div className="h-[2px] flex-1 bg-border" />
                                        <Plane className="h-4 w-4 mx-2 -rotate-90" />
                                        <div className="h-[2px] flex-1 bg-border" />
                                      </div>
                                    </div>
                                    <div className="grid text-center">
                                      <span className="font-semibold">
                                        {DateTime.fromISO(
                                          flight.return.arrivalGMTTime,
                                          { zone: "utc" }
                                        )
                                          .setZone(
                                            flight.return.arrivalAirport
                                              .timezone
                                          )
                                          .toFormat("HH:mm")}
                                      </span>

                                      <span className="text-xs text-muted-foreground">
                                        {flight.return.arrivalAirport.code}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex sm:flex-row  justify-between items-center mt-4">
                                    <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">
                                        {formatDate(
                                          new Date(flight.departure.date)
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <Button
                                        className="min-w-[140px]"
                                        onClick={() => {
                                          router.push(
                                            `/details?outbound=${flight.departure.id}&return=${flight.return.id}`
                                          );
                                        }}
                                      >
                                        Select{" "}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
