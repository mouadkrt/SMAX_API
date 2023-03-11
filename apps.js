const express = require('express')
const bodyParser = require("body-parser");
const app = express();
const { exec } = require("node:child_process");

app.use(bodyParser.json());

const port = 8085

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/incident/new',function(req,res){
console.log("\n\n----------------------------");
console.log('POST request received on /incident/new (expecting a Prometheurs alert). req.body : ');
console.log(req.body);
console.log('----------------------------');

status 		= req.body.status;
namespace 	= req.body.groupLabels.namespace;
alertname 	= req.body.commonLabels.alertname;
message 	= req.body.commonAnnotations.message;
fingerprint = req.body.alerts[0].fingerprint;

console.log("\n\n----------------------------");
console.log("Info extracted from the Prometheus alert received : ");
console.log("status = " + status);
console.log("namespace = " + namespace);
console.log("alertname = " + alertname);
console.log("message = " + message);
console.log("fingerprint = " + fingerprint);
console.log('----------------------------');

if(status=="firing") {
console.log("Prometheus status is 'firing', so creating a SMAX Incident ...")
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
	res.end("SMAX Incident created successfully");
});

}

else if(status=="resolved") {
	console.log("Prometheus status is 'resolved', so closing any previously created SMAX Incident(s) with fingerprint " + fingerprint + " ...");

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
			res.end("SMAX incident(s) with fingerprint " + fingerprint + " closed successfully");
	});
}

});

app.post('/actualservice/new',function(req,res){
	console.log("\n\n----------------------------");
	console.log('POST request received on /actualservice/new. req.body : ');
	console.log(req.body);
	console.log('----------------------------');
	
	DisplayLabel	= req.body.DisplayLabel;
	Subtype 		= req.body.Subtype;
	OCP_Namespace	= req.body.OCP_Namespace;
	
	console.log("\n\n----------------------------");
	console.log("Info extracted from Request JSON body : ");
	console.log("DisplayLabel = " + DisplayLabel);
	console.log("Subtype = " + Subtype);
	console.log("OCP_Namespace = " + OCP_Namespace);
	console.log('----------------------------');
	
	create_SMAX_SACM_ActualService = "./create_SMAX_SACM_ActualService.sh " + "\"" + DisplayLabel + "\" \"" + Subtype + "\" \"" + OCP_Namespace + "\"";
	
	console.log("Executing shell command : \n" + create_SMAX_SACM_ActualService);
	exec(create_SMAX_SACM_ActualService, (error, stdout, stderr) => {
		if (error) {
			console.log(`${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`${stderr}`);
			return;
		}
		console.log(`${stdout}`);
		res.end("SMAX/SACM/ActuallService created successfully");
	});
});

app.listen(port, () => {
  console.log(`Nodejs app listening on port ${port}`)
})
