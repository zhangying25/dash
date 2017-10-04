define(["tsdbcli/ajax"], function(AJAXHelper){
  var TSDBCliAJAX = function (config){
    this.tsdbcli_config = config;
    
    this.queryTSTBServer = function (url, callback, dataType) {
      //dataType : default is json
      var req_url = "";
      if (this.tsdbcli_config.enabledCORS) {
        req_url = url;
      } else {
        req_url = this.tsdbcli_config.formatProxyURL(this.tsdbcli_config.proxy_url,url);
      }
      var tsdbcli = this;
      if (typeof tsdbcli.tsdbcli_config.ajaxFn != "undefined") {
        var ajaxHelper = new AJAXHelper(tsdbcli.tsdbcli_config.ajaxFn, req_url, callback);
        ajaxHelper.makeAjaxCall(dataType);
      }
      else if (typeof $ != "undefined") {
        var ajaxHelper = new AJAXHelper($.ajax, req_url, callback);
        ajaxHelper.makeAjaxCall(dataType);
      } else {
        console.log("No jquery based ajax functions defined.");
      }
    };
  }

  return TSDBCliAJAX;
});
