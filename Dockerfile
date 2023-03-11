FROM node:16
#FROM registry.access.redhat.com/ubi8/nodejs-16:1-90
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN apt-get update && apt-get install -y jq
COPY . .

RUN chmod +x /usr/src/app/*.sh
EXPOSE 8085

CMD [ "node", "apps.js" ]

# Start Docker deamon
# docker build -t smax_api:1.0.15 .
# Tag it and push to quay
# docker tag smax_api:1.0.15 quay.io/msentissi/smax_api:1.0.15
# docker push quay.io/msentissi/smax_api:1.0.15
# OR tag it and push to dockerhub
# docker push msentissi/smax_api:1.0.15

# Local test on DockerDesktop :
# docker run --rm -it --network host smax_api:1.0.15

# Think of cleaning the files (specialy shell script), when moving from Windows env into unix inside the container :
#   sed -i 's/\r//' *.sh
#   OR dos2unix your_script.sh
#   OR Notepad++ Edit -> EOL Convesion -> Unix (LF)