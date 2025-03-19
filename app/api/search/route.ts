import axios from "axios";
import { z } from "zod";
import prisma from "@/prisma/prisma";
import moment from "moment-timezone";
import { Airport } from "@prisma/client";

// Add request timeout
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Add connection pool size
const MAX_CONCURRENT_REQUESTS = 1;

// Add semaphore for controlling concurrent requests
let activeRequests = 0;
const requestQueue: (() => void)[] = [];

// Add airport cache
let airportCache: Map<string, Airport> = new Map();

async function initializeAirportCache() {
  if (airportCache === null) {
    const airports = await prisma.airport.findMany();
    airportCache = new Map(airports.map((airport) => [airport.code, airport]));
  }
  return airportCache;
}

async function getAirport(iata: string) {
  if (!iata) {
    return null;
  }

  let airport = airportCache.get(iata);
  if (airport) {
    return airport;
  }

  airport = await prisma.airport.findUnique({
    where: {
      code: iata,
    },
  });

  if (airport) {
    airportCache.set(iata, airport);
    return airport;
  }

  console.log(`Getting Airport: ${iata}`);
  let resp = await axios.get(
    `https://iata-airports.p.rapidapi.com/airports/${iata}/`,
    {
      headers: {
        "x-rapidapi-key": "81ed9cb398msh399a5fccc6b1cebp1320dejsn66e2049aceff",
        "x-rapidapi-host": "iata-airports.p.rapidapi.com",
      },
    }
  );

  const airportData = resp.data as AirportResponse;

  let newAirport = await prisma.airport.create({
    data: {
      code: airportData.code,
      name: airportData.name,
      city: airportData.city || "",
      country: airportData.country || "",
      timezone: airportData.time_zone || "",
    },
  });

  airportCache.set(iata, newAirport);
  return newAirport;
}

async function acquireRequest() {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise<void>((resolve) => requestQueue.push(resolve));
  }
  activeRequests++;
}

function releaseRequest() {
  activeRequests--;
  const next = requestQueue.shift();
  if (next) next();
}

