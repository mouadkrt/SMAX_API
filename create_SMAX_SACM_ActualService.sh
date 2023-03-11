#!/bin/bash
export BASE_DIR="/usr/src/app"
export smaxUser="ocp01@munisys.net.ma"
export smaxPassword="123.pwdMunisys"
export smaxHost="esmdev.munisys.net.ma"
export smaxTenantId=443446922
export idCategorySmax=11021
 #This integration will create SMAX incident with the following userId, and Service ID and group assignment :
export smaxUserId=10089
export smaxGroup=11012
# 11533 is the id of "ocp01@munisys.net.ma" user
# 18187  is the id of "Openshift" Service
# 11012 is the id of the group "Application Services"
# 11021 is the id of the gategory "Cloud"
export SMAX_ActualService_DisplayLabel=$1
export SMAX_ActualService_Subtype=$2
export OCP_Namespace=$3

echo "Trying to get ServiceComponent Id having DisplayLabel='$OCP_Namespace' : "
export OCP_Namespace_Id=`node --no-warnings SMAX.js --Get ServiceComponent  --Host $smaxHost --TenantId $smaxTenantId --Login $smaxUser --Password $smaxPassword --Filter "DisplayLabel%3D%27$OCP_Namespace%27" | jq '.entities[].properties.Id' | cut -d\" -f2`
echo "OCP_Namespace_Id=$OCP_Namespace_Id"

echo "Calling SMAX API to create new SACM/ActualService... "
node --no-warnings $BASE_DIR/SMAX.js --SACM_Create --DisplayLabel "$SMAX_ActualService_DisplayLabel" --Subtype "$SMAX_ActualService_Subtype" --PhaseId pBuild --ContainedInServiceDefinition 17445 --NS_c $OCP_Namespace_Id --Host $smaxHost --TenantId $smaxTenantId --Login $smaxUser --Password $smaxPassword 


#Example :
# node --no-warnings SMAX.js --SACM_Create --DisplayLabel "SMAX_ActualService_DisplayLabel" --SubType "BusinessService" --PhaseId pBuild --ContainedInServiceDefinition 17445 --Host esmdev.munisys.net.ma --TenantId 443446922 --Login ocp01@munisys.net.ma --Password 123.pwdMunisys
# Other possible options :
#   Environment : String Production | Test | Staging | Dev | Other
#   ContainedInServiceDefinition : String Red Hat OpenShift (id:17445) (This is a SMAX ServiceDefinition [In catalog])
#   NS_c : String openshift-adp (id:25559) (This is a SACM ServiceComponent)

