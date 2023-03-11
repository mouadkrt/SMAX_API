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
export SMAX_BizService_DisplayLabel=$1
export SMAX_BizService_Subtype=$2

echo "Callinf SMAX API to create new Biz Service ... "
node --no-warnings $BASE_DIR/SMAX.js  --DisplayLabel "$SMAX_BizService_DisplayLabel" --Subtype "$SMAX_BizService_Subtype" --Host $smaxHost --TenantId $smaxTenantId --Login $smaxUser --Password $smaxPassword 

# echo "New BizService created : $newBizServiceId"