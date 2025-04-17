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

// Add airport cache
let airportCache: Map<string, Airport> = new Map();

// Add API keys array
const AERODATABOX_API_KEYS = [
  "81ed9cb398msh399a5fccc6b1cebp1320dejsn66e2049aceff",
  "ff1949cfaamsh7acf24456654c6fp1f1679jsn2c9d6264fded",
  "6b9dacaef5mshade649601d1255fp14c8c2jsn9aeceb731b2b",
  "b017861f42msh4e5e8f472ab1870p1e6c39jsn166b5da95fe8",
  "1bd5e87f33mshf1aeef959573101p15333ejsn40477d66287f",
  "08f7df0a65msh526b60d2eabfff7p14dcf5jsn9b101cdaf434",
  "7d1a941f06msh29874c6d06f5f6ep12d1d0jsn2fae8bf64af4",
  "85c15c1c5fmshcb571d1bd467699p18d536jsnb45c9303946e",
  "1333b9c49dmsh3af848369f388d8p14cff0jsne7c5bfff1524",
  "57e40df905msh89f91a584028707p1724bfjsn063fbf3c8395",
  "cff38856e4mshf7aa08b8e6c25b2p1cf59ejsnea1743ce381e",
  "b5a677c305mshfcf154f560e1c4ap1a8a16jsn8abaa5feada0",
  "eae621fa64msh38da454e381a490p144e25jsnf56d14a1ff1e",
  "58152de9ebmsh369655691c11c3ep1bd38fjsn717b8fa2072d",
  "4f7618f0c7msh976688b82e5bb70p1973d0jsn25598be7fb57",
  "2ea3972599mshf337a6ce1622083p183087jsn9b1ac0ee54b4",
];

// Function to get a random API key
function getRandomApiKey(): string {
  const randomIndex = Math.floor(Math.random() * AERODATABOX_API_KEYS.length);
  return AERODATABOX_API_KEYS[randomIndex];
}

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
  try {
    let resp = await axios.get(
      `https://airports15.p.rapidapi.com/airports/iata/${iata}`,
      {
        headers: {
          "x-rapidapi-key":
            "81ed9cb398msh399a5fccc6b1cebp1320dejsn66e2049aceff",
          "x-rapidapi-host": "airports15.p.rapidapi.com",
        },
      }
    );

    const airportData = resp.data as AirportResponse;

    try {
      let newAirport = await prisma.airport.create({
        data: {
          code: airportData.iata_code,
          name: airportData.name,
          city: airportData.city || "",
          country: airportData.country_code || "",
          timezone: airportData.timezone || "",
        },
      });

      airportCache.set(iata, newAirport);
      return newAirport;
    } catch {
      //usually errors if the airport already exists#
      let newAirport = await prisma.airport.findUnique({
        where: {
          code: airportData.iata_code,
        },
      });

      if (newAirport) {
        airportCache.set(iata, newAirport);
        return newAirport;
      }

      return null;
    }
  } catch (e) {
    console.error(e.stack);
    return null;
  }
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
  name: string;
  iata_code: string;
  icao_code: string;
  country_code: string;
  city: string;
  elevation: number;
  timezone: string;
  local_time: string;
  lat: number;
  lon: number;
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
  // const parseDateWithOffset = (dateStr: string, tz: string) => {
  //   if (!dateStr) return new Date();

  //   return new Date(dateStr + "Z");
  // };

  return {
    id: Math.random().toString(36).substring(7), // Generate a random ID
    date: new Date(date),
    departureLocalTime: new Date(flight.departure.scheduledTime?.local || ""),
    departureGMTTime: moment.utc(flight.departure.scheduledTime?.utc).toDate(), // Explicitly parse as UTC
    arrivalLocalTime: new Date(flight.arrival.scheduledTime?.local || ""),
    arrivalGMTTime: moment.utc(flight.arrival.scheduledTime?.utc).toDate(), // Explicitly parse as UTC
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
        moment.utc(depTime).isSame(moment.utc(retDepTime), "day") && // Compare using UTC days
        (retDepTime.getTime() - arrTime.getTime()) / (1000 * 60 * 60) >= 6
      );
    });

    sameDayReturns.forEach((ret) =>
      trips.push({ departure: dep, return: ret })
    );
  });

  return trips;
}

