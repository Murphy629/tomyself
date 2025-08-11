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

## Frontend

- Node.js - v22
- Framework - Vue3 with Vue Router 3
- Dev Environment - Docker Container
- Runtime Environment - Docker Container

## Backend

- Node.js - v22
- Framework - Express
- Runtime Environment - Docker Container