const searchParamsSchema = z.object({
  departure: z.string().min(3),
  date: z.string().datetime(),
  destination: z.string().optional(),
  weekendOnly: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  adults: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  children: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  isMonthSelection: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export type Root = {
  departures: Array<{
    departure: {
      scheduledTime: {
        utc: string;
        local: string;
      };
      quality: Array<string>;
    };
    arrival: {
      airport: {
        icao: string;
        iata: string;
        name: string;
        timeZone: string;
      };
      scheduledTime: {
        utc: string;
        local: string;
      };
      quality: Array<string>;
      terminal?: string;
    };
    number: string;
    status: string;
    codeshareStatus: string;
    isCargo: boolean;
    aircraft: {
      model: string;
    };
    airline: {
      name: string;
      iata: string;
      icao: string;
    };
  }>;
  arrivals: Array<{
    departure: {
      airport: {
        icao?: string;
        iata?: string;
        name: string;
        timeZone?: string;
      };
      scheduledTime?: {
        utc: string;
        local: string;
      };
      quality: Array<string>;
      terminal?: string;
    };
    arrival: {
      scheduledTime: {
        utc: string;
        local: string;
      };
      quality: Array<string>;
    };
    number: string;
    status: string;
    codeshareStatus: string;
    isCargo: boolean;
    aircraft: {
      model: string;
    };
    airline: {
      name: string;
      iata: string;
      icao: string;
    };
  }>;
};

export type AirportResponse = {
  code: string;
  icao: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  url: string;
  time_zone: string;
  city_code: string;
  country: string;
  city: string;
  state: string;
  county: string;
  type: string;
};

type Flight = {
  departure: {
    scheduledTime?: { utc: string; local: string };
    airport?: { iata?: string };
    airline?: { iata?: string; name?: string };
  };
  arrival: {
    scheduledTime: { utc: string; local: string };
    airport?: { iata?: string };
    airline?: { iata?: string; name?: string };
  };
  number: string;
  airline: { iata: string; name: string };
};

type FlightDb = {
  id: string;
  date: Date;
  departureLocalTime: Date;
  departureGMTTime: Date;
  arrivalLocalTime: Date;
  arrivalGMTTime: Date;
  airline: string;
  flightNumber: string;
  airportId: string;
  arrivalAirportId: string;
  departureAirport: {
    id: string;
    code: string;
    name: string;
    city: string;
    country: string;
  };
  arrivalAirport: {
    id: string;
    code: string;
    name: string;
    city: string;
    country: string;
  };
};

function transformToFlightDb(
  flight: Root["departures"][0] | Root["arrivals"][0],
  departureAirport: {
    id: string;
    code: string;
    name: string;
    city: string;
    country: string;
    timezone: string;
  },
  arrivalAirport: {
    id: string;
    code: string;
    name: string;
    city: string;
    country: string;
    timezone: string;
  },
  date: string
): FlightDb {
  // Helper function to parse dates that already include timezone offset
  const parseDateWithOffset = (dateStr: string, tz: string) => {
    if (!dateStr) return new Date();

    return new Date(dateStr + "Z");
  };

  return {
    id: Math.random().toString(36).substring(7), // Generate a random ID
    date: new Date(date),
    departureLocalTime: parseDateWithOffset(
      flight.departure.scheduledTime?.local || "",
      departureAirport.timezone
    ),
    departureGMTTime: new Date(flight.departure.scheduledTime?.utc || ""),
    arrivalLocalTime: parseDateWithOffset(
      flight.arrival.scheduledTime?.local || "",
      arrivalAirport.timezone
    ),
    arrivalGMTTime: new Date(flight.arrival.scheduledTime?.utc || ""),
    airline: flight.airline.name,
    flightNumber: flight.number,
    airportId: departureAirport.id,
    arrivalAirportId: arrivalAirport.id,
    departureAirport,
    arrivalAirport,
  };
}

function findDayTripsFromDb(
  goingFlights: FlightDb[],
  returningFlights: FlightDb[]
) {
  const trips: { departure: FlightDb; return: FlightDb }[] = [];

  goingFlights.forEach((dep) => {
    const depTime = dep.departureGMTTime;
    const arrTime = dep.arrivalGMTTime;

    const sameDayReturns = returningFlights.filter((ret) => {
      const retDepTime = ret.departureGMTTime;
      const retArrTime = ret.arrivalGMTTime;

      return (
        ret.airportId === dep.arrivalAirportId &&
        ret.arrivalAirportId === dep.airportId &&
        depTime.toDateString() === retDepTime.toDateString() &&
        (retDepTime.getTime() - arrTime.getTime()) / (1000 * 60 * 60) >= 6
      );
    });

    sameDayReturns.forEach((ret) =>
      trips.push({ departure: dep, return: ret })
    );
  });

  return trips;
}

const makeRequest = async (startTime: string, endTime: string) => {
  const response = await axios.get(
    `https://aerodatabox.p.rapidapi.com/flights/airports/iata/BHX/${startTime}/${endTime}?withLeg=true&direction=Both&withCancelled=false&withCodeshared=false&withCargo=false&withPrivate=false&withLocation=false`,
    {
      headers: {
        "x-rapidapi-key": "1189de0bddmshf3e96459c17409fp1cb47cjsne48f46f6c8ff",
        "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
      },
    }
  );
  return response.data as Root;
};

export async function GET(request: Request) {
  try {
    await acquireRequest();

    const { searchParams } = new URL(request.url);
    const params = searchParamsSchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!params.success) {
      return Response.json({
        success: false,
        error: "Invalid parameters",
        details: params.error,
      });
    }

    params.data.date = new Date(params.data.date).toISOString().split("T")[0];

    // Check for existing flights in the database
    const startOfDay = new Date(params.data.date);
    const endOfDay = new Date(params.data.date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingFlights = await prisma.flight.findMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        OR: [
          {
            departureAirport: {
              code: params.data.departure,
            },
          },
          {
            arrivalAirport: {
              code: params.data.departure,
            },
          },
        ],
      },
      include: {
        departureAirport: true,
        arrivalAirport: true,
      },
    });

    if (existingFlights.length > 0) {
      console.log("Existing flights found in database");
      // Process existing flights from database
      const outboundFlights = existingFlights.filter(
        (flight) => flight.departureAirport.code === params.data.departure
      );

      const inboundFlights = existingFlights.filter(
        (flight) => flight.arrivalAirport.code === params.data.departure
      );

      const routes = findDayTripsFromDb(outboundFlights, inboundFlights);

      return Response.json({
        success: true,
        routes,
        message: "Retrieved from database",
      });
    }

    // If no flights found in database, proceed with API calls
    // Calculate next day's date for the 2 AM end time
    const nextDay = new Date(params.data.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split("T")[0];

    // Make API calls in parallel
    const [outboundFlight, inboundFlight] = await Promise.all([
      makeRequest(`${params.data.date}T06:00`, `${params.data.date}T18:00`),
      makeRequest(`${params.data.date}T18:00`, `${nextDayStr}T02:00`),
    ]);

    // Transform outbound flights
    const outboundFlights = await Promise.all(
      outboundFlight.departures.map(async (flight) => {
        const [departureAirport, arrivalAirport] = await Promise.all([
          getAirport(params.data.departure),
          getAirport(flight.arrival.airport.iata),
        ]);

        if (!departureAirport || !arrivalAirport) {
          return null;
        }

        // Transform to FlightData interface
        const flightData: FlightData = {
          date: params.data.date,
          departureAirport: {
            name: departureAirport.name,
            code: departureAirport.code,
            city: departureAirport.city,
            country: departureAirport.country,
            timezone: departureAirport.timezone,
          },
          departureLocalTime: flight.departure.scheduledTime?.local || "",
          departureGMTTime: flight.departure.scheduledTime?.utc || "",
          arrivalAirport: {
            name: arrivalAirport.name,
            code: arrivalAirport.code,
            city: arrivalAirport.city,
            country: arrivalAirport.country,
            timezone: arrivalAirport.timezone,
          },
          arrivalLocalTime: flight.arrival.scheduledTime?.local || "",
          arrivalGMTTime: flight.arrival.scheduledTime?.utc || "",
          airline: flight.airline.name,
          flightNumber: flight.number,
          slug: `${params.data.departure}-${flight.number}-${params.data.date}`,
        };

        // Send to microservice
        try {
          const microserviceUrl =
            process.env.ENVIRONMENT === "development"
              ? "http://localhost:3001"
              : "https://api.evntcentral.com";
          axios.post(`${microserviceUrl}/daytrippr/flights`, flightData);
        } catch (error) {
          console.error("Error sending flight data to microservice:", error);
        }

        return transformToFlightDb(
          flight,
          departureAirport,
          arrivalAirport,
          params.data.date
        );
      })
    );

    interface AirportData {
      name: string;
      code: string;
      city: string;
      country: string;
      timezone: string;
    }

    interface FlightData {
      date: string;
      departureAirport: AirportData;
      departureLocalTime: string;
      departureGMTTime: string;
      arrivalAirport: AirportData;
      arrivalLocalTime: string;
      arrivalGMTTime: string;
      airline: string;
      flightNumber: string;
      slug: string;
    }

    // Transform inbound flights
    const inboundFlights = await Promise.all(
      inboundFlight.arrivals
        .filter((flight) => flight.departure.airport?.iata)
        .map(async (flight) => {
          const [departureAirport, arrivalAirport] = await Promise.all([
            getAirport(flight.departure.airport?.iata || ""),
            getAirport(params.data.departure),
          ]);

          if (!departureAirport || !arrivalAirport) {
            return null;
          }

          // Transform to FlightData interface
          const flightData: FlightData = {
            date: params.data.date,
            departureAirport: {
              name: departureAirport.name,
              code: departureAirport.code,
              city: departureAirport.city,
              country: departureAirport.country,
              timezone: departureAirport.timezone,
            },
            departureLocalTime: flight.departure.scheduledTime?.local || "",
            departureGMTTime: flight.departure.scheduledTime?.utc || "",
            arrivalAirport: {
              name: arrivalAirport.name,
              code: arrivalAirport.code,
              city: arrivalAirport.city,
              country: arrivalAirport.country,
              timezone: arrivalAirport.timezone,
            },
            arrivalLocalTime: flight.arrival.scheduledTime?.local || "",
            arrivalGMTTime: flight.arrival.scheduledTime?.utc || "",
            airline: flight.airline.name,
            flightNumber: flight.number,
            slug: `${params.data.departure}-${flight.number}-${params.data.date}`,
          };

          // Send to microservice
          try {
            const microserviceUrl =
              process.env.ENVIRONMENT === "development"
                ? "http://localhost:3001"
                : "https://api.evntcentral.com";
            axios.post(`${microserviceUrl}/daytrippr/flights`, flightData);
          } catch (error) {
            console.error("Error sending flight data to microservice:", error);
          }

          return transformToFlightDb(
            flight,
            departureAirport,
            arrivalAirport,
            params.data.date
          );
        })
    );

    const routes = findDayTripsFromDb(
      outboundFlights.filter((flight) => flight !== null),
      inboundFlights.filter((flight) => flight !== null)
    );

    return Response.json({
      success: true,
      routes,
      message: "Valid parameters received",
    });
  } catch (error) {
    console.error("Error in search route:", error.stack);
    return Response.json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  } finally {
    releaseRequest();
  }
}
