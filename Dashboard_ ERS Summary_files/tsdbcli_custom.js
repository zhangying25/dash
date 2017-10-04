define(["tsdbcli/tsdbcliAJAX"], function(tsdbcliAJAX){
  var req_url_format = "&format=json";

  var queryTSDB = function(tsdbcliAJAXHelper, $deferred, idx, req_url, req_duration, req_m, addT, aggregatedTags) { 
    var req_url_c = req_url + req_duration + req_m + req_url_format;
    console.log("Query : " + req_url_c);
    tsdbcliAJAXHelper.queryTSTBServer(req_url_c, function(response, status, error) {
      if (status == 200) {
        var dpsArr = new Array();
        for(var i in response) {
          var _response = response[i];
          if (addT) {
            for(var i in _response.DataPoints) {
              _response.DataPoints[i][0] += addT;
            }
          }  
          for(var tag in aggregatedTags) {
        	  _response.Tags[tag] = aggregatedTags[tag];
          }
          dpsArr.push({metric:_response.MetricName, tags:_response.Tags, dps:_response.DataPoints});
        }
        $deferred.resolve({
          idx : idx,
          data : dpsArr,
          status : status,
          url : req_url_c, 
          msg : "success"
        });
      } else {
        $deferred.resolve({
          idx : idx,
          data : [], 
          status : status,
          url : req_url_c,
          msg : error
        });
      }
    });
  };

  var TSDBCliCustom = function (config){
    var thisObj = this;
    this.tsdbcli_config = config;

    var tsdbcliAJAXHelper = new tsdbcliAJAX(config);

    this.getMetrics = function(_args, _callback){
      //example : http://localhost:4242/api/suggest?type=metrics&q=sys&max=10
      var max_result = _args.max_result?_args.max_result:500;
      var req_url = this.tsdbcli_config.api_url + "/suggest?type=metrics&q="+_args.filter+"&max="+max_result;

      tsdbcliAJAXHelper.queryTSTBServer(req_url,_callback);
    },

    this.getAggregators = function(_callback){
      var req_url = this.tsdbcli_config.api_url + "/aggregators";
      tsdbcliAJAXHelper.queryTSTBServer(req_url, _callback);
    };

    this.getTags = function(_args, _callback){
      //example: http://localhost:4242/suggest?type=tagk&q=&metrics=cpu.utilization
      var max_result = _args.max_result?_args.max_result:500;
      var req_url = this.tsdbcli_config.api_url + "/suggest?type=tagk&q="+_args.filter+"&max="+max_result;
      tsdbcliAJAXHelper.queryTSTBServer(req_url, _callback);
    };

    this.getTagValues = function(_args, _callback){
      //example: http://localhost:4242/suggest?type=tagk&q=&metrics=cpu.utilization
      var max_result = _args.max_result?_args.max_result:500;
      var req_url = this.tsdbcli_config.api_url + "/suggest?type=tagv&q="+_args.filter+"&max="+max_result;
      tsdbcliAJAXHelper.queryTSTBServer(req_url, _callback);
    };

    this.escapeValue = function(str) {
      return str.replace(/@/g, '\\@').replace(/,/g, '\\,');
    }

    this.query = function(_args, _callback){
      if (_args.metrics.length == 0) {
        _callback([], 500, "No input metrics given");
        return;
      }

      if (this.tsdbcli_config.byProfile) {
        var tenant = _args.metrics[0].metricInfo.tenant;
        if(this.tsdbcli_config.renderer.secondary) {
          this.tsdbcli_config.api_url = window.MySherlock.config[tenant].queryServer.secondary_url;
        } else {
          this.tsdbcli_config.api_url = window.MySherlock.config[tenant].queryServer.primary_url;
        }
      }

      var req_url = this.tsdbcli_config.api_url + "q?";

      var timeDiff = _args.end - _args.start;

      var req_mArr = [];
      var dropOffDelay = 0;
      var metricsQueryInfo = []; 
      for(var metricIdx in _args.metrics) {
        var metricObj = _args.metrics[metricIdx].metricInfo;
        var yAxisScale = metricObj.yAxisScale || 0;
        var tagsAndValues = new Array();
        var multiValueTagsCount = 0;
        var tagsHash = {};
        var aggregatedTags = {};
        for(var tag in metricObj.tags){
          var tagInfo = metricObj.tags[tag];
          var value = '';
          if (typeof tagInfo.value == 'object') {
            var values = tagInfo.value;
            for(var x in values) {
              values[x] = thisObj.escapeValue(values[x]);
            }
            if (tagInfo.aggregate) {
              value = values.join("@");
              aggregatedTags[tagInfo.key] = value;
            } else {
              value = values.join("|");
            }
            if (values.length > 1) multiValueTagsCount ++;
          } else {
            if (tagInfo.value == "*") multiValueTagsCount ++;
            value = thisObj.escapeValue(tagInfo.value);
          }
          tagsAndValues.push(tagInfo.key + "=" + value);
          tagsHash[tagInfo.key] = value;
        }

        var metric , tsdbAgg , _dropOffDelay , timeframeArithmetic;
        if(metricObj.timeframes.length > 0){
              metric = metricObj.timeframes[metricObj.timeframes.length-1].metric;
              tsdbAgg = metricObj.timeframes[metricObj.timeframes.length-1].tsdbAggregator;
              _dropOffDelay = metricObj.timeframes[metricObj.timeframes.length-1].dropOffWindow;
              timeframeArithmetic = metricObj.timeframes[metricObj.timeframes.length-1].arithmetic;
              for (var i = metricObj.timeframes.length-1; i >= 0; i--) {
            	  if (metricObj.timeframes[i].upperBound < timeDiff) {
            		  break;
            	  }
              metric = metricObj.timeframes[i].metric;
              tsdbAgg = metricObj.timeframes[i].tsdbAggregator;
              _dropOffDelay = metricObj.timeframes[i].dropOffWindow;
              // Dropoffdelay should be 0 for higher time res (from 3600 onwards)
              if(metric.indexOf("STATE.3600s") !== -1 || metric.indexOf("STATE.7200s") !== -1 || metric.indexOf("STATE.86400s") !== -1){
                  _dropOffDelay = 0;
              }
              timeframeArithmetic = metricObj.timeframes[i].arithmetic;
            }
        }
        // no temporal aggregations
        else{
            metric = metricObj.name + ".STATE.10s"; 
            tsdbAgg = "sum";
            _dropOffDelay = 0;
        }

        // take the maximum dropOffDelay in case of multiple metrics in a graph
        if (_dropOffDelay > dropOffDelay) {
          dropOffDelay = _dropOffDelay;
        }
        if (dropOffDelay == 60 || dropOffDelay == 120) {
          dropOffDelay = 300;
        }
        var _metricsQueryInfo;
 		if(metricObj.timeframes.length > 0){
	         _metricsQueryInfo = {
	            baseMetricForV1CRC : metricObj.timeframes[0].metric,
	            usedMetricInQ : metric,
	            usedTSDBAggInQ : tsdbAgg,
	            multiValueTagsCount : multiValueTagsCount,
	            yAxisScale : yAxisScale,
	            metricIdx : metricIdx,
	            tagsHash : tagsHash,
	            arithmetic : (metricObj.arithmetic?metricObj.arithmetic:"")+(timeframeArithmetic?timeframeArithmetic:"") 
	        };
 		}
 		else
 		{
	      _metricsQueryInfo = {
	            baseMetricForV1CRC : metricObj.name + ".STATE.10s",
	            usedMetricInQ : metric,
	            usedTSDBAggInQ : tsdbAgg,
	            multiValueTagsCount : multiValueTagsCount,
	            yAxisScale : yAxisScale,
	            metricIdx : metricIdx,
	            tagsHash : tagsHash,
	            arithmetic : (metricObj.arithmetic?metricObj.arithmetic:"")+(timeframeArithmetic?timeframeArithmetic:"") 
	        };
 		}
        metricsQueryInfo.push(_metricsQueryInfo);

        var req_m = "&m=" + escape(tsdbAgg+":"
            + metric
            + '{' + tagsAndValues.join(",") + '}');
        req_m += "&o=";

        _req_m = {req_m:req_m, aggregatedTags: aggregatedTags};
        req_mArr.push(_req_m)
        if (metricObj.comparable) {
          if (metricObj.comparable.wow && metricObj.comparable.wow.length>0) {
            for (var wIdx in metricObj.comparable.wow) {
              var wowCnt = metricObj.comparable.wow[wIdx].count;
              _req_m = {req_m:req_m, wow:wowCnt, aggregatedTags: aggregatedTags};
              if (metricObj.comparable.hoursToExtend) {
                 _req_m.secsToExtend = metricObj.comparable.hoursToExtend*3600;
              }
              req_mArr.push(_req_m);
              var __metricsQueryInfo = $.extend(true, {}, _metricsQueryInfo);
              __metricsQueryInfo.wow = wowCnt;
              metricsQueryInfo.push(__metricsQueryInfo);
            }
          }
          if (metricObj.comparable.dod && metricObj.comparable.dod.length>0) {
            for (var dIdx in metricObj.comparable.dod) {
              var dodCnt = metricObj.comparable.dod[dIdx].count;
              _req_m = {req_m:req_m, dod:dodCnt, aggregatedTags: aggregatedTags};
              if (metricObj.comparable.hoursToExtend) {
                 _req_m.secsToExtend = metricObj.comparable.hoursToExtend*3600;
              }
              req_mArr.push(_req_m);
              var __metricsQueryInfo = $.extend(true, {}, _metricsQueryInfo);
              __metricsQueryInfo.dod = dodCnt;
              metricsQueryInfo.push(__metricsQueryInfo);
            }
          }
        }
      }

      var $waitList = [];
      for(var w in req_mArr) {
        $waitList.push($.Deferred());
      }
      var startTime = parseInt(_args.start-dropOffDelay);
      var endTime = parseInt(_args.end-dropOffDelay);
      var req_duration = "start=" + startTime + "&end=" + endTime;
      var req_url_c = req_url + req_duration;
      for(var w in req_mArr) {
        var _req_m = req_mArr[w].req_m;
        var aggregatedTags = req_mArr[w].aggregatedTags;
        var req_duration_t = req_duration;
        if (req_mArr[w].wow || req_mArr[w].dod) {
          var toSub = 0;
          if (req_mArr[w].wow) {
            toSub = 604800 * req_mArr[w].wow;
          } else {
            toSub = 86400 * req_mArr[w].dod;
          }
          var startTimeT = startTime - toSub;
          var endTimeT = endTime - toSub;
          if (req_mArr[w].secsToExtend) {
            endTimeT += req_mArr[w].secsToExtend;
          }
          //86400
          req_duration_t = "start=" + startTimeT + "&end=" + endTimeT;
          queryTSDB(tsdbcliAJAXHelper, $waitList[w], w, req_url, req_duration_t, _req_m, toSub, aggregatedTags);
        } else {
          queryTSDB(tsdbcliAJAXHelper, $waitList[w], w, req_url, req_duration_t, _req_m, false, aggregatedTags);
        }
        req_url_c += _req_m + req_url_format;
      }

      $.when.apply($, $waitList).then(function(arrResponse) {
        var anyFailed = false;
        var status = 200;
        var error ='';
        var dpsArr = [];
        if (arguments.length > 1) {
          for (var wr in arguments) {
            var response = arguments[wr];
            if (response.status != 200) {anyFailed = true; status = response.status; error = response.msg;}
            else {
              dpsArr.push(response.data);
            }
          }
        } else {
          var response = arrResponse;
          if (response.status != 200) {anyFailed = true; status = response.status; error = response.msg;}
          else {
            dpsArr.push(response.data);
          }
        }
        if (!anyFailed) {
          _callback(metricsQueryInfo, dpsArr, status, req_url_c, "success", startTime, endTime);
        } else {
          _callback(metricsQueryInfo, dpsArr, status, req_url_c, error, startTime, endTime);
        }
      });
    }
  }
  return TSDBCliCustom;
});