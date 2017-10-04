define([ "ui/BootstrapPanel", "ui/Graph" ], function(Panel, Grapher) {
  var Gridster = function(options) {
    var thisObj = this;
    this.options = options;
    this.config = options.gridsterConfig;
    this.id = this.config.id;
    this.graphAlertMappings = [];
    this.widgetHandlers = [];

    this.gridsterJqDom = $("#" + this.config.id + ">ul");
    var thisObj = this;

    var base_width = this.config.basewidth;

    this.gridster = this.gridsterJqDom.gridster({
      namespace : '#' + this.config.id,
      max_size_x : 12,
      min_cols: 12,
      widget_margins : [ 5, 5 ],
      widget_base_dimensions : [ base_width, base_width ],
      helper : 'clone',
      resize: {
        enabled: true,
        stop: function (e, ui, $widget) {
          var id = $widget.children().children('div.panel-body').attr('id');
          thisObj.widgetHandlers[id].resize();
        }
      },
      draggable : {
        handle: 'header, header span',
        stop: function(event, ui) {
          var prev = ui.$player.parent().parent().attr("id");
          var target = options.renderer.activeGrid;

          if(target != -1 && target != prev) {
            options.renderer.removeWidget(ui.$player, prev, target);
          }
          options.renderer.previous = -1;
        },
        start: function(event, ui) {
          options.renderer.previous = ui.$player.parent().parent().attr("id");
        },
        drag: function(event, ui) {
          var top = event.pageY - $(window).scrollTop();
          var bottom = top + ui.$player.height();
          if(top < 20) {
            var scrollTop = $('#createDashboard .modal-dialog > .modal-content').scrollTop();
            $('#createDashboard .modal-dialog > .modal-content').scrollTop(scrollTop - 30);
          }
          else if(bottom + 20 > $(window).height()) {
            var scrollTop = $('#createDashboard .modal-dialog > .modal-content').scrollTop();
            $('#createDashboard .modal-dialog > .modal-content').scrollTop(scrollTop + 30);
          }

        }
      }
    }).data('gridster');

    if (!options.editable) {
      this.gridster.disable();
      this.gridster.disable_resize();
    }

    var getRandomArbitrary = function(min, max) {
      var thisObj = this;
      return Math.floor(Math.random() * (max - min) + min);
    }

    this.refreshGraph = function(panel) {
      var id = panel.find(".panel-body").attr("id");
      $("#"+id).empty();
      thisObj.widgetHandlers[id].drawGraph({});
    }

    this.refreshAllGraphs = function(options) {
      for(var x in thisObj.widgetHandlers) {
        if(thisObj.widgetHandlers[x].drawGraph) thisObj.widgetHandlers[x].drawGraph(options);
      }
    }
    
    this.renderAllGraphs = function() {
      for(var x in thisObj.widgetHandlers) {
        thisObj.widgetHandlers[x].render();
      }
    }

    this.remove_widget_byPanel = function(panel) {
      bootbox.confirm("Are you sure you want to delete the graph?", function(result) {
        if(result) {
          var widget = panel.closest("li");
          thisObj.remove_widget(widget);
        }
      });
    }

    this.remove_widget = function(widget) {
      var idx = widget.index();
      var thisObj = this;
      var detachedObject = thisObj.config.widgets[idx];
      this.gridster.remove_widget(widget, true, function() {
        thisObj.config.widgets.splice(idx, 1);
      });
      return detachedObject;
    }

    this.addWidget = function(graph, idx) {
      var id = "sh_" + getRandomArbitrary(100000, 200000);

      var graphAlertMapping = {
    		  id: id
      };
      var metrics = []
      $.each(graph.data.metrics, function(metricIndex, metric) {
    	  
    	  function cartesian(arrayOfArrays) {
    		  var r = [], arg = arrayOfArrays, max = arg.length-1;
    		  function helper(arr, i) {
    			  for (var j=0, l=arg[i].length; j<l; j++) {
    				  var a = arr.slice(0); // clone arr
    				  a.push(arg[i][j])
    				  if (i==max) {
    					  r.push(a);
    				  } else
    					  helper(a, i+1);
    			  }
    		  }
    		  helper([], 0);
    		  return r;
    	  };
    	  
    	  var nameArr = [];
    	  var valueArr = [];
    	  $.each(metric.metricInfo.tags, function(tagIndex, tag) {
    		  nameArr.push(tag.key);
    		  valueArr.push(tag.value);
    	  });
    	  
    	  var tags = [];
    	  if(nameArr.length == 1) {
    		  $.each(valueArr, function(valueIndex, value) {
    			  var tag = {};
    			  tag[nameArr[0]] = value;
    			  tags.push(tag);
    		  })
    	  } else {
    		  var cartesianProduct = cartesian(valueArr);
    		  $.each(cartesianProduct, function(setIndex, set) {
    			  var tagSet = {}
    			  $.each(nameArr, function(nameIndex, name) {
    				  tagSet[name] = set[nameIndex];
    			  })
    			  tags.push(tagSet);
    		  });
    	  }
    	  
    	  metrics.push({
    		  name: metric.metricInfo.name,
    		  tags: tags
    	  })
      });
      graphAlertMapping.metrics = metrics;
      thisObj.graphAlertMappings.push(graphAlertMapping)
      
      var panelcfg = {
          id : id,
          title : graph.title,
          onCloseClick : this.remove_widget_byPanel.bind(this)
      };

      if (options.editable) { // create/edit page
        panelcfg.titleEditable = true;
        panelcfg.isEditGraph = false;
        panelcfg.onChange = function(title) {
          graph.title = title;
          return true;
        };
        panelcfg.onToolsClick = function() {
          grapher.showSettings();
        };
        panelcfg.onAddSeriesClick = function() {
          grapher.addMetric();
        };
        panelcfg.onAddLinesClick = function() {
          grapher.addLines();
        };
        panelcfg.onEditClick = function() {
          grapher.metricsExplorer();
        };
        panelcfg.onDescriptionClick = function() {
          var html = '<div class="form-horizontal">'+ 
              '<div class="row form-group">' +
                '<div class="col-sm-2 text-right control-label">URL</div>'+
                '<div class="col-sm-9"><input class="form-control" type="text" id="metadataUrl" placeholder="http://www.example.com/path/to/name" value="'+(graph.metadata && graph.metadata.url ? graph.metadata.url : '')+'" /></div>'+
              '</div>'+
              '<div class="row form-group">' +
                '<div class="col-sm-2 text-right control-label">Description</div>'+
                '<div class="col-sm-9"><textarea rows=4 class="form-control" id="metadataDescription" placeholder="Enter description of the graph">'+(graph.metadata && graph.metadata.description ? graph.metadata.description : '')+'</textarea></div>'+
              '</div>'+
            '</div>';
          bootbox.confirm(html, function(result) {
            if(result) {
              var metadataUrl = $.trim($("#metadataUrl").val());
              var metadataDescription = $.trim($("#metadataDescription").val());
              graph.metadata = {};
              if(metadataUrl.length > 0) {
                graph.metadata.url = metadataUrl;
              } else {
                delete graph.metadata.url;
              }
              if(metadataDescription.length > 0) {
                graph.metadata.description = metadataDescription;
              } else {
                delete graph.metadata.description;
              }
            }
          });
        };
        panelcfg.onMoveClick = function(ul) {
          return thisObj.options.moveToGroup(thisObj.id, ul);
        };
        panelcfg.show_tools = true;
      } else { // view page
        panelcfg.disable_close = true;
        panelcfg.disable_border = true;
        
        if(graph.metadata && graph.metadata.url) {
          panelcfg.url =  graph.metadata.url;
        }
        if(graph.metadata && graph.metadata.description) {
          panelcfg.description =  graph.metadata.description;
        }
        
        if(thisObj.options.renderer.labelFontSize) {
          panelcfg.labelFontSize = thisObj.options.renderer.labelFontSize;
        }
        
        if(thisObj.options.renderer.config.alertsConfig) {
        	var metricsMap = thisObj.options.renderer.config.alertsConfig.metricsMap
        	for(var entry in metricsMap) {
        		var metricDef = metricsMap[entry] //.history_label; 
        		$.each(graph.data.metrics, function(metricIndex, metric) {
        			if(metricDef.metricName.indexOf(metric.metricInfo.name) == 0) {
        				var dims = [];
        				$.each(metric.metricInfo.tags, function(tagIndex, tag) {
        					try{
        						dims.push(tag.key + "~" + tag.value.join(","));
        					} catch(e) {
        					}
        				})
        				dims = dims.join("|");
        				panelcfg.historicalUrl = "/HistoricalAlertsApp/alerts?tenant=pp&profile="+metric.metricInfo.profile+"&metrics="+metricDef.history_label+"&dims="+dims+"&relTime=0d1h0m";
        			}
        		})
        	}
        }
      }

      var panel = new Panel(panelcfg);
      if (idx != -1) {
        var jqLi = this.gridsterJqDom.find("li.gs-w");
        var widget = jqLi.eq(idx).append(panel.getJqDom());
      } else {
        var jqLi = this.gridsterJqDom.find("li:last");
        var widget = jqLi.append(panel.getJqDom());
      }
      var cfg = {
          panel : panel,
          title : graph.title,
          data : graph.data,
          id : id,
          tsdb : graph.tsdb,
          ajaxPool : this.config.ajaxPool,
          time: this.config.time,
          gridster: thisObj
      };
      var grapher = new Grapher(cfg, options.editable);
      this.widgetHandlers[id] = grapher;
    };

    this.main = function() {
      for ( var i in this.config.layout) {
        var t = this.config.layout[i];
        if (this.gridster) {
          this.gridster.add_widget('<li data-idx="' + i + '" />', t.size_x, t.size_y, t.col, t.row);
        }
      }

      for ( var i in thisObj.config.widgets) {
        var graph = thisObj.config.widgets[i];
        thisObj.addWidget(graph, i);
      }
    }

    this.getWidgetsAndLayout = function() {
      var layout = this.gridster.serialize();
      var widgets = this.config.widgets;

      return {
        layout : layout,
        widgets : widgets
      };
    }

    this.drop = function(data, title, sizex, sizey) {
      var tsdb = {
          "tsdbcfg": {
            "timeout":7000,
            "enabledCORS":false,
            "byProfile":true,
            "useSecondary" : (data.useSecondary ? data.useSecondary : false),
            "api_url":"http://cmevpsqry.vip.stratus.slc.ebay.com:8080",
            "version":"custom"
          }
      };

      if (this.gridster) {
        var widget = this.gridster.add_widget('<li/>', sizex?sizex:4, sizey?sizey:2);
      }
      var graph = {
          type : "graph",
          version : "v1",
          title: title,
          data : data,
          tsdb : tsdb
      };

      this.config.widgets.push(graph);

      this.addWidget(graph, -1);
    };

    this.saveLayoutToModel = function() {
      this.config.layout.length = 0;
      this.config.layout.push.apply(this.config.layout, this.gridster.serialize());
    };

    this.main();
  };
  return Gridster;
});
