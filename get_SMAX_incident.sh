
export BASE_DIR="/root/openshift_prometheus_smax"

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

export externalId=$1


node --no-warnings SMAX.js --Get Incident --Host $smaxHost --TenantId $smaxTenantId --Login $smaxUser --Password $smaxPassword --Filter "ExternalProcessReference%3D%27$externalId%27%20and%20Active%3D%27True%27"

