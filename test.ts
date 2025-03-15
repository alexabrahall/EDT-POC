import axios from "axios";

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

const response = await axios.get(
  "https://aerodatabox.p.rapidapi.com/flights/airports/iata/BHX/2025-03-23T18:00/2025-03-24T02:00?withLeg=true&direction=Both&withCancelled=false&withCodeshared=false&withCargo=false&withPrivate=false&withLocation=false",
  {
    headers: {
      "x-rapidapi-key": "1189de0bddmshf3e96459c17409fp1cb47cjsne48f46f6c8ff",
      "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
    },
  }
);
