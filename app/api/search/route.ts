import axios from "axios";
import { Airport, PrismaClient, Flight as FlightDb } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

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
async function getAirport(iata: string): Promise<Airport> {
  console.log(`Getting Airport: ${iata}`);
  const airport = await prisma.airport.findFirst({
    where: {
      code: iata,
    },
  });

  if (!airport) {
    let resp = await axios.get(
      `https://iata-airports.p.rapidapi.com/airports/${iata}/`,
      {
        headers: {
          "x-rapidapi-key":
            "81ed9cb398msh399a5fccc6b1cebp1320dejsn66e2049aceff",
          "x-rapidapi-host": "iata-airports.p.rapidapi.com",
        },
      }
    );

    const airportData = resp.data as AirportResponse;

    let newAiport = await prisma.airport.create({
      data: {
        code: airportData.code,
        name: airportData.name,
        city: airportData.city || "",
        country: airportData.country || "",
      },
    });

    return newAiport;
  }
  return airport;
}

function findDayTrips(departures: Flight[], arrivals: Flight[]) {
  const trips: { departure: Flight; return: Flight }[] = [];

  departures.forEach((dep) => {
    const depAirport = dep.departure.airport?.iata;
    const arrAirport = dep.arrival.airport?.iata;
    const depTime = new Date(dep.departure.scheduledTime?.utc || "");
    const arrTime = new Date(dep.arrival.scheduledTime?.utc || "");

    const sameDayReturns = arrivals.filter((ret) => {
      const retDepAirport = ret.departure.airport?.iata;
      const retArrAirport = ret.arrival.airport?.iata;
      const retDepTime = new Date(ret.departure.scheduledTime?.utc || "");
      const retArrTime = new Date(ret.arrival.scheduledTime.utc);

      return (
        retDepAirport === arrAirport &&
        retArrAirport === depAirport &&
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
  const { searchParams } = new URL(request.url);

  const params = searchParamsSchema.safeParse(Object.fromEntries(searchParams));

  if (!params.success) {
    return Response.json({
      success: false,
      error: "Invalid parameters",
      details: params.error,
    });
  }

  params.data.date = new Date(params.data.date).toISOString().split("T")[0];
  //check if routes alread exist in db
  const goingFlights = await prisma.flight.findMany({
    where: {
      departureAirport: {
        code: params.data.departure,
      },
      date: new Date(params.data.date),
    },
    include: {
      departureAirport: true,
      arrivalAirport: true,
    },
  });

  console.log(goingFlights);

  const returningFlights = await prisma.flight.findMany({
    where: {
      arrivalAirport: {
        code: params.data.departure,
      },
      date: new Date(params.data.date),
    },
    include: {
      departureAirport: true,
      arrivalAirport: true,
    },
  });
  console.log(returningFlights);

  const routes = findDayTripsFromDb(goingFlights, returningFlights);
  // console.log(routes);

  if (routes.length > 0) {
    return Response.json({
      routes,
      success: true,
    });
  }

  if (routes.length > 0) {
    return Response.json({
      routes,
      success: true,
    });
  }

  let outboundFlights: Flight[] = [];
  let inboundFlights: Flight[] = [];

  const outboundFlight = await makeRequest(
    `${params.data.date}T06:00`,
    `${params.data.date}T18:00`
  );

  //add to db
  let newOutboundFlights: FlightDb[] = [];
  for (const flight of outboundFlight.departures) {
    let fromAirport = await getAirport(params.data.departure);
    let toAirport = await getAirport(flight.arrival.airport?.iata || "");
    newOutboundFlights.push(
      await prisma.flight.create({
        data: {
          date: new Date(params.data.date),
          departureLocalTime: new Date(
            flight.departure.scheduledTime?.local || ""
          ),
          departureGMTTime: new Date(flight.departure.scheduledTime?.utc || ""),
          arrivalLocalTime: new Date(flight.arrival.scheduledTime?.local || ""),
          arrivalGMTTime: new Date(flight.arrival.scheduledTime?.utc || ""),
          airline: flight.airline.name,
          flightNumber: flight.number,
          departureAirport: {
            connect: {
              id: fromAirport.id,
            },
          },
          arrivalAirport: {
            connect: {
              id: toAirport.id,
            },
          },
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      })
    );
  }

  outboundFlights = outboundFlight.departures;

  // Calculate next day's date for the 2 AM end time
  const nextDay = new Date(params.data.date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = nextDay.toISOString().split("T")[0];

  const inboundFlight = await makeRequest(
    `${params.data.date}T18:00`,
    `${nextDayStr}T02:00`
  );

  inboundFlights = inboundFlight.arrivals;

  let newInboundFlights: FlightDb[] = [];
  for (const flight of inboundFlight.arrivals) {
    if (!flight.departure.airport?.iata) {
      continue;
    }
    console.log(`Flight: ${JSON.stringify(flight)}`);
    let fromAirport = await getAirport(flight.departure.airport?.iata || "");
    let toAirport = await getAirport(params.data.departure || "");
    console.log(`From Airport: ${JSON.stringify(fromAirport)}`);
    console.log(`To Airport: ${JSON.stringify(toAirport)}`);
    newInboundFlights.push(
      await prisma.flight.create({
        data: {
          date: new Date(params.data.date),
          departureLocalTime: new Date(
            flight.departure.scheduledTime?.local || ""
          ),
          departureGMTTime: new Date(flight.departure.scheduledTime?.utc || ""),
          arrivalLocalTime: new Date(flight.arrival.scheduledTime?.local || ""),
          arrivalGMTTime: new Date(flight.arrival.scheduledTime?.utc || ""),
          airline: flight.airline.name,
          flightNumber: flight.number,
          departureAirport: {
            connect: {
              id: fromAirport.id,
            },
          },
          arrivalAirport: {
            connect: {
              id: toAirport.id,
            },
          },
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      })
    );
  }

  const dayTrips = findDayTripsFromDb(newOutboundFlights, newInboundFlights);

  return Response.json({
    success: true,
    routes: dayTrips,
    message: "Valid parameters received",
  });
}
