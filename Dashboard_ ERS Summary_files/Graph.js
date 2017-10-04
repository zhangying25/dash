define(["tsdbcli/tsdbcli", "ui/ajaxLoader"], function (tsdbcli, AjaxLoader) {
  var fnGetRandomColour = function () 
  {
    var index = Math.round(Math.random() * 2)
    switch(index) {
    case 0:
      var color = '#';        

      var letters = '0123456789ABC'.split('');
      color += letters[Math.round(Math.random() * 12)];
      
      letters = '0123456789ABCDEF'.split('');
      for (var i = 0; i < 5; i++) {
        color += letters[Math.round(Math.random() * 15)];
      }
      
      return color;
    case 1:
      var color = '#';        

      var letters = '0123456789ABCDEF'.split('');
      for (var i = 0; i < 2; i++) {
        color += letters[Math.round(Math.random() * 15)];
      }
      
      letters = '0123456789ABC'.split('');
      color += letters[Math.round(Math.random() * 12)];

      letters = '0123456789ABCDEF'.split('');
      for (var i = 0; i < 3; i++) {
        color += letters[Math.round(Math.random() * 15)];
      }
      
      return color;
    case 2:
      var color = '#';        
      
      var letters = '0123456789ABCDEF'.split('');
      for (var i = 0; i < 4; i++) {
        color += letters[Math.round(Math.random() * 15)];
      }
      
      letters = '0123456789ABC'.split('');
      color += letters[Math.round(Math.random() * 12)];
      
      letters = '0123456789ABCDEF'.split('');
      color += letters[Math.round(Math.random() * 15)];
      
      return color;
    }
  }
  
  var defaults = {
      colors : {
        light : ["#DDDF0D", "#7798BF", "#55BF3B", "#DF5353", "#aaeeee", "#ff0066", "#eeaaee",
                 "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
                 dark : ["#DDDF0D", "#7798BF", "#55BF3B", "#DF5353", "#aaeeee", "#ff0066", "#eeaaee",
                         "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"]
      },
      colorsBy : {
        colo : {
          light : {
            sjc : '#099',// Blue
            phx : '#e5e500',// Yellow
            chd : '#B22222',//firebrick 
            slc : '#00b300',// Green
            srw : '#e478ff',// Purple
            smf : '#800080',// Purple
            lvs : '#e58900',// Orange
            slca : '#00b300',// Green
            slcb : 'green'// Green
          },
          dark : {
            sjc : '#099',// Blue
            phx : '#e5e500',// Yellow
            chd : '#B22222',//firebrick 
            slc : '#00b300',// Green
            srw : '#e478ff',// Purple
            smf : '#800080',// Purple
            lvs : '#e58900',// Orange
            slca : '#00b300',// Green
            slcb : 'green'// Green
          }
        }
      }
  };

  var proxyVIPs = [
//                   "web00.sherlock.vip.ebay.com", //commenting for 2FA fix (http->https)
//                   "web01.sherlock.vip.ebay.com",
//                   "web02.sherlock.vip.ebay.com",
//                   "web03.sherlock.vip.ebay.com",
//                   "web04.sherlock.vip.ebay.com",
//                   "web05.sherlock.vip.ebay.com",
//                   "web06.sherlock.vip.ebay.com",
//                   "web07.sherlock.vip.ebay.com",
//                   "web08.sherlock.vip.ebay.com",
//                   "web09.sherlock.vip.ebay.com",
                   "sherlock.vip.ebay.com"
                   ];

  var proxyCurIdx = 0;

  var Graph = function(config, editCfg) {
////////////TEMP FIX for PPCC Total Payments graph only -
  	var plot = false;
  	if(config.data.metrics.length == 4) {
  		$.each(config.data.metrics, function(metricIndex, metric) {
  			if(metric.metricInfo.name != "pptpv.pps") {
  				return false;
  			}
  		})
  		plot = true;
  	}

	this.config = config;
    var tsdb = config.tsdb;

    var thisObj = this;

    this.render = function () {
      if(!editCfg) {
        if(!$('#'+thisObj.config.id).inView() || this.rendered) return;
        this.rendered = true;
      }
      
      var box = null; 

      this.tsdbcliObj = new tsdbcli({
        enabledCORS : tsdb.tsdbcfg.enabledCORS,
        version : tsdb.tsdbcfg.version,
        ajaxFn : this.config.ajaxPool.queue,
        api_url : tsdb.tsdbcfg.api_url,
        byProfile : tsdb.tsdbcfg.byProfile,
        proxy_url : "//sherlock.vip.ebay.com/CoreApp/proxy/getHttp?url=",
        formatProxyURL:function(proxy_url, api_url) {
          if (proxyCurIdx >= proxyVIPs.length) proxyCurIdx = 0;
          var proxy_url = "//"+proxyVIPs[proxyCurIdx++]+"/CoreApp/proxy/getHttp?url=";
          if (proxyCurIdx >= proxyVIPs.length) proxyCurIdx = 0;
          var tsdburl = escape(api_url).split("%257B");//split by {
          if(tsdburl.length > 1){
			  // for metric keys
			  var firsthalf = tsdburl[0].split("m%3D"); // split by m= to get keys
			  if(firsthalf.length === 2){
				firsthalf[1] = firsthalf[1].replace(/(%253A)/g,"\\:"); // escape colon
			  	firsthalf[1] = firsthalf[1].replace("\\:", "%253A"); // encode first colon after aggregation
			  	tsdburl[0] = firsthalf.join("m%3D"); // join back with m=
			  }
            
              // for metric values
              var escapesymbols = tsdburl[1].replace(/(%253A)/g,"\\:");//escape colon
              escapesymbols = escapesymbols.replace(/(%255C){4}/g, "");//remove multiple '\' for comma and @ cases
              escapesymbols = escapesymbols.replace(/(%255C){2}@/g, "@");//remove multiple '\' for @ case as the ajax call is throwing 400 status
              tsdburl = tsdburl[0] +"%257B" + escapesymbols;
          }else{
        	  tsdburl = tsdburl[0];
          }
          
          return proxy_url+tsdburl;
        },
        renderer: thisObj.config.gridster.options.renderer
      });

      var metrics = this.config.data.metrics;
      var theme = "light";

      thisObj.getSeries = function(metrics, graphContainerId, _cb, addNewMetric) {
        require(["plugins/series"], function(Series) {
          var seriesLib = new Series();
          var start, end;
          if(thisObj.config.gridster.options.renderer.editable) {
            end = Math.round(new Date().getTime()/1000);
            start = end - 3600;
          } else {
            start = thisObj.config.gridster.options.renderer.timeControl.getDT().start;
            end = thisObj.config.gridster.options.renderer.timeControl.getDT().end;
          }
          thisObj.tsdbcliObj.query({
            start: start,
            end: end,
            metrics: metrics,
            queryId: thisObj.config.id
          }, function(queryId, metricsQueryInfo, dpSets, status, link, error, startTime, endTime) {
            var foundErrors = false;
            if (status != 200) {
              if (error && error == "timeout") {
                foundErrors = true;
                $("#"+thisObj.config.id).html('<div style="font-size:14px;color:#f00;margin-top:20px;text-align:center;">'+
                    '<span class="glyphicon glyphicon-warning-sign"></span> Query to TSDB timed out.'+
                    '<div style="font-size:13px;margin-top:10px"><a href="'+link+'" target="_blank">TSDB Query Link</a></div>' +
                    '<div style="font-size: 13px;position: absolute;bottom: 30px;margin: auto;width: 100%;" class="removeGraph">' +
                    '<a href="#" class="btn btn-default btn-refresh-graph" title="Query Again">Query Again <span class="glyphicon glyphicon-repeat pull-right"></span></a>&nbsp;' +
                    '<a href="#" class="btn btn-default btn-remove-graph" title="Remove Graph">Remove Graph <span class="glyphicon glyphicon-remove pull-right"></span></a>' +
                    '</div>' +
                '</div>');
                $("#"+thisObj.config.id).find(".btn-remove-graph").click(function() {
                  thisObj.config.gridster.remove_widget_byPanel($("#"+thisObj.config.id).closest(".panel"));
                });
                $("#"+thisObj.config.id).find(".btn-refresh-graph").click(function() {
                  thisObj.config.gridster.refreshGraph($("#"+thisObj.config.id).closest(".panel"));
                });
              }
              else{
                $("#"+thisObj.config.id).html('<div style="font-size:14px;color:#f00;margin-top:20px;text-align:center;">'+
                    '<span class="glyphicon glyphicon-warning-sign"></span> Error in querying data from TSDB.'+
                    '<div style="font-size:13px;margin-top:10px"><a href="'+link+'" target="_blank">TSDB Query Link</a></div>' +
                    '<div style="font-size: 13px;position: absolute;bottom: 30px;margin: auto;width: 100%;" class="removeGraph">' +
                    '<a href="#" class="btn btn-default btn-remove-graph" title="Remove Graph">Remove Graph <span class="glyphicon glyphicon-remove pull-right"></span></a>' +
                    '</div>' +
                '</div>');
                $("#"+thisObj.config.id).find(".btn-remove-graph").click(function() {
                  thisObj.config.gridster.remove_widget_byPanel($("#"+thisObj.config.id).closest(".panel"));
                });
              }
              //_cb(-1);
              //return;
            }//(status != 200)

            var noData = true;
            for(var j in dpSets) {
              var dp = dpSets[j];
              for(var i in dp) {
                if(dpSets.length > 0) {
                  noData = false;
                  break;
                }
              }
            }

            if(noData) {
              if(!addNewMetric) {
                $("#"+thisObj.config.id).html('<div style="font-size:14px;margin-top:20px;text-align:center;" class="noResponse">'+
                    '<span class="glyphicon glyphicon-warning-sign"></span> No metric points retrieved for given query.'+
                    '<div style="font-size:13px;margin-top:10px"><a href="'+link+'" target="_blank">TSDB Query Link</a></div>' +
                '</div>');
              } else if($("#"+thisObj.config.id + ">div").hasClass("noResponse")) {
                $("#"+thisObj.config.id+ ">div.noResponse").append('<div style="font-size:13px;margin-top:10px"><a href="'+link+'" target="_blank">TSDB Query Link</a></div>');
              }
              _cb(-1);
              return;
            }

            var colors = null;
            var titles = [];
            var titlesUser = [];
            if (thisObj.config.data.lineConfig) {
              colors = $.extend(true, [], defaults.colors[theme]);
            } else {
              colors = defaults.colors[theme];
            }
            var crcs = [];
            var series = [];

            var tenant = metrics[0].metricInfo.tenant;
            var cnt = 0;
            var clr = 0;
            var clrHash = {};
            for(var j in dpSets) {
              var dp = dpSets[j];
              if (dp.length === 0) { cnt++; continue};

              // applying scaling factor arithmetic
              if(metricsQueryInfo[cnt].arithmetic && metricsQueryInfo[cnt].arithmetic != "") {
                for(var x in dp) {
                  dp[x].dps = seriesLib.generateSeries(1, [dp[x].dps], "(a"+metricsQueryInfo[cnt].arithmetic+")", false, false);
                }
              }
              
              if(thisObj.config.gridster.options.renderer.extrapolate) {
                var showWarning = false;
                $.each(dp, function(seriesIndex, series) {
                  var split = series.metric.split(".");
                  var resolution = parseInt(split[split.length-1]);
                  if(resolution <= 60) {
                    var lastTimestamp = series.dps[series.dps.length-1][0];
                    if(lastTimestamp + thisObj.config.gridster.options.renderer.extrapolate*60 < endTime) {
                      // no extrapolation as no point for more than x mins
                      thisObj.outOfExtrapolationBound = true;
                      showWarning = true;
                    } else {
                      while(true) {
                        timestampToAdd = lastTimestamp + resolution;
                        if((timestampToAdd + (resolution/10)) <= endTime) { // add new point
                          lastTimestamp = timestampToAdd;
                          series.dps.push([timestampToAdd, series.dps[series.dps.length-1][1]])
                        } else {
                          break;
                        }
                      }
                    }
                  }
                });
                if(showWarning) {
                  $("#"+thisObj.config.id).closest(".mainPanel").css("border", "3px solid mediumPurple");
                } else {
                  $("#"+thisObj.config.id).closest(".mainPanel").css("border", "none");
                }
              }

              SHERLOCKLIB.convertDataPointsToTZByTenantV3(dp, {tenant:tenant});
              for(var i in dp) {
                var _series = {};

                var matchArr = metricsQueryInfo[cnt].baseMetricForV1CRC.match(/(.*\.\w+)\.(\w+)$/);
                var metricToCRC = matchArr[matchArr.length-2];

                var tagsHash = metricsQueryInfo[cnt].tagsHash;
                var tagsNValues = [];
                var tagValues = [];
                for (var iTags in dp[i].tags) {
                  if (!tagsHash[iTags]) continue;
                  tagsNValues.push(iTags+":"+dp[i].tags[iTags]);
                  tagValues.push(dp[i].tags[iTags]);
                }
                tagsNValues = tagsNValues.sort();
                var strTagsKV = tagsNValues.join(",");
                var forTitle = metricToCRC+"{"+strTagsKV+"}";
                var crcOld = 0;
                var crc = 0;
                var baseGenSeriesId = 0;
                titlesUser.push(forTitle);
                var lineConfigHash = {};
                var yAxisScale = 0;
                var metricIdx = metricsQueryInfo[cnt].metricIdx;
                if (metricsQueryInfo[cnt].yAxisScale) yAxisScale = metricsQueryInfo[cnt].yAxisScale;
                if (!(thisObj.config.data.lineConfig instanceof Array)) {
                  lineConfigHash = thisObj.config.data.lineConfig;
                  var forCRC = forTitle;
                  crcOld = crc32(forCRC);
                  forCRC = "{"+strTagsKV+"}";
                  baseGenSeriesId =  metricIdx + ":"+ crc32(forCRC);
                  if (metricsQueryInfo[cnt].wow) {
                    crcNew = baseGenSeriesId + ":" + metricsQueryInfo[cnt].wow+"w";
                  } else if (metricsQueryInfo[cnt].dod) {
                    crcNew = baseGenSeriesId + ":" + metricsQueryInfo[cnt].dod+"d";
                  } else {
                    crcNew = baseGenSeriesId;
                  }
                } else {
                  lineConfigHash = thisObj.config.data.lineConfig[metricIdx];
                  var forCRC = "{"+strTagsKV+"}";
                  crcOld = crc32(forCRC);
                  baseGenSeriesId = metricIdx + ":" + crcOld;
                  if (metricsQueryInfo[cnt].wow) {
                    crcNew = baseGenSeriesId + ":" + metricsQueryInfo[cnt].wow+"w";
                  } else if (metricsQueryInfo[cnt].dod) {
                    crcNew = baseGenSeriesId + ":" + metricsQueryInfo[cnt].dod+"d";
                  } else {
                    lineConfigHash = thisObj.config.data.lineConfig[metricIdx];
                    var forCRC = "{"+strTagsKV+"}";
                    crcOld = crc32(forCRC);
                    baseGenSeriesId = metricIdx + ":" + crcOld;
                    if (metricsQueryInfo[cnt].wow) {
                      crcNew = baseGenSeriesId + ":" + metricsQueryInfo[cnt].wow+"w";
                    } else if (metricsQueryInfo[cnt].dod) {
                      crcNew = baseGenSeriesId + ":" + metricsQueryInfo[cnt].dod+"d";
                    } else {
                      crcNew = baseGenSeriesId;
                    }
                  }
                }
                crcNew = yAxisScale+":"+crcNew;
                _series.id = crcNew;
                crcs.push(crcNew);

                if (lineConfigHash && lineConfigHash[crcOld]) {
                  var lineConfig = lineConfigHash[crcOld];
                  if (lineConfig.line.color && lineConfig.line.color[theme]) {
                    _series.color = lineConfig.line.color[theme];
                  } else {
                    if (i < colors.length) {
                      _series.color = colors[clr++];
                    } else {
                      _series.color = fnGetRandomColour();
                    }
                  }
                  if (lineConfig.line.name) {
                    _series.name = lineConfigHash[crcOld].line.name;
                  } else {
                    _series.name = metricToCRC+"{"+tagValues.join(":")+"}";
                  }
                  if (lineConfig.line.dashStyle) {
                    _series.dashStyle = lineConfig.line.dashStyle;
                  }
                  if (lineConfig.line.type) {
                    _series.type = lineConfig.line.type;
                  }
                  if (lineConfig.line.marker) {
                    _series.marker = {enabled : true};
                    if (lineConfig.line.marker.symbol) {
                      _series.marker.symbol = lineConfig.line.marker.symbol
                    }
                  }
                } else {
                  if (metricsQueryInfo[cnt].multiValueTagsCount == 1 && dp[i].tags.colo && defaults.colorsBy.colo[theme][dp[i].tags.colo.toLowerCase()]) {
                    _series.color = defaults.colorsBy.colo[theme][dp[i].tags.colo.toLowerCase()];
                  } else {
                    if (i < colors.length) {
                      _series.color = colors[clr++];
                    } else {
                      _series.color = fnGetRandomColour();
                    }
                  }
                  _series.name = metricToCRC+"{"+tagValues.join(":")+"}";
                }

                if (metricsQueryInfo[cnt].wow) {
                  var valStr = metricsQueryInfo[cnt].wow + "w";
                  if (lineConfigHash && lineConfigHash[crcOld] && lineConfigHash[crcOld][valStr]) {
                    var config = lineConfigHash[crcOld][valStr];
                    _series.name = config.name;
                    _series.type = config.type;
                    _series.dashStyle = config.dashStyle;
                    _series.color = config.color[theme];
                    if (config.marker) {
                      _series.marker = {enabled : true};
                      if (config.marker.symbol) {
                        _series.marker.symbol = config.marker.symbol
                      }
                    }
                  } else {
                    var label = " week ago ";
                    if (metricsQueryInfo[cnt].wow > 1) label = " weeks ago ";
                    _series.name = metricsQueryInfo[cnt].wow + label + _series.name;
                    _series.color = clrHash[baseGenSeriesId];

                    var markerInfo = {
                        enabled : true,
                        symbol : (metricsQueryInfo[cnt].wow == 1) ? "triangle" : "triangle-down"
                    };
                    _series.marker = markerInfo;
                  }
                  //thisObj.config.panel.showWOWToggle();
                } else if (metricsQueryInfo[cnt].dod) {
                  var valStr = metricsQueryInfo[cnt].dod + "d";
                  if (lineConfigHash && lineConfigHash[crcOld] && lineConfigHash[crcOld][valStr]) {
                    var config = lineConfigHash[crcOld][valStr];
                    _series.name = config.name;
                    _series.type = config.type;
                    _series.dashStyle = config.dashStyle;
                    _series.color = config.color[theme];
                    if (config.marker) {
                      _series.marker = {enabled : true};
                      if (config.marker.symbol) {
                        _series.marker.symbol = config.marker.symbol
                      }
                    }
                  } else {
                    var label = " day ago ";
                    if (metricsQueryInfo[cnt].dod > 1) label = " days ago ";
                    _series.name = metricsQueryInfo[cnt].dod + label + _series.name;
                    _series.color = clrHash[baseGenSeriesId];

                    var markerInfo = {
                        enabled : true,
                        symbol : "circle"
                    };
                    _series.marker = markerInfo;
                  }
                  //thisObj.config.panel.showDODToggle();
                } 

                if (!metricsQueryInfo[cnt].wow && !metricsQueryInfo[cnt].dod) {
                  clrHash[baseGenSeriesId] = _series.color;
                }

                _series.data = dp[i].dps;
                _series.yAxis = yAxisScale;

                series.push(_series);
              }
              cnt++;
            }

            var scaleInfo = {};
            if (!thisObj.config.data.scaleInfo) {
              var yAxis = [];
              for (var j in metrics) {
                var metricInfo = metrics[j].metricInfo;
                var yAxisScale = {
                    title : (metricInfo.customName != "")?metricInfo.customName:metricInfo.name,
                        color : {
                          light : "#707070",
                          dark : "#707070"
                        }
                };
                yAxis.push(yAxisScale);
              }
              scaleInfo.xAxis = {
                  color : {
                    light : "#707070",
                    dark : "#707070"
                  }               
              };
              scaleInfo.yAxis = yAxis;
              thisObj.config.data.scaleInfo = scaleInfo;
            } else {
              scaleInfo = thisObj.config.data.scaleInfo;
            }

            if (foundErrors) {
              _cb({
                series : series,
                crcs : crcs,
                titlesUser : titlesUser,
                scaleInfo : scaleInfo
              }, -1);
            } else 
              _cb({
                series : series,
                crcs : crcs,
                titlesUser : titlesUser,
                scaleInfo : scaleInfo,
                startTime: SHERLOCKLIB.convertTimeStampV3(startTime*1000, {tenant: tenant, byTenant:true}),
                endTime: SHERLOCKLIB.convertTimeStampV3(endTime*1000, {tenant: tenant, byTenant:true})
              });
          });
        });
      };

  	
      thisObj._drawGraph = function(seriesInfo, showAjaxLoadAnimation) {
    	var plotStart = seriesInfo.endTime;
    	var extrapolatedValue = 0;
    	
    	if(plot) {
    		$.each(seriesInfo.series, function(seriesIndex, series) {
    			plotStart = Math.min(plotStart, series.data[series.data.length-1][0]);
    			if(plotStart == series.data[series.data.length-1][0]) {
    				extrapolatedValue = series.data[series.data.length-1][1];
    			}
    		})

    		var newSeries;
    		$.each(seriesInfo.series, function(seriesIndex, series) {
    			if(series.name == "Total") {
    				var index;
    				$.each(series.data, function(dpi, dp) {
    					if(dp[0] > plotStart) {
    						dp[1] += extrapolatedValue;
    						if(!index) {
    							index = dpi;
    						}
    					}
    				})
    				var oldData = series.data.slice(0, index);
    				var newData = series.data.slice(index-1);
    				
    				series.data = oldData;
    				series.zIndex = 2;
    				series.lineWidth = 3;

    				newSeries = $.extend(true, {}, series);
    				newSeries.data = newData;
    				newSeries.dashStyle = "ShortDash";
    				newSeries.name = "Total (extrapolated)";
    				newSeries.zIndex = 1;
    			}
    		})
    		if(newSeries) seriesInfo.series.push(newSeries);
    	}
        if(!seriesInfo) return;
        
        if (seriesInfo === -1) {
          box.remove();
          return;
        }
        thisObj.seriesInfo = seriesInfo;
        
        var theme = "light";
        if(thisObj.config.gridster.options.renderer.dark) theme = "dark";
        require(["ui/HighStockUI"], function(HS) {
          thisObj.GraphClass = HS;
          
          var hideLegends = false;
          if(thisObj.config.gridster.options.renderer.hideLegends) {
        	  hideLegends = true;
          }
          
          var graphcfg = {
              id:thisObj.config.id,
              series : seriesInfo.series,
              scaleInfo : seriesInfo.scaleInfo,
              animation : showAjaxLoadAnimation,
              theme: theme,
              hideLegends: hideLegends ,
              startTime: seriesInfo.startTime,
              endTime: seriesInfo.endTime,
              step: thisObj.config.gridster.options.renderer.step,
              minorGridLines: thisObj.config.gridster.options.renderer.minorGridLines,
              plotStart: plot ? plotStart : false
          };
          
          if(thisObj.graph) {
            thisObj.graph.destroy();
          }
          thisObj.graph = new HS(graphcfg);
          box.remove();
        });
      };

      thisObj.drawGraph = function(options) {
        if(typeof options.showAjaxLoadAnimation == "undefined" || options.showAjaxLoadAnimation) {
          box = new AjaxLoader("#"+thisObj.config.id);
        }
        if (options.noFetchSeries) {
          thisObj._drawGraph(thisObj.seriesInfo);
          return;
        }
        thisObj.getSeries(metrics, thisObj.config.id, function(seriesInfo, err) {
          if (err && err == -1) {
            thisObj.seriesInfo = seriesInfo;
          } else {
            thisObj._drawGraph(seriesInfo, options.showAjaxLoadAnimation);
          }
        });
      };

      var options = {showAjaxLoadAnimation: true};
      thisObj.drawGraph(options);
    };

    thisObj.config.panel.setOnToggleLeftSideOptions(function(val, isChecked) {
      thisObj.onToggleLeftSideOptions(val, isChecked);
    });

    this.onToggleLeftSideOptions = function(val, isChecked) {
      var chart = $("#"+thisObj.config.id).highcharts();
      var series = chart.series;
      for(var i in series) {
        var _series = series[i];
        var id = _series.userOptions.id;
        if (id.indexOf(":"+val)!=-1) {
          if (isChecked) {
            _series.show();
          } else {
            _series.hide();
          }
        }
      } 
    };

    this.resize = function() {
      if (thisObj.graph)
        thisObj.graph.resize(); 
    };

    this.showSettings = function() {
      require(["ui/GraphSettings", "ui/HighStockUI"], function(GraphSettings, GraphClass) {
        var settings = new GraphSettings({
          id:thisObj.config.id,
          graphParentObj : thisObj,
          graphObj:thisObj.graph,
          graphClass : GraphClass,
          graphcfg : {
            id : thisObj.config.id,
            series : thisObj.seriesInfo.series,
            scaleInfo : thisObj.seriesInfo.scaleInfo
          },
          input : {
            crcs : thisObj.seriesInfo.crcs,
            lineUserIdTitle : thisObj.seriesInfo.titlesUser
          },
          lineConfig : thisObj.config.data.lineConfig,
          dataRef : thisObj.config.data 
        });
        settings.render();
      });
    };

    this.addLines = function() {
      require(["ui/AddEditPlotLineOrBandsDlg"], function(AddEditPlotLineOrBandsDlg) {
         if (!thisObj.config.data.scaleInfo) {
           thisObj.config.data.scaleInfo = {
              xAxis  : {
                color : {
                  light : "#707070",
                  dark : "#707070"
                },
              },
              yAxis : [{
                color : {
                  light : "#707070",
                  dark : "#707070"
                } 
              }]
           }
         }
         var addEditPlotLineOrBandsDlg = new AddEditPlotLineOrBandsDlg({
           scaleInfo : thisObj.config.data.scaleInfo,
           updated : function() {
             var chart = $("#"+thisObj.config.id).highcharts();
             chart.destroy();
             thisObj._drawGraph(thisObj.seriesInfo);
           }
         });
         addEditPlotLineOrBandsDlg.render();
      });
    };

    this.addMetric = function() {
      require(["ui/AddEditMetricDlg"], function(AddEditMetricDlg) {
        var addEditMetricDlg = new AddEditMetricDlg({
          scaleInfo : thisObj.config.data.scaleInfo,
          cbAdd : function (_metrics, response) {
            box = new AjaxLoader("#"+thisObj.config.id);
            thisObj.getSeries([{metricInfo:_metrics[0].metricInfo}], thisObj.config.id, function(seriesInfo) {
              for(var x in seriesInfo.series) {
            	var parts = seriesInfo.series[x].id.split(":");
            	parts[1] = thisObj.config.data.metrics.length; // since we are querying only the new metric, update id of each of the new series
            	seriesInfo.series[x].id = parts.join(":");
              }
              for(var x in seriesInfo.crcs) {
            	  var parts = seriesInfo.crcs[x].split(":");
            	  parts[1] = thisObj.config.data.metrics.length; // since we are querying only the new metric, update crc
            	  seriesInfo.crcs[x] = parts.join(":");
              }
              thisObj.config.data.scaleInfo = response.scaleInfo;
              thisObj.config.data.metrics.push({metricInfo:_metrics[0].metricInfo});
              if (seriesInfo === -1) {
                box.remove();
                return;
              }
              /*var nScaleAdded = false;
              if (thisObj.config.data.scaleInfo.length != response.scaleInfo.length) {
                nScaleAdded = true;
              }*/
              if (!thisObj.seriesInfo) {
                thisObj.seriesInfo = {};
                thisObj.seriesInfo.series = [];
                thisObj.seriesInfo.crcs = [];
                thisObj.seriesInfo.titlesUser = [];
                thisObj.seriesInfo.scaleInfo = {};
                thisObj.seriesInfo.scaleInfo.series = [];
                thisObj.seriesInfo.scaleInfo.xAxis = {};
                thisObj.seriesInfo.scaleInfo.yAxis = [];
              }
              
              thisObj.seriesInfo.scaleInfo = response.scaleInfo;
              thisObj.seriesInfo.crcs.push.apply(thisObj.seriesInfo.crcs, seriesInfo.crcs); 
              thisObj.seriesInfo.series.push.apply(thisObj.seriesInfo.series, seriesInfo.series); 
              thisObj.seriesInfo.titlesUser.push.apply(thisObj.seriesInfo.titlesUser, seriesInfo.titlesUser);
              var chart = $("#"+thisObj.config.id).highcharts();
              if(chart) chart.destroy();
              thisObj._drawGraph(thisObj.seriesInfo);
              box.remove();
            }, true); 
          }
        });
      });
    };

    this.metricsExplorer = function () {
      require(["ui/MetricsExplorer", "ui/HighStockUI"], function(MetricsExplorer, GraphClass) {
        if (!thisObj.seriesInfo) {
          thisObj.seriesInfo = {};
          thisObj.seriesInfo.series = [];
          thisObj.seriesInfo.crcs = [];
          thisObj.seriesInfo.titlesUser = [];
          thisObj.seriesInfo.scaleInfo = {};
          thisObj.seriesInfo.scaleInfo.series = [];
          thisObj.seriesInfo.scaleInfo.xAxis = {};
          thisObj.seriesInfo.scaleInfo.yAxis = [];
        }
        var _metricExplorer = new MetricsExplorer({
          id : thisObj.config.id,
          graphParentObj : thisObj,
          graphObj : thisObj.graph,
          graphClass : GraphClass,
          graphcfg : {
            id : thisObj.config.id,
            series : thisObj.seriesInfo.series,
            scaleInfo : thisObj.seriesInfo.scaleInfo
          },
          input : {
            seriesInfo : thisObj.seriesInfo,
            metrics : thisObj.config.data.metrics
          },
          lineConfig:thisObj.config.data.lineConfig
        });
        _metricExplorer.render();
      });
    };

    setTimeout(function() {
      thisObj.render();
    }, 10);
  }
  return Graph;
});
