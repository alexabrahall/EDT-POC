from fast_flights import FlightData, Passengers, Result, get_flights

result: Result = get_flights(
    flight_data=[FlightData(date="2025-06-01", from_airport="BHX", to_airport="CDG")],
    trip="one-way",
    seat="economy",
    passengers=Passengers(adults=2, children=0, infants_in_seat=0, infants_on_lap=0),
    fetch_mode="common",
)

print(result)

# The price is currently... low/typical/high
print("The price is currently", result.current_price)
