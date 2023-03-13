FROM redhat/ubi8
#FROM node:16
#FROM registry.access.redhat.com/ubi8/nodejs-16:1-90
WORKDIR /usr/src/app
COPY . .
RUN chmod +x /usr/src/app/*.sh
RUN yum install -y gcc-c++ make 
RUN curl -sL https://rpm.nodesource.com/setup_16.x | bash - 
RUN yum install -y nodejs jq npm
RUN npm install

EXPOSE 8085

CMD [ "node", "apps.js" ]

# Start Docker deamon
# docker build -t smax_api:1.1.0 .
# Tag it and push to quay
# docker tag smax_api:1.1.0 quay.io/msentissi/smax_api:1.1.0
# docker push quay.io/msentissi/smax_api:1.1.0
# OR tag it and push to dockerhub
# docker push msentissi/smax_api:1.1.0

# Local test on DockerDesktop :
# docker run --rm -it --network host smax_api:1.1.0

# Think of cleaning the files (specialy shell script), when moving from Windows env into unix inside the container :
#   sed -i 's/\r//' *.sh
#   OR dos2unix your_script.sh
#   OR Notepad++ Edit -> EOL Convesion -> Unix (LF)