#Enviroment
##Database
influxDB - 2.7.12
docker pull influxdb:2.7.12

docker run -d \
  --name influxdb \
  -p 8086:8086 \
  -v $PWD/influxdb-data:/var/lib/influxdb2 \
  influxdb:2.7.12

running status check
curl http://localhost:8086/health

connect to the remote database


##Frontend
node:22 + Vue3 + Vue3(Vue Router 3)

##Backend
node:22 + Node.js + Express