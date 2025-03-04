"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  X,
  ChevronRight,
  Info,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function FlightDetailsPage() {
  const [addBaggage, setAddBaggage] = useState(false);

  return (
    <div className="max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="p-4 flex items-center border-b bg-white">
        <Link
          href="/search-results"
          className="text-blue-500 flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Close
        </Link>
        <div className="ml-auto">
          <button className="text-blue-500 flex items-center">Share</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 p-4">
        <div className="space-y-6">
          {/* Fare details */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Cheap fare</h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Carry-on</span>
              </li>
              <li className="flex items-center text-gray-500">
                <X className="h-5 w-5 mr-2" />
                <span>Baggage not included</span>
              </li>
              <li className="flex items-center text-gray-500">
                <X className="h-5 w-5 mr-2" />
                <span>Non-exchangeable</span>
              </li>
              <li className="flex items-center text-gray-500">
                <X className="h-5 w-5 mr-2" />
                <span>Non-refundable</span>
                <Info className="h-4 w-4 ml-1 text-gray-400" />
              </li>
            </ul>

            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span>Add baggage</span>
                  <span className="text-blue-500 ml-2">+£84</span>
                </div>
                <Switch checked={addBaggage} onCheckedChange={setAddBaggage} />
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <button className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <span>Additional baggage</span>
                  <span className="text-blue-500 ml-2">+£85</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Outbound flight */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Bristol – Budapest</h3>
              <span className="text-gray-500">2h30m</span>
            </div>

            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  alt="Ryanair"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="font-semibold">Ryanair</div>
                <div className="text-gray-500 text-sm">2h30m</div>
              </div>
              <button className="ml-auto text-blue-500 text-sm">
                Learn more
              </button>
            </div>

            <div className="relative pl-6 border-l-2 border-gray-200">
              <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-gray-400 -translate-x-[7px]"></div>
              <div className="mb-8">
                <div className="font-semibold">5:55am</div>
                <div className="text-sm text-gray-500">Wed, Mar 19</div>
                <div className="text-sm">Bristol</div>
                <div className="text-sm text-gray-500">
                  Bristol Airport, BRS
                </div>
              </div>

              <div className="absolute left-0 bottom-0 w-3 h-3 rounded-full bg-gray-400 -translate-x-[7px]"></div>
              <div>
                <div className="font-semibold">9:25am</div>
                <div className="text-sm text-gray-500">Wed, Mar 19</div>
                <div className="text-sm">Budapest</div>
                <div className="text-sm text-gray-500">
                  Budapest Ferenc Liszt International Airport, BUD
                </div>
              </div>
            </div>
          </div>

          {/* Return flight */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Budapest – Bristol</h3>
              <span className="text-gray-500">2h50m</span>
            </div>

            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  alt="Ryanair"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="font-semibold">Ryanair</div>
                <div className="text-gray-500 text-sm">2h50m</div>
              </div>
              <button className="ml-auto text-blue-500 text-sm">
                Learn more
              </button>
            </div>

            <div className="relative pl-6 border-l-2 border-gray-200">
              <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-gray-400 -translate-x-[7px]"></div>
              <div className="mb-8">
                <div className="font-semibold">8:00pm</div>
                <div className="text-sm text-gray-500">Fri, Mar 21</div>
                <div className="text-sm">Budapest</div>
                <div className="text-sm text-gray-500">
                  Budapest Ferenc Liszt International Airport, BUD
                </div>
              </div>

              <div className="absolute left-0 bottom-0 w-3 h-3 rounded-full bg-gray-400 -translate-x-[7px]"></div>
              <div>
                <div className="font-semibold">9:50pm</div>
                <div className="text-sm text-gray-500">Fri, Mar 21</div>
                <div className="text-sm">Bristol</div>
                <div className="text-sm text-gray-500">
                  Bristol Airport, BRS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking options */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* Wowtickets */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 text-purple-600 font-bold">
                W
              </div>
              <div>
                <div className="font-semibold text-xl">£83</div>
                <div className="text-sm text-gray-500">Wowtickets</div>
              </div>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">Buy</Button>
          </div>

          {/* Kiwi.com */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3 text-teal-600 font-bold">
                K
              </div>
              <div>
                <div className="font-semibold text-xl">£132</div>
                <div className="text-sm text-gray-500">Kiwi.com</div>
              </div>
            </div>
            <Button variant="outline" className="bg-gray-100">
              Buy
            </Button>
          </div>

          {/* City.Travel */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600 font-bold">
                C
              </div>
              <div>
                <div className="font-semibold text-xl">£166</div>
                <div className="text-sm text-gray-500">City.Travel</div>
              </div>
            </div>
            <Button variant="outline" className="bg-gray-100">
              Buy
            </Button>
          </div>

          {/* More deals */}
          <button className="flex items-center justify-between w-full py-4">
            <span className="font-semibold">3 more deals</span>
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Trust message */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-start">
            <div className="mr-3 mt-1">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-sm">
                You can rely on all our sellers, but if you've got questions —
                we've got your back
              </p>
            </div>
            <Info className="h-5 w-5 ml-2 text-gray-400 mt-1" />
          </div>

          {/* Support message */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>We're here for you 👋 before and after your flight.</p>
            <p>
              We'd help during the flight too, but the signal ain't great up
              there
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
