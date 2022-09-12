
const axios = require('axios');
var jwt = require('jsonwebtoken');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config()

async function main() {

    var unity_version = "2020.3.6f1";
    var file = "./data/openapi.unitypackage";
    var packageVersion_id = 250770;
    
    var keys = await login();
    //await getPackageVersion(keys, packageVersion_id)
    //await deleteDraftPackageVersion(keys, packageVersion_id)

    //await getPublisherLimits(keys)
    //await getCategoryList(keys)
    //await uploadUnityPackage(keys, file, packageVersion_id, unity_version)
}

async function login() {
     
    // login
    var token = await axios.post(`${process.env.HOST}/api/login`, {
        'username': process.env.USERNAME,
        'password': process.env.PASSWORD
    });
    var user_id = token.data.userId;
    var access_token = token.data.accessToken;
    var publisherId = token.data.publisherId;
    
    console.log(`Successfully login with userId: ${user_id}, pubisherId: ${publisherId}.`)

    var key = await axios.post(`${process.env.HOST}/api/publishing-key`, {}, {
            headers: { Authorization: `Bearer ${access_token}` }    
        });
    var payload = {
        'sub': key.data.keyChainId.toString(),
        'iss': key.data.keyChainId.toString(),
        'iat': Date.now() / 1000 - 60,
        'exp': Date.now() / 1000 + 86400,  
        'aud': 'genesis',
        'scope': 'genesis.generateAccessToken'
    }
    var private_key = `-----BEGIN PRIVATE KEY-----\n${key.data.privateKey}\n-----END PRIVATE KEY-----`


    var api_token = jwt.sign(payload, private_key, { 
        algorithm: 'RS256',
        header: {'kid': key.data.id.toString(), 'uid': user_id.toString()}
    });


    return {api_token, access_token}
}

async function deleteDraftPackageVersion(keys, package_version_id) {
    var config = { headers: { Authorization: `Bearer ${keys.api_token}` }}
    var res = await axios.delete(`${process.env.HOST}/store-publishing/package-version/${package_version_id}`, config);
    return res;
}

async function getPackageVersion(keys, package_version_id) {
    var config = { headers: { Authorization: `Bearer ${keys.api_token}` }}
    var res = await axios.get(`${process.env.HOST}/store-publishing/package-version/${package_version_id}`, config);
    console.log(`Package Version:`);
    console.log(res.data);
    return res.data;
}

async function getUnityVersionsList(keys) {
    var config = { headers: { Authorization: `Bearer ${keys.api_token}` }}
    var res = await axios.get(`${process.env.HOST}/store-publishing/fetch/unity-versions`, config);
    console.log(`Unity Versions List:`);
    console.log(res.data);
    return res.data;
}

async function getCategoryList(keys) {
    var config = { headers: { Authorization: `Bearer ${keys.api_token}` }}
    var res = await axios.get(`${process.env.HOST}/store-publishing/fetch/categories`, config);
    console.log(`Categories List:`);
    console.log(res.data);
    return res.data;
}

async function getPublisherLimits(keys) {
    var config = { headers: { Authorization: `Bearer ${keys.access_token}` }}
    var res = await axios.get(`${process.env.HOST}/api/publishing-limit`, config);
    console.log(`pbulisher limits:`);
    console.log(res.data);
    return res.data;
}

async function uploadUnityPackage(keys, file, packageVersion_id, unity_version) {
    var filesize = await fs.statSync(file);
    const size = filesize.size; 

    var res = await axios.post(`${process.env.HOST}/store-publishing/package-version/${packageVersion_id}/unitypackage/prepare`, {
        'unityVersion': unity_version,
        'sizes': [size] },
        { headers: { Authorization: `Bearer ${keys.api_token}` }}
    );

    console.log("res:");
    console.log(res.data);

    const form = new FormData();
    form.append('file', fs.createReadStream(file));
    form.append('unityVersion', unity_version);
    form.append('index', 0);

    var res = await axios.post(`${process.env.HOST}/store-publishing/package-version/${packageVersion_id}/unitypackage`, form, 
        { headers: { Authorization: `Bearer ${keys.api_token}` }}
    );

    console.log("res:");
    console.log(res.data);
}

main()
    .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });