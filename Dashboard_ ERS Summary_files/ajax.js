define(function(){
  var AJAXHelper = function (ajaxFn, req_url, callback){
    this.retry = 0;
    this.req_url = req_url;
    this.callback = callback;
    this.ajaxFn = ajaxFn;

    this.makeAjaxCall = function (dataType){
      dataType = dataType || "text";
      var cli = this;
      cli.ajaxFn({
        timeout:60000,
        type: 'GET',
        url: this.req_url,
        dataType: dataType,
        async: true,
        success: function(data, textStatus, jqXHR){
          cli.retry = 0;
          setTimeout(function() {
            jsonObj = JSON.parse(data);
            if (typeof data != 'object' && dataType=="json") {
              jsonObj = JSON.parse(data);
            }
            cli.callback(jsonObj, jqXHR.status, textStatus);
          }, 1);
        },
        error: function(jqXHR, error, errorThrown){
          if (error==="timeout" || jqXHR.status != 200) {
            cli.retry ++;
            console.log("Retrying #"+cli.retry);
            if (cli.retry < 2) {
              setTimeout(function () {
                cli.makeAjaxCall();
              }, 1);
            } else  {
              cli.callback({}, jqXHR.status, error);
            }
          } else {
            cli.callback({}, jqXHR.status, error);
          }
        }
      });
    }
  }

  return AJAXHelper;
});
