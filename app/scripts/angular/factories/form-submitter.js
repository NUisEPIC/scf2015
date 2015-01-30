app.factory('form-submitter', ['$http', function($http) {

  function noPreflightPost(url, data) {
    
    function param(data) {
      // NOTE: this parameterizing function is not very robust
      //       it assumes all your k,v pairs will be unnested
      //       and that your keys do not need to be encoded.
      var result = [];
      
      angular.forEach(data, function(value, key) {
        result.push(key + '=' + encodeURIComponent(value));
      });
      
      return result.join('&');
    }
    
    // unset stupid angular defaults
    var noPreflightConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Can't specify a Cache-Control header.
        // This is the only configuration that seems to work.
        // multipart/form-data fails splendidly; angular doesn't
        // transform the data for you.
      }
    };
    return $http.post(url, param(data), noPreflightConfig);
  };

  // there can be two entries with the same key
  var root = {
    config: {
      setStrKeyDelimiter: function(delimiter) {
        root.transform.fn.__str_key_delimeter__ = delimiter;
      },
      debug: {
        errors: true,
        warnings: true,
        info: false
      }
    },
    _log: {
      _log_fn: function(mode, txt) {
        !root.config.debug[mode] || console[mode](txt);
      },
      error: function(txt) { root._log._log_fn('error', txt); },
      warn: function(txt) { root._log._log_fn('warn', txt); },
      info: function(txt) { root._log._log_fn('info', txt); }
    },
    transforms: {
      tmpVal: '',
      google: {
        map: {}
      }
    },
    setTransformMap: function(name, map) {
      if(!root.transforms[name]) root.transforms[name] = {map: {}};
      root.transforms[name].map = map;
    },
    postURLs: {
      google: {
        noPreflight: true,
        url: ''
      }
    },
    setPostURL: function(name, url, noPreflight) {
      root.postURLs[name] = root.postURLs[name] || {};
      root.postURLs[name].url = url;
      // keep default if noPreflight is not being explicitly set
      if (!!noPreflight)
        root.postURLs[name].noPreflight = noPreflight;
    },
    transform: {
      fn: {
        __str_key_delimeter__: '-',
        _str_key_parser_: function(start, oldKey) {
          root.transforms.tmpVal = start;
          oldKey.split(root.transform.fn.__str_key_delimeter__)
            .forEach(function(k) {
              root.transforms.tmpVal = root.transforms.tmpVal[k];
            });
          return root.transforms.tmpVal;
        },
        basicTransform: function(obj, which) {
          return function(newKey, oldKey) {
            root.transforms.tmpVal = obj;
            root.transform.fn._str_key_parser_(obj, oldKey);
            root.transforms[which].result[newKey] = root.transforms.tmpVal;
          };
        }
      },
      // specific transformers
      default: function(formObj, which){
        if (!root.transforms[which].map) {
          return root._log.error('form-submitter.transform() fail: no transform map specified'
                               + ' for ' + which + '.');
        }
        root.transforms[which].result = {};
        angular.forEach(root.transforms[which].map
                        , (root.transform.fn[which]
                           || root.transform.fn.basicTransform)(formObj, which));
      },
      google: function(formObj) {
        root.transform.default(formObj, 'google');
      },
      custom: function(formObj) {
        // NOTE: by default, don't transform custom
        if (!root.transforms['custom']) root.transforms.custom = {};
        root.transforms.custom.result = formObj;
      }
    },
    submit: function(to, form, successCallback, failCallback) {
      // transform
      if(!!root.transform[to]) {
        root.transform[to](form);
      } else {
        root._log.warn('form-submitter.transform.' + to + '() warn: transformer does not exist.'
                       + ' Request will send, but data keys may be incorrect.');
      }
      // post to appropriate URL
      if (!!root.postURLs[to]) {
        root.postURLs[to].noPreflight 
          ? noPreflightPost(root.postURLs[to].url, root.transforms[to].result)
          : $.post(root.postURLs[to].url, root.transforms[to].result)
            .success(successCallback)
            .error(failCallback);
      } else {
        root._log.error('form-submitter.submit() fail: no valid URL for ' + to + '.');
      }
    },
    submitAll: function(form) {
      Object.keys(root.postURLs).forEach(function(url) {
        root.submit(url, form);
      });
    }
  };

  return root;
}]);
