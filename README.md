# README.md

# Architecture & Environment & Instructions

This project apply docker to ensure environment consistency and better collaboration. The details are followings:

## Database

### Local on the Server

- InfluxDB - v2.7.12
- Remote Connect via SSH Tunnel during Dev
- Runtime Environment - Docker Container

```bash
# pull the image
docker pull influxdb:2.7.12
```

```bash
# start the service
docker run -d \
  --name influxdb \
  -p 8086:8086 \
  -v $PWD/influxdb-data:/var/lib/influxdb2 \
  influxdb:2.7.12
```

```bash
# running status check
curl [http://localhost:8086/health](http://localhost:8086/health)
```

### Remote during Dev

Connect InfluxDB via SSH tunnel

```bash
# Option A - use docker
```

```bash
# Option B - Establish Connection via Terminal
ssh -L 8086:localhost:8086 group_project_server
```

### Sample Data Import & Query
#### Write Sample Data
```bash
ts=$(date +%s%N)
echo "test_measurement,tag1=hello field1=123i $ts" > data/sample.lp

curl -i -sS -X POST "http://localhost:8086/api/v2/write?org=${ORG}&bucket=${BUCKET}&precision=ns" \
  -H "Authorization: Token ${TOKEN}" \
  --data-binary @data/sample.lp

#### Query Data
curl --request POST "http://localhost:8086/api/v2/query?org=${ORG}" \
  --header "Authorization: Token ${TOKEN}" \
  --header 'Accept: application/csv' \
  --header 'Content-type: application/vnd.flux' \
  --data 'from(bucket: "group_bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "test_measurement")'

#### Example Output
...,123,test_measurement,hello

## Frontend

- Node.js - v22
- Framework - Vue3 with Vue Router 3
- Dev Environment - Docker Container
- Runtime Environment - Docker Container

## Backend

- Node.js - v22
- Framework - Express
- Runtime Environment - Docker Container