const makeRequest = async (
  startTime: string,
  endTime: string,
  airport: string
) => {
  const apiKey = getRandomApiKey();
  try {
    console.log(
      `Making request for airport ${airport} from ${startTime} to ${endTime}`
    );

    console.log(
      `https://aerodatabox.p.rapidapi.com/flights/airports/iata/${airport}/${startTime}/${endTime}?withLeg=true&direction=Both&withCancelled=false&withCodeshared=false&withCargo=false&withPrivate=false&withLocation=false`
    );
    const response = await axios.get(
      `https://aerodatabox.p.rapidapi.com/flights/airports/iata/${airport}/${startTime}/${endTime}?withLeg=true&direction=Both&withCancelled=false&withCodeshared=false&withCargo=false&withPrivate=false&withLocation=false`,
      {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
        },
      }
    );
    return response.data as Root;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Aerodatabox API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        headers: error.config?.headers,
        params: error.config?.params,
      });
    } else {
      console.error("Non-Axios error:", error);
    }
    return null;
  }
};

export async function GET(request: Request) {
  try {
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

    if (params.data.isMonthSelection) {
      //calculate all the dates in the month / left in the month if its the current month
      const startOfMonth = new Date(params.data.date);
      startOfMonth.setDate(1);
      const endOfMonth = new Date(params.data.date);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);

      // Get all existing flights for the month in a single query
      const existingFlights = await prisma.flight.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
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

      // Group existing flights by date and process them immediately
      const flightsByDate = new Map();
      const allDayTrips = [];

      // Process existing flights first
      existingFlights.forEach((flight) => {
        const dateKey = flight.date.toISOString().split("T")[0];
        if (!flightsByDate.has(dateKey)) {
          flightsByDate.set(dateKey, []);
        }
        flightsByDate.get(dateKey).push(flight);
      });

      // Process existing flights for all dates
      for (const [dateKey, flights] of flightsByDate.entries()) {
        // Skip non-weekend dates if weekendOnly is true
        if (params.data.weekendOnly) {
          const date = new Date(dateKey);
          if (date.getDay() !== 0 && date.getDay() !== 6) {
            continue;
          }
        }

        const outboundFlights = flights.filter(
          (flight) => flight.departureAirport.code === params.data.departure
        );
        const inboundFlights = flights.filter(
          (flight) => flight.arrivalAirport.code === params.data.departure
        );

        const dayTripsForDate = findDayTripsFromDb(
          outboundFlights,
          inboundFlights
        );
        allDayTrips.push(...dayTripsForDate);
      }

      // Generate dates array only for dates without existing flights
      const datesToFetch = [];
      for (
        let date = startOfMonth;
        date <= endOfMonth;
        date.setDate(date.getDate() + 1)
      ) {
        const dateKey = date.toISOString().split("T")[0];
        // Only add dates that are weekends if weekendOnly is true
        if (
          (!params.data.weekendOnly ||
            date.getDay() === 0 ||
            date.getDay() === 6) &&
          !flightsByDate.has(dateKey)
        ) {
          datesToFetch.push(new Date(date));
        }
      }

      // Process remaining dates in parallel batches
      const BATCH_SIZE = 3; // Process 3 dates at a time
      for (let i = 0; i < datesToFetch.length; i += BATCH_SIZE) {
        const batch = datesToFetch.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (date) => {
          // Skip non-weekend dates if weekendOnly is true
          if (
            params.data.weekendOnly &&
            date.getDay() !== 0 &&
            date.getDay() !== 6
          ) {
            return null;
          }

          const dateKey = date.toISOString().split("T")[0];
          const dateKeyNextDay = new Date(date);
          dateKeyNextDay.setDate(dateKeyNextDay.getDate() + 1);
          const dateKeyNextDayStr = dateKeyNextDay.toISOString().split("T")[0];

          const [outboundFlight, inboundFlight] = await Promise.all([
            makeRequest(
              `${dateKey}T05:50`,
              `${dateKey}T17:30`,
              params.data.departure
            ),
            makeRequest(
              `${dateKey}T13:00`,
              `${dateKeyNextDayStr}T01:00`,
              params.data.departure
            ),
          ]);

          if (!outboundFlight || !inboundFlight) {
            return null;
          }

          // Filter out non-weekend flights if weekendOnly is true
          const outboundFlights = await Promise.all(
            (outboundFlight.departures || [])
              .filter((flight) => {
                if (!params.data.weekendOnly) return true;
                const flightDate = new Date(
                  flight.departure.scheduledTime?.utc || ""
                );
                return flightDate.getDay() === 0 || flightDate.getDay() === 6;
              })
              .map(async (flight) => {
                const [departureAirport, arrivalAirport] = await Promise.all([
                  getAirport(params.data.departure),
                  getAirport(flight.arrival.airport.iata),
                ]);

                if (!departureAirport || !arrivalAirport) {
                  return null;
                }

                const flightData: FlightData = {
                  date: dateKey,
                  departureAirport: {
                    name: departureAirport.name,
                    code: departureAirport.code,
                    city: departureAirport.city,
                    country: departureAirport.country,
                    timezone: departureAirport.timezone,
                  },
                  departureLocalTime:
                    flight.departure.scheduledTime?.local || "",
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
                  slug: `${params.data.departure}-${flight.number}-${dateKey}`,
                };

                // Send to microservice
                try {
                  const microserviceUrl =
                    process.env.ENVIRONMENT === "development"
                      ? "http://localhost:3001"
                      : "https://api.evntcentral.com";
                  axios.post(
                    `${microserviceUrl}/daytrippr/flights`,
                    flightData
                  );
                } catch (error) {
                  console.error(
                    "Error sending flight data to microservice:",
                    error
                  );
                }

                return transformToFlightDb(
                  flight,
                  departureAirport,
                  arrivalAirport,
                  dateKey
                );
              })
          );

          const inboundFlights = await Promise.all(
            (inboundFlight.arrivals || [])
              .filter((flight) => {
                if (!params.data.weekendOnly) return true;
                const flightDate = new Date(
                  flight.departure.scheduledTime?.utc || ""
                );
                return flightDate.getDay() === 0 || flightDate.getDay() === 6;
              })
              .map(async (flight) => {
                const [departureAirport, arrivalAirport] = await Promise.all([
                  getAirport(flight.departure.airport?.iata || ""),
                  getAirport(params.data.departure),
                ]);

                if (!departureAirport || !arrivalAirport) {
                  return null;
                }

                const flightData: FlightData = {
                  date: dateKey,
                  departureAirport: {
                    name: departureAirport.name,
                    code: departureAirport.code,
                    city: departureAirport.city,
                    country: departureAirport.country,
                    timezone: departureAirport.timezone,
                  },
                  departureLocalTime:
                    flight.departure.scheduledTime?.local || "",
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
                  slug: `${params.data.departure}-${flight.number}-${dateKey}`,
                };

                // Send to microservice
                try {
                  const microserviceUrl =
                    process.env.ENVIRONMENT === "development"
                      ? "http://localhost:3001"
                      : "https://api.evntcentral.com";
                  axios.post(
                    `${microserviceUrl}/daytrippr/flights`,
                    flightData
                  );
                } catch (error) {
                  console.error(
                    "Error sending flight data to microservice:",
                    error
                  );
                }

                return transformToFlightDb(
                  flight,
                  departureAirport,
                  arrivalAirport,
                  dateKey
                );
              })
          );

          return findDayTripsFromDb(
            outboundFlights.filter((flight) => flight !== null),
            inboundFlights.filter((flight) => flight !== null)
          );
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach((result) => {
          if (result) {
            allDayTrips.push(...result);
          }
        });

        // Add a small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < datesToFetch.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return Response.json({
        success: true,
        routes: allDayTrips,
      });
    }

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
      makeRequest(
        `${params.data.date}T05:50`,
        `${params.data.date}T17:30`,
        params.data.departure
      ),
      makeRequest(
        `${params.data.date}T13:00`,
        `${nextDayStr}T01:00`,
        params.data.departure
      ),
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

    if (axios.isAxiosError(error)) {
      console.log(error.response);
    }
    return Response.json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  } finally {
  }
}
