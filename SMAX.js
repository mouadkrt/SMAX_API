// Munisys generic script for SMAX API integrations

var path           = require('path');
var scriptFileName = path.basename(__filename);
var _verbose       = false;
var verbose        = function(label, ...d) { if(_verbose) {console.log("\n\n"+label + " : "); console.log(...d);}}
require('console-emojis');

{
        var incidentDefautData  =       {
                "ImpactScope"                   :       "SingleUser",
                "Active"                        :       true,
                "PhaseId"                       :       "Log",
                "ProcessId"                     :       "normal",
                "FirstTouch"                    :       true,
                "Urgency"                       :       "SlightDisruption",
                "CompletionCode"                :       null,
                "Priority"                      :       "LowPriority",
                "IncidentAttachments"   	:       "{\"complexTypeProperties\":[]}"
        }

        var argv = require('minimist')(process.argv.slice(2)); // "node" et "<scriptName>.js" removed from CLI args + support from https://www.npmjs.com/package/minimist in order to be able to call this script with --key1 val1 --key2 val2

        if(argv.help) {
                console.log("\n");
                console.cl("Example of how to call this script:\n");
                console.cl("(Don't forget to always add --Login  --Password --Host and --TenantId)\n");

                console.o("CREATE a new incident :");
                console.log('\tnode ' + scriptFileName + ' --RequestedByPerson 10015 --RegisteredForActualService 11608 --ServiceDeskGroup 10934 --Priority LowPriority --DisplayLabel Test6_Incident_Zabbix --Description "<p>Testing SMAX integration <b>bold</b> <u>underlined</u> text </p>" \n');

                console.o("UPDATE an existing incident by adding --Id argument :");
                console.log('\tnode ' + scriptFileName + ' --Id 17848 --RequestedByPerson 10015 --RegisteredForActualService 11608 --ServiceDeskGroup 10934 --Priority LowPriority --DisplayLabel Test14_Incident_Zabbix --Description "<p>Testing SMAX integration <b> html</b> <u>test</u> </p>"\n');

                console.o("CLOSE an existing incident by adding --PhaseId Close --Solution \"Auto closed by systemXYZ\" --CompletionCode  \"Diagnosed successfully\" :");
                console.log('node ' + scriptFileName + ' --Id 17848 --PhaseId Close --Solution "Auto closed by SystemXYZ" --CompletionCode  "Diagnosed successfully" --RequestedByPerson 10015 --RegisteredForActualService 11608 --ServiceDeskGroup 10934 --Priority LowPriority --DisplayLabel Test14_Incident --Description "<p>Testing SMAX integration <b> html</b> <u>test</u> </p>" \n');

                console.o("GET an existing incident using --Get Incident:17848 :");
                console.log('node ' + scriptFileName + ' --Get Incident:17848 \n');

                console.o("FILTER incidents using --Filter \"someSmaxField+%3D+'someValue'\" :");
				console.log('node ' + scriptFileName + ' --Get Incident --Filter "ExternalProcessReference+%3D+\'LAP-SENTISSI:XblGameSave\'"')
				console.log('\nMake sure to urlencoder the value passed to the --Filter argument\n')
				console.log("For instance :\n ExternalProcessReference='LAP-SENTISSI:XblGameSave' and Active='False' \n should be passed as \n ExternalProcessReference%3D%27LAP-SENTISSI%3AXblGameSave%27%20and%20Active%3D%27False%27 \n");
				
                console.log("\n\n==> Use --verbose for more debug output")
				
                console.log("\n\n==> In order to be able to correclty parse any json output, use --no-warnings and omit using --verbose \n")
				
				
                console.log("\n\n==> Default value while creating incident are :");
                console.log(incidentDefautData);

                console.log("\nMore args @ https://docs.microfocus.com/itom/SMAX:2021.05/BulkUpdate");
                process.exit();
        }

        if(argv.verbose) {
                _verbose = true; // Flag it here, as we'll have to delete it from argv later.
                console.log("\nScript called with args :");
                console.log(argv);
        }
}

const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Set here all context variables for the target SMAX instance :
        var Host                =       argv.Host; // SMAX Host eg. "esmdev.munisys.net.ma";
        var TenantId            =       argv.TenantId; // SMAX Tenant eg. "134897984";
        var Port                =       443;
        var BaseUrl             =       "https://" + Host;
        var Login               =       argv.Login; // SMAX Login
        var Pass                =       argv.Password; // SMAX Password

