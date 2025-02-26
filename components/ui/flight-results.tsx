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
import { ArrowRight, Plane } from "lucide-react";
import { useState } from "react";

// Fake flight data
const flights = [
  {
    id: 1,
    airline: "SkyWings",
    departureTime: "06:00",
    arrivalTime: "08:30",
    duration: "2h 30m",
    price: 89,
    direct: true,
    airlineCode: "SW",
    flightNumber: "SW123",
  },
  {
    id: 2,
    airline: "AirConnect",
    departureTime: "07:15",
    arrivalTime: "10:00",
    duration: "2h 45m",
    price: 112,
    direct: true,
    airlineCode: "AC",
    flightNumber: "AC456",
  },
  {
    id: 3,
    airline: "JetSpeed",
    departureTime: "08:30",
    arrivalTime: "11:45",
    duration: "3h 15m",
    price: 75,
    direct: false,
    stops: ["Paris"],
    airlineCode: "JS",
    flightNumber: "JS789",
  },
  {
    id: 4,
    airline: "SkyWings",
    departureTime: "10:00",
    arrivalTime: "12:15",
    duration: "2h 15m",
    price: 95,
    direct: true,
    airlineCode: "SW",
    flightNumber: "SW456",
  },
  {
    id: 5,
    airline: "AirConnect",
    departureTime: "11:30",
    arrivalTime: "14:15",
    duration: "2h 45m",
    price: 82,
    direct: false,
    stops: ["Amsterdam"],
    airlineCode: "AC",
    flightNumber: "AC789",
  },
  {
    id: 6,
    airline: "JetSpeed",
    departureTime: "13:00",
    arrivalTime: "15:30",
    duration: "2h 30m",
    price: 135,
    direct: true,
    airlineCode: "JS",
    flightNumber: "JS456",
  },
];

export default function FlightResults() {
  const [maxPrice, setMaxPrice] = useState(200);
  const [directOnly, setDirectOnly] = useState(false);
  const [sortBy, setSortBy] = useState("price");

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Plane className="h-6 w-6" />
                <span className="text-xl font-bold">DayTripper</span>
              </div>
              <div className="text-sm text-muted-foreground">
                London (LHR) → Paris • Thu 27 Mar • 1 Adult
              </div>
            </div>
            <Button variant="outline" size="sm">
              Modify Search
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[280px,1fr]">
          <div className="space-y-6">
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
                        Up to ${maxPrice}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="direct-only"
                      checked={directOnly}
                      onCheckedChange={setDirectOnly}
                    />
                    <Label htmlFor="direct-only">Direct flights only</Label>
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
                        <SelectItem value="departure">
                          Departure Time
                        </SelectItem>
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
                      <div
                        key={airline}
                        className="flex items-center space-x-2"
                      >
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
          </div>

          <div className="space-y-4">
            {filteredFlights.map((flight) => (
              <Card key={flight.id}>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-[1fr,auto]">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="font-semibold">{flight.airline}</div>
                        <div className="text-sm text-muted-foreground">
                          {flight.airlineCode} {flight.flightNumber}
                        </div>
                      </div>
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
                          {!flight.direct && (
                            <div className="text-sm text-muted-foreground mt-2">
                              1 stop ({flight.stops?.[0]})
                            </div>
                          )}
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
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="text-2xl font-bold">${flight.price}</div>
                      <Button className="min-w-[140px]">
                        Select <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
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
