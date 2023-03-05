const express = require('express')
const bodyParser = require("body-parser");
const app = express();
const { exec } = require("node:child_process");

app.use(bodyParser.json());

const port = 8085

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/smax',function(req,res){
console.log('Alert received : ');
console.log(req.body);
console.log('----------------------------');
status 		= req.body.status;
namespace 	= req.body.groupLabels.namespace;
alertname 	= req.body.commonLabels.alertname;
message 	= req.body.commonAnnotations.message;
fingerprint 	= req.body.alerts[0].fingerprint;

console.log("Info extracted from the alert received from prometheurs : ");
console.log("status = " + status);
console.log("namespace = " + namespace);
console.log("alertname = " + alertname);
console.log("message = " + message);
console.log("fingerprint = " + fingerprint);
console.log('----------------------------');

if(status=="firing") {
create_SMAX_incident = "./create_SMAX_incident.sh " + "\"" + alertname + "\" \"" + message + "\" " + "\"" + req.body.alerts[0].fingerprint + "\" \"" + namespace + "\"";

console.log("Executing shell command : \n" + create_SMAX_incident);
exec(create_SMAX_incident, (error, stdout, stderr) => {
    if (error) {
        console.log(`${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`${stderr}`);
        return;
    }
    console.log(`${stdout}`);
});


res.end("Alert succefully sent to SMAX : Incident created");
}



else if(status=="resolved") {

	console.log("Closing SMAX tickets with fingerprint " + fingerprint + " ...");

	close_SMAX_incidents="./close_SMAX_incidents.sh " + "\"" + fingerprint + "\"";

	exec(close_SMAX_incidents, (error, stdout, stderr) => {
    		if (error) {
       		 	console.log(`error: ${error.message}`);
        		return;
    		}
    		if (stderr) {
        		console.log(`${stderr}`);
        		return;
    		}
    		console.log(`${stdout}`);
	});

	res.end("SMAX tickets with fingerprint " + fingerprint + " closed");
}


});

app.listen(port, () => {
  console.log(`(Openshift --> Prometheus --> 3scale --> SMAX) proxy NodeJs app listening on port ${port}`)
})
