'use strict';

const publisherPortalLib = require('../lib');
require('dotenv').config()

async function main() {

    var unity_version = "2020.3.6f1";
    var file = "../data/openapi.unitypackage";
    var packageVersion_id = 250770;
    
    publisherPortalLib.setConfig(process.env.HOST)

    var keys = await publisherPortalLib.login(process.env.USERNAME, process.env.PASSWORD);
    console.log(keys);
    //await lib.getPackageVersion(keys, packageVersion_id)
    //await lib.deleteDraftPackageVersion(keys, packageVersion_id)

    //await lib.getPublisherLimits(keys)
    //await lib.getCategoryList(keys)
    //await lib.uploadUnityPackage(keys, file, packageVersion_id, unity_version)
}

main()
    .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
