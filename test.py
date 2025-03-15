import http.client

conn = http.client.HTTPSConnection("iata-airports.p.rapidapi.com")

headers = {
    'x-rapidapi-key': "81ed9cb398msh399a5fccc6b1cebp1320dejsn66e2049aceff",
    'x-rapidapi-host': "iata-airports.p.rapidapi.com"
}

conn.request("GET", "/airports/BHX/", headers=headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))