// SMAX 2021.05 Auth end-point :
        var authPath            =       "/auth/authentication-endpoint/authenticate/token?TENANTID="+TenantId;
        var authBODY            =   JSON.stringify({"login":Login, "password": Pass}, null, 2);
        var smaxAuthToken   =   null;
        var authOptions = {
                  hostname      : Host,
                  port          : Port,
                  path          : authPath,
                  method        : 'POST',
                  headers       : { 'Content-Type': 'application/json', 'Content-Length': authBODY.length }
                };


var createIncident      =       function(token, incidentData, CreateOrUpdate ) {
        var options = {
                hostname        :       Host,
                port            :       Port,
                method          :       'POST',
                json            :       true,
        headers         :       { 'Content-Type' : 'application/json', Cookie : 'SMAX_AUTH_TOKEN=' + token },
                path            :       "/rest/" + TenantId + "/ems/bulk"
    };

        verbose('','\n\n----------------- createIncident(...) :  New https request against : ' + options.path);
        verbose('options', options);
        var req = https.request(options, (res) => {

        verbose('RESPONSE : statusCode and headers', res.statusCode, res.headers);

         res.on('data', (d) => {
                verbose('','\n--- Data received:');
                process.stdout.write(d);
                resp = JSON.parse(d);
                if(resp.entity_result_list[0].completion_status == 'OK') {
                        newIncidentId = resp.entity_result_list[0].entity.properties.Id;
                        verbose('',"\n\nIncident number " + newIncidentId + (argv.Id ? " updated" : " created ") + " successfully !")
                        verbose('',"URL : " + BaseUrl + "/saw/Incident/" + newIncidentId + "/general?TENANTID=" + TenantId);
                }

          });
        });

        req.on('error', (e) => { console.error(e); });

        incidentData = {
        "entities": [
                        {
                                "entity_type": "Incident",
                                "properties":
                                        Object.assign(incidentDefautData,incidentData)
                        }
        ],
        "operation": CreateOrUpdate
        };

        const data = new TextEncoder().encode( JSON.stringify(incidentData) );

        req.write(data);
        req.end();
}


var createSacmActualService      =       function(token, sacmData, CreateOrUpdate ) {
        var options = {
                hostname        :       Host,
                port            :       Port,
                method          :       'POST',
                json            :       true,
                headers         :       { 'Content-Type' : 'application/json', Cookie : 'SMAX_AUTH_TOKEN=' + token },
                path            :       "/rest/" + TenantId + "/ems/bulk"
    };

        verbose('','\n\n-----------------createSacmActualService(...) :  New https request against : ' + options.path);
        verbose('options', options);
        var req = https.request(options, (res) => {

        verbose('RESPONSE : statusCode and headers', res.statusCode, res.headers);

         res.on('data', (d) => {
                verbose('','\n--- Data received:');
                process.stdout.write(d);
                resp = JSON.parse(d);
                console.log(resp);
                if(resp.entity_result_list[0].completion_status == 'OK') {
                        newSacmId = resp.entity_result_list[0].entity.properties.Id;
                        verbose('',"\n\nSACM ActualService " + newSacmId + (argv.Id ? " updated" : " created ") + " successfully !")
                        verbose('',"URL : " + BaseUrl + "/saw/ActualService/" + newSacmId + "/general?TENANTID=" + TenantId);
                }

          });
        });

        req.on('error', (e) => { console.error(e); });

        sacmData = {
        "entities": [
                        {
                                "entity_type": "ActualService",
                                "properties":
                                        Object.assign({},sacmData)
                        }
        ],
        "operation": CreateOrUpdate
        };

        const data = new TextEncoder().encode( JSON.stringify(sacmData) );

        req.write(data);
        req.end();
}

