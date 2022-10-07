'use strict';

require('dotenv').config()

const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const FormData = require('form-data');

const host = ""

const setConfig = (host) => {
    this.host = host
}

const login = async (username, password) => {
     
    // login
    var token = await axios.post(`${this.host}/api/login`, {
        'username': username,
        'password': password
    });
    var user_id = token.data.userId;
    var access_token = token.data.accessToken;
    var publisherId = token.data.publisherId;
    
    console.log(`Successfully login with userId: ${user_id}, pubisherId: ${publisherId}.`)

    var key = await axios.post(`${this.host}/api/publishing-key`, {}, {
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

const deleteDraftPackageVersion = async (keys, package_version_id) => {
    var config = { headers: { Authorization: `Bearer ${keys.api_token}` }}
    var res = await axios.delete(`${this.host}/store-publishing/package-version/${package_version_id}`, config);
    return res;
}

const getPackageVersion = async (keys, package_version_id) => {
    var config = { headers: { Authorization: `Bearer ${keys.api_token}` }}
    var res = await axios.get(`${this.host}/store-publishing/package-version/${package_version_id}`, config);
    console.log(`Package Version:`);
    console.log(res.data);
    return res.data;
}

const getUnityVersionsList = async (keys) => {
    var config = { headers: { Authorization: `Bearer ${keys.api_token}` }}
    var res = await axios.get(`${this.host}/store-publishing/fetch/unity-versions`, config);
    console.log(`Unity Versions List:`);
    console.log(res.data);
    return res.data;
}

const getCategoryList = async (keys) => {
    var config = { headers: { Authorization: `Bearer ${keys.api_token}` }}
    var res = await axios.get(`${this.host}/store-publishing/fetch/categories`, config);
    console.log(`Categories List:`);
    console.log(res.data);
    return res.data;
}

const getPublisherLimits = async (keys) => {
    var config = { headers: { Authorization: `Bearer ${keys.access_token}` }}
    var res = await axios.get(`${this.host}/api/publishing-limit`, config);
    console.log(`pbulisher limits:`);
    console.log(res.data);
    return res.data;
}

const uploadUnityPackage = async (keys, file, packageVersion_id, unity_version) => {
    var filesize = await fs.statSync(file);
    const size = filesize.size; 

    var res = await axios.post(`${this.host}/store-publishing/package-version/${packageVersion_id}/unitypackage/prepare`, {
        'unityVersion': unity_version,
        'sizes': [size] },
        { headers: { Authorization: `Bearer ${keys.api_token}` }}
    );


    const form = new FormData();
    form.append('file', fs.createReadStream(file));
    form.append('unityVersion', unity_version);
    form.append('index', 0);

    var res = await axios.post(`${this.host}/store-publishing/package-version/${packageVersion_id}/unitypackage`, form, 
        { headers: { Authorization: `Bearer ${keys.api_token}` }}
    );

    console.log("res:");
    console.log(res.data);
}

module.exports = {
    setConfig,
    login,
    deleteDraftPackageVersion,
    getPackageVersion,
    getUnityVersionsList,
    getCategoryList,
    getPublisherLimits,
    uploadUnityPackage
};