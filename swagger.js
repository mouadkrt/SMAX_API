const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./apps.js']

swaggerAutogen(outputFile, endpointsFiles)