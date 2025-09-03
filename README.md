# README.md

# Project Board | Progress Trackers
The Product Backlog provides a complete list of project requirements and user stories.

[Product Backlog](https://www.notion.so/25f979c8562480029c1ad3f027ac7f13?v=25f979c8562480259f77000c7e5de6ac&source=copy_link)

We provide 3 different views to track our project progress. They share same data, but focusing on different aspects.

[Task Tracker(not started, in progress, done)](https://www.notion.so/Task-Tracker-253979c8562480ac953dfe4f6261aa31?pvs=21)

[Individual Tracker (track individual progress)](https://www.notion.so/Individual-Tracker-253979c8562480ff86b2cbb59be39ea4?pvs=21)

[Team Tracker (track backend, frontend, database dev progress etc)](https://www.notion.so/Team-Tracker-253979c85624802b90d0fdf51d51c089?pvs=21)

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

## 👤 Frontend Skeleton UI | Designed by Yangxinmeng

This frontend includes a skeleton UI system designed to support multi-stage loading interfaces for time series visualizations. The UI focuses on:

- **Responsiveness**: Grid-based layout with flex utilities
- **Theming Support**: Light / Dark mode skeletons
- **Component Reuse**: Modular `SkeletonUI.vue` under `src/components`
- **Frontend Stack**:  
  - Vue 3 + `<script setup>`  
  - Vite 5  
  - Tailwind CSS  
  - DevContainer + Docker for isolated environment

🧱 Example Component:
```vue
<SkeletonUI mode="light" />
```

📁 Folder Structure:
```
frontend/
├── src/
│   ├── App.vue
│   ├── main.js
│   └── components/
│       └── SkeletonUI.vue
```

📜 Customization Example:
```html
<body class="bg-gray-100 text-gray-900">
```

🚀 To launch the frontend:
```bash
cd frontend
npm install
npm run dev
```

You can view the full prototype on Notion / Miro board (see internal documentation).