var getEntity   =       function(entityType, entityId, layout, relatedEntity="", relatedEntityLayout="Id", filter=""  ) {

        return new Promise(function(resolve, reject) { // Let's go Async with promises
		
                var entityPathURI       =       BaseUrl + "/rest/" + TenantId + "/ems" + '/' + entityType;
				if( typeof entityId !== 'undefined' )	
					entityPathURI	   += 		'/' + entityId;
				
                var entityPathQuery 	=   	"?layout="+layout+"&TENANTID=" + TenantId;
				if(filter != "")	
					entityPathQuery	   += 		"&filter="+filter;
				
                var entityPath          =       entityPathURI + entityPathQuery;
				
                var options             =       Object.assign({...authOptions}, {method : 'GET', path : entityPath}); // Override/merge some of authOptions keys

                verbose('','\n\n----------------- getEntity(...) :  New https request against : ' + options.path);
                verbose('options', options);

                var req = https.get(options, (res) => {

                        verbose("entityPath", entityPath);
                        verbose('RESPONSE : statusCode and headers', res.statusCode, res.headers);

                        var resData = []; res.on('data', function(chunk) {resData.push(chunk);});

                        res.on('end', () => {
                                try { mainEntityData = JSON.parse(Buffer.concat(resData).toString());}
                                catch(e) { reject(e); }

                                if(relatedEntity != "") {
                                        options.path    =       entityPathURI + "/associations/" + relatedEntity + "/?layout=" + relatedEntityLayout;
                                        verbose('','\n\n----------------- New https request against : ' + options.path);
                                        verbose('options', options);
                                        var req2 = https.get(options, (ress) => {
                                                var resData2 = []; ress.on('data', function(chunk) {resData2.push(chunk);});
                                                ress.on('end', () => {
                                                        try             { relatedEntityData = JSON.parse(Buffer.concat(resData2).toString());}
                                                        catch(e)        { reject(e); }
                                                        mainEntityData.associations     = {};
                                                        mainEntityData.associations[relatedEntity] = relatedEntityData;
                                                        resolve(mainEntityData);
                                                });
                                        }).end();
                                        req2.on('error', (e) => { console.x(e); reject(e); });
                                }
                                else {
                                        // Resolve to mainEntityData without any associationsv (Since relatedEntity is empty)
                                        resolve(mainEntityData);
                                }

                        });
                }).end();

                req.on('error', (e) => { console.x(e); reject(e); });
        });
}


var smaxAuth = function() { // Authenticate then submit incident creation :
        verbose('','--------------Authentication -------------------');
        return new Promise(function(resolve, reject) {

            verbose('','\n\n----------------- New https request against : ' + authOptions.path);
                var req = https.request(authOptions, (res) => {

                   verbose('authOptions', authOptions);
                   verbose('RESPONSE : statusCode and headers', res.statusCode, res.headers);

                  res.on('data', (d) => {
                        verbose('','Token received:');
                        //process.stdout.write(d);
                        smaxAuthToken   =       d;
                        authOptions.headers = { Cookie: 'SMAX_AUTH_TOKEN=' + smaxAuthToken } // As we'll reuse authOptions for later calls

                        // Remove extra data from the submmited json, to avoid SMAX complaining about them :
                                delete argv._;
                                delete argv.verbose;
                                delete argv.Login;
                                delete argv.Password;
                                delete argv.Host;
                                delete argv.TenantId;
                                
                                if(argv.Id) { // Only force the Incident into the "Log" Phase if we're creating a new one.
                                        delete argv.PhaseId;
                                        delete incidentDefautData.PhaseId;
                                }

                        if(res.statusCode==200) { // Auth is OK
                                resolve(smaxAuthToken);
                        }
                        else {
                                reject(res);
                        };

                  });
                });

                req.on('error', (e) => { console.x(e); });

                req.write(authBODY);
                req.end();
        });
}

if(!argv.web) {
        // We'll get here only if calling this script manually from CLI : "node --no-warnings SMAX.js ......"
        // If calling this script from web, then
        // the web server script (app.js for example) will invoke the right shell script, according to the exposed endpoint
        // then the so called shell script will finally make use of this script (SMAX.js) as well
        
        smaxAuth().then((smaxAuthToken)=>{ // Let's login first
                //console.log(argv);
                if(argv.SACM_Create) {
                        verbose("", "Calling createSacmActualService(...) ...");
                        delete argv.SACM_Create
                        createSacmActualService(smaxAuthToken, argv, argv.Id ? "UPDATE" : "CREATE");
                }
                else if(!argv.Get) { // This is a create/update request
                        verbose("", "Calling createIncident(...) ...");
                        createIncident(smaxAuthToken, argv, argv.Id ? "UPDATE" : "CREATE");
                }
                else {  // This is a Get request
                        verbose("Detected GET Request", "Calling getEntity(...) [Only Incident, ServiceComponent and GestionBons_c are supported in this version]");
                        tmp = argv.Get.split(":");
                        var entityType  =       tmp[0];
                        var entityId    =       tmp[1];
                        getEntity(
                                entityType,
                                entityId,
                                entityType == "Incident"                ?       "Id,DisplayLabel,Description"
				: entityType == "ServiceComponent"	?	"Id,DisplayLabel"
                                : entityType == "GestionBons_c"         ?       "Id,User_c"
                                : "Id",
                                entityType == "GestionBons_c" ? "Devices_c":"",
                                entityType == "GestionBons_c"? "Id,DisplayLabel,SubType,SerialNumber":"",
								argv.Filter								
                        ).then(function(data) {
                                console.log(JSON.stringify(data));
                        });
                }

        });
}

module.exports = {
        getEntity :  getEntity,
        smaxAuth :  smaxAuth
}

