#!/bin/bash
export BASE_DIR="/usr/src/app"
export smaxUser="ocp01@munisys.net.ma"
export smaxPassword="123.pwdMunisys"
export smaxHost="esmdev.munisys.net.ma"
export smaxTenantId=443446922
export idCategorySmax=11021
 #This integration will create SMAX incident with the following userId, and Service ID and group assignment :
export smaxUserId=10089
export smaxOpenShiftServiceId=18187
export smaxGroup=11012
# 11533 is the id of "ocp01@munisys.net.ma" user
# 18187  is the id of "Openshift" Service
# 11012 is the id of the group "Application Services"
# 11021 is the id of the gategory "Cloud"
export SMAX_Incident_DisplayLabel=$1
export SMAX_Incident_Description="$2"
export externalId=$3
export namespace=$4
echo -e "SMAX_Incident_DisplayLabel : $SMAX_Incident_DisplayLabel \n SMAX_Incident_Description : $SMAX_Incident_Description \n externalId : $externalId \n namespace : $namespace"
export incidentExists=`./get_SMAX_incident.sh $externalId | jq '.entities[].properties.Id' | wc -l`
if [ $incidentExists -ne 0 ]
then
echo "Found some tickets already opened with the KEY : $externalId"
echo "Exiting $0 script."
exit
fi
echo "Getting the Id of the SMAX ServiceComponent having the same name as the namespace mentioned in the alert : "
export RegisteredForServiceComponentId=`node --no-warnings SMAX.js --Get ServiceComponent  --Host $smaxHost --TenantId $smaxTenantId --Login $smaxUser --Password $smaxPassword --Filter "DisplayLabel%3D%27$namespace%27" | jq '.entities[].properties.Id' | cut -d\" -f2`
echo "RegisteredForServiceComponent=$RegisteredForServiceComponentId" 
echo "Calling SMAX API ..."
node --no-warnings $BASE_DIR/SMAX.js --Category $idCategorySmax --ExternalProcessReference $externalId --RequestedByPerson $smaxUserId --RegisteredForActualService $smaxOpenShiftServiceId --RegisteredForServiceComponent $RegisteredForServiceComponentId  --ServiceDeskGroup $smaxGroup --Priority LowPriority --DisplayLabel "$SMAX_Incident_DisplayLabel" --Description "$SMAX_Incident_Description" --Host $smaxHost --TenantId $smaxTenantId --Login $smaxUser --Password $smaxPassword 
export newIncindent=`node --no-warnings $BASE_DIR/SMAX.js --Get Incident --Host $smaxHost --TenantId $smaxTenantId --Login $smaxUser --Password $smaxPassword --Filter "ExternalProcessReference%3D%27$KEY%27%20and%20Active%3D%27True%27"`
export newIncindentId=`echo $newIncindent  | jq '.entities[].properties.Id'`
echo "New incident created : $newIncindentId"