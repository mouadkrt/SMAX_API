FROM node:16
#FROM registry.access.redhat.com/ubi8/nodejs-16:1-90
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN apt-get update && apt-get install -y jq
RUN chmod +x *.sh
EXPOSE 8085

CMD [ "node", "apps.js" ]

# Start Docker deamon
# docker build -t quay.io/msentissi/ocp_prometheus_smax_3scale:1.0.14 .
# docker login quay.io
# docker push quay.io/msentissi/ocp_prometheus_smax_3scale:1.0.14

# Think of cleaning the files (specialy shell script), when moving from Windows env into uinx inside the containes :
#   sed -i 's/\r//' your_script.sh
#   OR dos2unix your_script.sh
#   OR Notepad++ Edit -> EOL Convesion -> Unix (LF)