define(["tsdbcli/ajax"], function(AJAXHelper){
  var TSDBCli = function (config){
    this.tsdbcli_config = config;

    var version = this.tsdbcli_config.version || "v1";
    this.tsdbcli_config.version = version;

    this.getMetrics = function(_args, _callback){
      var config = this.tsdbcli_config;
      requirejs(["tsdbcli/tsdbcli_"+version], function (_TSDBCli) {
        var tsdbCli = new _TSDBCli(config);
        tsdbCli.getMetrics(_args,  _callback);
      });
    },
 
    this.getAggregators = function(_callback){
      var config = this.tsdbcli_config;
      requirejs(["tsdbcli/tsdbcli_"+version], function (_TSDBCli) {
        var tsdbCli = new _TSDBCli(config);
        tsdbCli.getAggregators(_callback);
      });
    };
    
    this.getTags = function(_args, _callback){
      var config = this.tsdbcli_config;
      requirejs(["tsdbcli/tsdbcli_"+version], function (_TSDBCli) {
        var tsdbCli = new _TSDBCli(config);
        tsdbCli.getTags(_args,  _callback);
      });
    };
    
    this.getTagValues = function(_args, _callback){
      var config = this.tsdbcli_config;
      requirejs(["tsdbcli/tsdbcli_"+version], function (_TSDBCli) {
        var tsdbCli = new _TSDBCli(config);
        tsdbCli.getTagValues(_args,  _callback);
      });
    };
 
    this.query = function(_args, _callback){
      var tsdbcliObj = this;
      var config = this.tsdbcli_config;
      var thisObj = this;
 
      requirejs(["tsdbcli/tsdbcli_"+version], function (_TSDBCli) {
        thisObj.tsdbCli = new _TSDBCli(config);
        thisObj.tsdbCli.query(_args, function(metricsQueryInfo, datapoints, status, link, error, startTime, endTime){
            _callback(_args.queryId, metricsQueryInfo, datapoints, status, link, error, startTime, endTime);
        });
      });
    }
  }
  return TSDBCli;
});
