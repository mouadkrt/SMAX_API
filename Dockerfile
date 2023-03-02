FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8085

CMD [ "node", "app.js" ]

# Start Docker deamon
# docker build -t quay.io/msentissi/ocp_prometheus_smax_3scale:1.0.0 .
# docker login quay.io
# docker push quay.io/msentissi/ocp_prometheus_smax_3scale:1.0.0