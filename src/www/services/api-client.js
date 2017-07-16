/* global console, Promise fetch Request */
/* jshint eqnull:true */
require("whatwg-fetch");
const Storage = require("store2");

const ObjectToString = Object.prototype.toString;

function isArray(that) {
  return ObjectToString.call(that) === "[object Array]";
}

function getTypeOf(that) {
  return ObjectToString.call(that).slice(8, -1);
}

// Utility methods for http
function collectParams(key, val, collector) {
  if(isArray(val)) {
    encodeArray(key, val, collector);
  }else if(getTypeOf(val) === "Object") {
    encodeObject(key, val, collector);
  }else {
    let k = key ? encodeURIComponent(key) + "=" : "";
    collector.push(k + encodeURIComponent(val));
  }
}

function encodeObject(key, objVal, collector) {
  Object.keys(objVal).forEach(k => {
    const v = objVal[k],
        newKey = key ? key + "." + k : k;
    collectParams(newKey, v, collector);
  });
}

function encodeArray(key, arrVals, collector) {
  arrVals.forEach(v => {
    collectParams(key, v, collector);
  });
}

/**
 * Builds a parameter array with each component as key=value from the specified object
 * @param {Object} objParams The parameters as object
 * @return {Array} The array representation of query parameters that can be then
 *                 joined by join("&")
 */
function asQueryParameters(objParams = {}) {
  if(!objParams) {
    return "";
  }
  const collector = [];
  collectParams(null, objParams, collector);
  return collector.join("&");
}

function storeApiToken(token) {
  Storage.set("ApiToken", token);
}

function getApiToken() {
  return Storage.get("ApiToken");
}


function ApiClient(opts) {
  this.options = Object.assign({
    apiUrl: "http://localhost:8080",
    redirect: "follow"
  }, opts);
  if(!this.options.headers) {
    this.options.headers = {
      "Content-Type": "application/json"
    };
  }
  this.interceptors = [];
}

ApiClient.prototype = {
  constructor: ApiClient,

  call(path, opts) {
    const url = (opts.apiUrl || this.options.apiUrl) + path,
        xdr = url.indexOf("http://") === 0 || url.indexOf("https://") === 0,
        // useToken = (typeof opts.useToken === "undefined") ? true : opts.useToken,
        headers = Object.assign({}, this.options.headers, opts.headers || {}),
        options = Object.assign({}, this.options, {
          method: "GET",
          mode: xdr ? "cors" : "same-origin"
        }, opts);
    /*
    if(useToken) {
      const token = options.token || Config.auth.token || Storage.get("ApiToken") || "";
      headers["Authorization"] = `Bearer ${token}`;
    }
    */
    options.headers = headers;
    const request = new Request(url, options);
    const intOpts = {path, options, request, response: null};
    this.interceptors.forEach(interceptor => {
      // here interceptors can modify request headers, etc.
      interceptor(intOpts);
    });

    return fetch(request)
        .then(response => {
          let resPromise = Promise.resolve(response);
          resPromise.catch(err => {
            throw err;
          });

          const intOpts = {path, options, request, response: resPromise};
          this.interceptors.forEach(interceptor => {
            const promise = interceptor(intOpts);
            console.log("Interceptor returned", promise);
            if(promise) {
              intOpts.response = promise;
            }
          });
          return intOpts.response;
        });
  },

  setApiToken(token) {
    this.options.token = token;
  },

  setOption(name, value) {
    this.options[name] = value;
  },

  setHeader(name, value) {
    this.options.headers[name] = value;
  },

  interceptor(func) {
    if(typeof func === "function") {
      // console.log("Adding interceptor", func);
      this.interceptors.push(func);
    }else {
      console.warn("[ApiClient] Interceptor expected function but found " + typeof(func));
    }
  },

  storeApiToken: storeApiToken
};

// Add convenience functions for get, put, post, delete http methods
["get", "post", "put", "delete"].forEach(function(m) {
  ApiClient.prototype[m] = function(path, opts) {
    const callOpts = opts || {};
    callOpts.method = m.toUpperCase();
    return this.call(path, callOpts);
  };
});


ApiClient.asQueryParameters = asQueryParameters;
ApiClient.storeApiToken = storeApiToken;
ApiClient.getToken = getApiToken;

module.exports = {
  ApiClient,
  storeApiToken,
  getApiToken,
  asQueryParameters
};
