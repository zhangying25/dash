define(function() {
  var DashboardRender = function(options) {
    var thisObj = this;
    $("#mainDashboard>.panel").remove();

    if(options.editable) {
      var time = {};
      time.end = Math.round(new Date().getTime()/1000);
      time.start = time.end - 3600;
      options.time = time;
      thisObj.editable = true;
    } else {
      thisObj.timeControl = $("#timeControl").timeCtrlSherlock_v2({renderer: thisObj});
      var timeRange = thisObj.timeControl.getDT();
      if(timeRange.start >= timeRange.end) {
        bootbox.alert("Start-time cannot be greater than or equal to end-time.");
        return;
      }
      options.time = timeRange;
      thisObj.editable = false;
    }

    this.config = options.dashboardConfig;
    this.activeGrid = -1;
    this.previous = -1;

    var ajaxPool = $.ajaxMultiQueue(10);
    var thisObj = this;

    var widthMargin = options.editable ? 20 : 13
        var basewidth = $(window).width()/12-widthMargin;

    $("#dashboardTitle").text(this.config.name);

    var tabs = [];
    var gridsters = [];
    var activeTab = 0;

    tabs.push(gridsters);

    this.getAlerts = function() {
    	var duration = 30;
    	if(getUrlParams().duration) duration=getUrlParams().duration;
    	
    	/////// if combined dashboard
    	if(Array.isArray(thisObj.config.alertsConfig.alertsProfile)) {
    	  var $ajaxQueue = [];
    	  var ajax =  $.ajax({
    	    timeout:20000,
    	    maxTries: 3,
    	    url : "/CoreApp/proxy/getHttp?url="+encodeURIComponent("http://www.shrlcksvc.stratus.ebay.com/MongoService/"+thisObj.config.alertsConfig.alertsProfile[0]+"/query/alerts?start="+duration+"m-ago"),
    	    type : "get",
    	    dataType : "json"
    	  });
    	  $ajaxQueue.push(ajax);
    	  ajax =  $.ajax({
    	    timeout:20000,
    	    maxTries: 3,
    	    url : "/CoreApp/proxy/getHttp?url="+encodeURIComponent("http://www.shrlcksvc.stratus.ebay.com/MongoService/"+thisObj.config.alertsConfig.alertsProfile[1]+"/query/alerts?start="+duration+"m-ago"),
    	    type : "get",
    	    dataType : "json"
    	  });
    	  $ajaxQueue.push(ajax);
    	  
    	  $.when.apply($, $ajaxQueue).then(function() {
    	    var result = arguments;

    	    var alerts = $.merge(result[0][0].result, result[1][0].result);
    	    var metaDataMetrics = $.merge(result[0][0].metadata.metrics, result[1][0].metadata.metrics);
    	    console.log("Fetching Alerts: ");
    	    for(var i in gridsters) {
    	      $.each(gridsters[i].graphAlertMappings, function(mappingIndex, mapping) {
    	        var severity = "2";
    	        $.each(mapping.metrics, function(metricIndex, metric) {
    	          $.each(alerts, function(alertIndex, alert) {
    	            var metricName;
    	            $.each(metaDataMetrics, function(metricMetadataIndex, metricMetadata) {
    	              if(metricMetadata[alert.metrics[0].name]) {
    	                metricName = metricMetadata[alert.metrics[0].name].metricName;
    	                metricName = metricName.replace(".wow_ad_STATE_3600s.STATE.60s", "")
    	              }
    	            })
    	            if(metricName.indexOf(metric.name) == 0) {
    	              $.each(metric.tags, function(tagIndex, tag) {
    	                for(var key in tag) {
    	                  var found = false;
    	                  $.each(alert.dims, function(dimIndex, dim) {
    	                    if(dim[key] == tag[key] || tag[key] == "*") {
    	                      found = true;
    	                      return false;
    	                    }
    	                  })
    	                  if(!found) {
    	                    return;
    	                  }
    	                }
    	                var severityMap = {
    	                    "warning": 4,
    	                    "Warning": 4,
    	                    "critical": 6,
    	                    "Critical": 6,
    	                    "fatal": 8,
    	                    "Fatal": 8,
    	                }
    	                currSeverity = alert.metrics[0].alerts[alert.metrics[0].alerts.length-1].type;
    	                currSeverity = severityMap[currSeverity];
    	                severity = Math.max(severity, currSeverity);
    	              })
    	            }
    	          })
    	        })
    	        var color = ["transparent", "transparent", "transparent", "yellow", "yellow", "orange", "orange", "red", "red"][severity];
    	        $("#"+mapping.id).parent().css("outline", "3px solid "+color);
    	      })
    	    }

    	    if(options.dashboardConfig.alertsConfig.showDynamic) {
    	      require(["plugins/DynamicAlerts"], function(DynamicAlerts) {
    	        dynamicAlerts = new DynamicAlerts({
    	          container: $("section.alerts"),
    	          alerts: alerts,
    	          alertsConfig: options.dashboardConfig.alertsConfig,
    	          theme: thisObj.dark ? "dark": "light",
    	              labelFontSize: thisObj.labelFontSize,
    	              step: thisObj.step,
    	              minorGridLines: thisObj.minorGridLines
    	        });
    	      });
    	    }
    	  });
    	    
    	}
    	
    	//////// Proceed with single profile dashboard
    	else {
    	
          $.ajax({
        	timeout:20000,
            maxTries: 3,
            url : "/CoreApp/proxy/getHttp?url="+encodeURIComponent("http://www.shrlcksvc.stratus.ebay.com/MongoService/"+thisObj.config.alertsConfig.alertsProfile+"/query/alerts?start="+duration+"m-ago"),
            type : "get",
            dataType : "json",
            success: function(response) { 
            	var alerts = response.result;
            	console.log("Fetching Alerts: ");
            	console.log(alerts);
            	for(var i in gridsters) {
            		$.each(gridsters[i].graphAlertMappings, function(mappingIndex, mapping) {
            			var severity = "2";
            			$.each(mapping.metrics, function(metricIndex, metric) {
            				$.each(alerts, function(alertIndex, alert) {
            					var metricName;
            					$.each(response.metadata.metrics, function(metricMetadataIndex, metricMetadata) {
            						if(metricMetadata[alert.metrics[0].name]) {
            							metricName = metricMetadata[alert.metrics[0].name].metricName;
            							metricName = metricName.replace(".wow_ad_STATE_3600s.STATE.60s", "")
            						}
            					})
            					if(metricName.indexOf(metric.name) == 0) {
            						$.each(metric.tags, function(tagIndex, tag) {
            							for(var key in tag) {
            								var found = false;
            								$.each(alert.dims, function(dimIndex, dim) {
            									if(dim[key] == tag[key] || tag[key] == "*") {
            										found = true;
            										return false;
            									}
            								})
            								if(!found) {
            									return;
            								}
            							}
            							var severityMap = {
            									"warning": 4,
            									"Warning": 4,
            									"critical": 6,
            									"Critical": 6,
            									"fatal": 8,
            									"Fatal": 8,
            							}
            							currSeverity = alert.metrics[0].alerts[alert.metrics[0].alerts.length-1].type;
            							currSeverity = severityMap[currSeverity];
           								severity = Math.max(severity, currSeverity);
            						})
            					}
            				})
            			})
            			var color = ["transparent", "transparent", "transparent", "yellow", "yellow", "orange", "orange", "red", "red"][severity];
            			$("#"+mapping.id).parent().css("outline", "3px solid "+color);
            		})
            	}
            	
            	if(options.dashboardConfig.alertsConfig.showDynamic) {
            		require(["plugins/DynamicAlerts"], function(DynamicAlerts) {
            			dynamicAlerts = new DynamicAlerts({
            				container: $("section.alerts"),
            				alerts: alerts,
            				alertsConfig: options.dashboardConfig.alertsConfig,
            				theme: thisObj.dark ? "dark": "light",
            				labelFontSize: thisObj.labelFontSize,
            				step: thisObj.step,
            				minorGridLines: thisObj.minorGridLines
            			});
            		});
            	}
            }
        });
    	}
    }
    
    this.refreshGraphs = function(options) {
      this.updateURL(options)
      for(var x in gridsters) {
        gridsters[x].refreshAllGraphs(options);
      }
    }
    
    this.renderGraphs = function() {
      for(var x in gridsters) {
        gridsters[x].renderAllGraphs();
      }
    }

    var setUrl = function (values) {
      var url = '?';
      for (var k in values) {
        if (values.hasOwnProperty(k)) {
          url = url + k + '=' + encodeURIComponent(values[k]) + '&';
        }
      }

      // remove & (the last character)
      if(url.indexOf('&') != -1) {
        url = url.slice(0,-1);
      }
      window.history.replaceState('somestate', 'sometitle', url);
    };

    var getUrlParams = function () {
      var vars = {};
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = decodeURIComponent(value);
        if(vars.end && (vars.end.match(/\//g) || []).length > 1){
        	vars.end = vars.end.replace("-","T");
            
        	vars.end = vars.end.replace(/\//g,"-");
        }
        if(vars.start && (vars.start.match(/\//g) || []).length > 1){
        	vars.start = vars.start.replace("-","T");
        	vars.start = vars.start.replace(/\//g,"-");
        }
        
      });
      return vars;
    };

    this.updateURL = function(options) {
      var params = getUrlParams();

      if(options.relTime) {
        delete params.start;
        delete params.end;
        delete params.fixedTime;
        params.relTime = options.relTime;
      } else if(options.fixedTime) {
        delete params.start;
        delete params.end;
        delete params.relTime;
        params.fixedTime = options.fixedTime;
      } else if(options.start && options.end) {
        delete params.relTime;
        delete params.fixedTime;
        params.start = options.start;
        params.end = options.end;
      }

      if(typeof options.useSecondary != 'undefined') {
        if(options.useSecondary) {
          params.useSecondary = true;
        } else {
          delete params.useSecondary;
        }
      }

      if(typeof options.useDark != 'undefined') {
        if(options.useDark) {
          params.useDark = true;
        } else {
          delete params.useDark;
        }
      }
      
      if(typeof options.refresh != 'undefined') {
        if(options.refresh) {
          params.refresh = options.refresh;
        } else {
          delete params.refresh;
        }
      }

      setUrl(params);
    }

    this.removeWidget = function(widget, source, target) {
      var detached, sizex, sizey;
      for(var x in gridsters) {
        if(gridsters[x].id == source) {
          sizex = widget.data('sizex');
          sizey = widget.data('sizey');
          detached = gridsters[x].remove_widget(widget);
          delete gridsters[x].widgetHandlers[widget.find('.panel-body[id^=sh]').attr('id')];
          break;
        }
      }
      for(var x in gridsters) {
        if(gridsters[x].id == target) {
          gridsters[x].drop(detached.data, detached.title, sizex, sizey);
          break;
        }
      }
    };

    this.renderAGridGroup = function(gridGroupInfo, idx, _cb) {
      require([ "ui/BootstrapPanel", "ui/Gridster" ], function(Panel,
          Gridster) {
        var id = "gridster_panel_" + idx;
        var panelcfg = {
            id : id + "_container",
            title : gridGroupInfo.title
        };
        if (options.editable) {
          panelcfg.titleEditable = true;
          panelcfg.isEditGraph = false;
          panelcfg.isCollapse = true;
          panelcfg.onChange = function(title) {
            if(thisObj.validateGroupName(title, function(){}, function(){}, true)) {
              gridGroupInfo.title = title;
              return true;
            }
            return false;
          };
          panelcfg.onCloseClick = function() {
            if(thisObj.config.data[activeTab].grids.length === 1) {
              bootbox.alert("A dashboard must have at least one group.");
              return;
            }
            bootbox.confirm("Are you sure you want to delete the group?", function(result) {
              if(result) {
                for(var i in thisObj.config.data[activeTab].grids) {
                  var _gridGroupInfo = thisObj.config.data[activeTab].grids[i];
                  if (_gridGroupInfo == gridGroupInfo) {
                    thisObj.config.data[activeTab].grids.splice(i, 1);
                    gridsters.splice(i, 1);
                    break;
                  }
                }
                $("#"+id+"_container").closest(".panel").remove();
              }
            });
          };
        } else {
          panelcfg.disable_close = true;
          panelcfg.disable_border = true;
          
          if(thisObj.hideTitles) {
        	  panelcfg.hideTitles = true;
          }
        }
        var panel = new Panel(panelcfg);
        var gridsterHtml = '<div class="gridster" id="'+id+'" style="padding:10px;width:100%;height:100%;">' +
        '<ul ondragover="allowDrop(event)" style="height:100%;width:100%"></ul>' +
        "</div>";
        var jqPanel = panel.getJqDom();
        if (options.dashboardContainerId != undefined) {
          $("#"+options.dashboardContainerId).append("<li>");
          $("#"+options.dashboardContainerId+" > li:last-child").append(panel.getJqDom());
          $("#"+options.dashboardContainerId).sortable('destroy').unbind('sortupdate').sortable().bind('sortupdate', function() {
            var newGridsters = [];
            var grids = thisObj.config.data[activeTab].grids;
            var newGrids = [];
            $("#mainShDashboard>li").each(function() {
              var id = $(this).find(".gridster").attr("id");
              for(var x in gridsters) {
                if(id == gridsters[x].id) {
                  newGridsters.push(gridsters[x]);
                  newGrids.push(grids[x]);
                }
              }
            });
            thisObj.config.data[activeTab].grids = newGrids;
            gridsters = newGridsters;
          });
        } else {
          $("#mainDashboard").append(jqPanel);
        }
        var ulHeight = $("#"+id+"_container").width()/6;
        var $gridsterHtml = $(gridsterHtml);
        if (gridGroupInfo.widgets.length == 0) {
          $gridsterHtml.find("ul").css({height:ulHeight+"px"});
        }

        $("#"+id+"_container").append($gridsterHtml);

        $("#"+id+"_container").on("mouseenter", '.gridster', function(){
          thisObj.activeGrid = id;
          if(thisObj.previous != -1 && thisObj.previous != id) {
            $(this).children("ul").addClass("onHover");
          }
        });

        $("#"+id+"_container").on("mouseleave", '.gridster', function(){
          thisObj.activeGrid = -1;
          $(this).children("ul").removeClass("onHover");
        });

        var cfg = {
            ajaxPool : ajaxPool,
            id : id,
            layout : gridGroupInfo.layout,
            widgets : gridGroupInfo.widgets,
            basewidth : basewidth,
            time: options.time
        }
        var gridster = new Gridster({
          gCointainerId : id + "_container",
          gridsterConfig : cfg,
          editable : options.editable,
          droppable: true,
          renderer: thisObj,
          moveToGroup: function(id, ul) {
            ul.empty();
            if(gridsters.length == 1) {
              $('<li class="disabled"><a href="#" style="padding:8px 20px">(no other groups exist)</a></li>').appendTo(ul)
              return false;
            }
            for(var x in gridsters) {
              if(gridsters[x].id == id) continue;
              $('<li><a href="#" style="padding:8px 20px">'+ $("#title_"+gridsters[x].id+"_container").text()  +'</a></li>').appendTo(ul).find("a").bind('click', function(cur) {
                return function() {
                  thisObj.removeWidget(ul.closest("li.gs-w"), id, gridsters[cur].id);
                }
              }(x));
            }
          }
        });
        gridsters.push(gridster);
        if(typeof _cb != 'undefined') {
          _cb(id + "_container");
        }
        
        // adjust height of bottom alerts section
        if(!options.editable && thisObj.config.alertsConfig) {
          $("section.alerts").height($("body").height() - $("section.alerts").offset().top - 10);
        }
      });
    };

    this.drop = function(options, id) {
      for(var i in gridsters) {
        if (gridsters[i].options.gCointainerId == id) {
          gridsters[i].drop(options, options.metrics[0].metricInfo.name, 4, 2);
        }
      }
    };

    this.validateGroupName = function(groupName, thisFunction, nextFunction, isExisting) {
      var valid = true;
      /* group name validations */
      var regex = new RegExp("^[\\w\\-\\s]+$");
      if (!regex.test(groupName)) {
        bootbox.alert("Please enter only alphanumeric characters.", function() {
          thisFunction(thisFunction, nextFunction);
        });
        valid = false;
      }
      
      if (thisObj.config.data.length == 0) {
        thisObj.config.data.push({grids:[]});
      } else {
        var found = 0;
        $('[id^=title_gridster_panel_]').each(function() {
          if($(this).text() === groupName
              && (typeof isExisting == "undefined" || !isExisting || (isExisting && ++found == 2))) {
            bootbox.alert("Group with name " + groupName + " already exists.", function() {
              thisFunction(thisFunction, nextFunction);
            });
            valid = false;
            return false;
          }
        });
      }
      return valid;
    }

    this.addGridsterGroup = function(groupName, thisFunction, nextFunction) {
      if(!thisObj.validateGroupName(groupName, thisFunction, nextFunction)) return false;

      var gridGroupInfo = {
          title : groupName,
          layout : [],
          widgets : []
      };
      thisObj.config.data[0].grids.push(gridGroupInfo);
      this.renderAGridGroup(gridGroupInfo, new Date().getTime(), nextFunction);
    };

    this.saveLayoutToModel = function() {
      for(var i in gridsters) {
        gridsters[i].saveLayoutToModel();
      }
    };

    this.useSecondary = function(useSecondary) {
      this.secondary = useSecondary;
    }

    this.useDark = function(useDark) {
      this.dark = useDark;
      if(!options.editable && thisObj.config.alertsConfig) {
        this.getAlerts();
      }
      if(useDark) {
        $("#themeCss1").attr("href","/MySherlockApp/assets/css/DashboardBuilder_dark.css");
        $("#themeCss2").attr("href","/MySherlockApp/assets/css/dashboard_dark.css");
      } else {
        $("#themeCss1").attr("href","/MySherlockApp/assets/css/DashboardBuilder.css");
        $("#themeCss2").attr("href","/MySherlockApp/assets/css/dashboard.css");
      }
    }

    var setParameters = function() {
      var params = getUrlParams();

      if(params.fixedTime || params.relTime || (params.start && params.end)) {
        thisObj.timeControl.setTime(params);
      }
      if(params.useSecondary) {
        thisObj.timeControl.useSecondary(true);
      }
      if(params.useDark) {
    	  if(thisObj.useDark) thisObj.useDark(JSON.parse(params.useDark));
          if(thisObj.timeControl && thisObj.timeControl.useDark) thisObj.timeControl.useDark(JSON.parse(params.useDark)) ;
      }
      if(params.refresh) {
        thisObj.timeControl.setRefresh(params.refresh);
      }
      if(params.hideTitles) {
    	thisObj.hideTitles = true;
      }
      if(params.hideLegends) {
    	  thisObj.hideLegends = true;
      }
      if(params.labelFontSize) {
        thisObj.labelFontSize = params.labelFontSize;
      }
      if(params.step) {
        thisObj.step = true;
      }
      if(params.minorGridLines) {
        thisObj.minorGridLines = true;
      }
      if(params.extrapolate) {
        thisObj.extrapolate = params.extrapolate; 
      }
    }

    // check URL and pre-select the parameters
    setParameters();

    if (thisObj.config.data) {
      for ( var i in thisObj.config.data[0].grids) {
        this.renderAGridGroup(thisObj.config.data[0].grids[i], i);
      }
  	if(!options.editable && thisObj.config.alertsConfig) {
		setInterval(function() {
			thisObj.getAlerts();
		}, 30*1000);
		setTimeout(function() {
			thisObj.getAlerts();
			$("section.alerts").height($("body").height() - $("section.alerts").offset().top - 10);
		}, 3*1000);
	} else {
		$("section.alerts").hide();
	}
    } else {
      thisObj.config.data = [];
      this.addGridsterGroup("Default Group");
    }
    $(document).scroll(function() {
      thisObj.renderGraphs();
    })
    $(window).resize(function() {
    	thisObj.renderGraphs();
    })
  };
  
  return DashboardRender;
});
