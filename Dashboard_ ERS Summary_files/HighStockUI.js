define(function(){
 
  /**
  * Highcharts plugin for adjustable chart height in response to legend height
  */
  (function (H) {
     H.wrap(H.Legend.prototype, 'render', function (proceed) {
         var chart = this.chart;
         proceed.call(this);
 	 chart.chartHeight = $(chart.container).height() - this.legendHeight;
 	 var translateY = chart.chartHeight - 4;
      this.group.attr('translateY',  translateY);
      if (this.group.alignAttr)
      this.group.alignAttr.translateY = translateY;
      this.positionCheckboxes();
     });
  }(Highcharts));


  var addPlotLinesBands = function(opts, yAxisData) {
    if (yAxisData && yAxisData.cusLinesOrBands) {
      opts.plotLines = [];
      for(var i in yAxisData.cusLinesOrBands) {
        var lineInfo = yAxisData.cusLinesOrBands[i];
        var plotLinesOptions = {
          value : lineInfo.value,
          color : lineInfo.color,
          width : lineInfo.width,
          dashStyle : lineInfo.dashStyle
        };

        if (lineInfo.label) {
          plotLinesOptions.label = {
             text : lineInfo.label.text,
             style:{
               color:lineInfo.label.color,
               "font-size":lineInfo.label.size+"px"
             }
          };
        }
        opts.plotLines.push(plotLinesOptions);
      }
    }
  }
  
  var theme = {
      chart: {
        backgroundColor: {
          light: "#ffffff",
          dark: "#111111"
        }
      },
      legend: {
        navigation: {
          activeColor: {
            light: '#3E576F',
            dark: '#cccccc'
          },
          inactiveColor: {
            light: '#CCC',
            dark: '#444'
          }
        },
        itemStyle: {
          color: {
            light: '#3E576F',
            dark: '#cccccc'
          }
        },
        itemHiddenStyle: {
          color: {
            light: '#CCC',
            dark: '#444'
          }
        },
        itemHoverStyle: {
          color: {
            light: '#1f2b37',
            dark: '#e5e5e5'
          }
        }
      },
      xAxis: {
        labels: {
          style: {
            color: {
              light: "#2a2a2a",
              dark: "#e5e5e5"
            }
          }
        },
        gridLineColor: {
          light: "#dddddd",
          dark: "#555555"
        },
        minorGridLineColor: {
          light: "#eeeeee",
          dark: "#333333"
        }
      },
      yAxis: {
        labels: {
          style: {
            color: {
              light: "#2a2a2a",
              dark: "#e5e5e5"
            }
          }
        },
        gridLineColor: {
          light: "#dddddd",
          dark: "#555555"
        },
        minorGridLineColor: {
          light: "#eeeeee",
          dark: "#333333"
        },
        title: {
          style: {
            color: {
              light: "#707070",
              dark: "#ff"
            }
          }
        }
      }
  }
  
  var SherlockHighStockChart = function (config){
	  
    this.graph = config;

    var options = {};
    options.title = { text: this.graph.title};
    options.chart = {
        zoomType: 'x',
        renderTo: this.graph.id,
        margin: 0,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 20,
        marginLeft: config.hideLegends ? 35 : 50,
        reflow:true,
        backgroundColor: theme.chart.backgroundColor[config.theme]
    };
    options.rangeSelector = { enabled: false };
    options.navigator = { enabled: false };
    options.scrollbar = { enabled: false };
    options.navigation = { buttonOptions: { enabled: false } };
    options.tooltip = {
      shared: false,
      formatter: function() {
        var yVal = this.y;
        var xVal = this.x;
        
        var value, s, e;
        value = yVal;
        if(value == 0) {
        } else if (value > 1) {
          s = ['', 'K', 'M', 'B', 'TRIL', 'QUAD', 'QUINT', 'SEXT'];
          e = Math.floor(Math.log(value) / Math.log(1000));
          value = value / Math.pow(1000, Math.floor(e));
          if(value % 1 != 0) {
            value = value.toFixed(2);
          }
          if(e > s.length - 1) {
        	  value = value  + 'E'+(e*3);
          }
          else {
          value = value + s[e];
          }
        }
        
        yVal = value;
        
        var splitArr = this.series.userOptions.id.split(":");
        if (splitArr.length > 3) {
          if (splitArr[3] == "1w" || splitArr[3] == "2w") {
            xVal -= 604800000 * parseInt(splitArr[3]);
          } else {
            xVal -= 86400000 * parseInt(splitArr[3]);
          }
        }
        var seriesSplit = this.series.name.split('{');
        var metric = seriesSplit[0];
        var dimensions = '{' + seriesSplit[1];
        if(seriesSplit[1] == undefined) {
        	dimensions = ""; 
        }
        else {
        	
        	dimensions = '<br /><span>' + dimensions + '</span>'
        }
        var tooltip = '' 
          + '<span>' + metric + '</span>' 
          +  dimensions
          + '<br /><span>' + Highcharts.dateFormat('%A, %b %e, %l:%M%P', xVal, true) + ' : </span> <b>' + yVal + '</b>';
        return tooltip;
      }
    }
    options.legend = {
        enabled: config.hideLegends ? false : true,
        align: "left",
        borderWidth: 0,
        itemDistance: 20,
        symbolHeight: 2,
        symbolRadius: 0,
        symbolWidth: 30,
        y: 15,
        x: -10,
        verticalAlign: "bottom",
        adjustChartSize: true,
        maxHeight: 80,
        navigation: {
          activeColor: theme.legend.navigation.activeColor[config.theme],
          animation: true,
          arrowSize: 12,
          inactiveColor: theme.legend.navigation.inactiveColor[config.theme],
        },
        itemStyle: {
          fontWeight: 'normal',
          color: theme.legend.itemStyle.color[config.theme]
        },
        itemHiddenStyle: {
          color: theme.legend.itemHiddenStyle.color[config.theme]
        },
        itemHoverStyle: {
          color: theme.legend.itemHoverStyle.color[config.theme]
        }
    };
    
    // ligthen gridlines if minors are off
    if(!config.minorGridLines) {
      theme.xAxis.gridLineColor = theme.xAxis.minorGridLineColor;
      theme.yAxis.gridLineColor = theme.yAxis.minorGridLineColor;
    }
    
    options.xAxis = {
        ordinal: false,
        gridLineWidth: 1,
        gridLineColor: theme.xAxis.gridLineColor[config.theme],
        minorGridLineColor: theme.xAxis.minorGridLineColor[config.theme],
        minorTickInterval: config.minorGridLines ? 'auto' : 0,
        labels: {
          style: {
            color: theme.xAxis.labels.style.color[config.theme]
          }
        }
    };
    
    if(config.startTime && config.endTime) {
      options.xAxis.min = config.startTime;
      options.xAxis.max = config.endTime;
      if(config.plotStart) {
    	  options.xAxis.plotBands = [{
    		  color: 'rgba(147,112,219,0.5)',
    		  from: config.plotStart,
    		  to: config.endTime
    	  }]
      }
    }
    
    // axis color hack for 
    options.yAxis = [{
      id : "lbl:0",
      gridLineColor: theme.yAxis.gridLineColor[config.theme],
      minorGridLineColor: theme.yAxis.minorGridLineColor[config.theme],
      minorTickInterval: config.minorGridLines ? 'auto' : 0,
      opposite: false,
      offset : 30,
      labels:{
        align:'left',
        x:0,
        y:10,
        style : {
          color : (this.graph.scaleInfo.yAxis && this.graph.scaleInfo.yAxis.length > 0 && this.graph.scaleInfo.yAxis[0].color)?this.graph.scaleInfo.yAxis[0].color[config.theme]:theme.yAxis.labels.style.color[config.theme]
        }
      },
      title : {
        text : (this.graph.scaleInfo.yAxis && this.graph.scaleInfo.yAxis.length > 0 && this.graph.scaleInfo.yAxis[0].color)?this.graph.scaleInfo.yAxis[0].title:"",
        style : {
          color : (this.graph.scaleInfo.yAxis && this.graph.scaleInfo.yAxis.length > 0 && this.graph.scaleInfo.yAxis[0].color)?this.graph.scaleInfo.yAxis[0].color[config.theme]:theme.yAxis.labels.style.color[config.theme]
        }
      },
      showLastLabel: true
    }];
    
    
    //color hack for old dashboards)
    if(this.graph.scaleInfo.yAxis[0] && this.graph.scaleInfo.yAxis[0].color[config.theme] === "#707070") {
      this.graph.scaleInfo.yAxis[0].color[config.theme] = theme.yAxis.labels.style.color[config.theme];
      options.yAxis[0].labels.style.color = theme.yAxis.labels.style.color[config.theme];
      options.yAxis[0].title.style.color = theme.yAxis.labels.style.color[config.theme];
    }

    addPlotLinesBands(options.yAxis[0], this.graph.scaleInfo.yAxis[0]);

    if (this.graph.scaleInfo.xAxis) {
      
      //color hack for old dashboards)
      if(this.graph.scaleInfo.xAxis.color && this.graph.scaleInfo.xAxis.color[config.theme] === "#707070") {
        this.graph.scaleInfo.xAxis.color[config.theme] = theme.xAxis.labels.style.color[config.theme];
      }
      
      options.xAxis.title = {};
      if (this.graph.scaleInfo.xAxis.title) {
         options.xAxis.title = {
           text : this.graph.scaleInfo.xAxis.title,
         };
      }
      if (this.graph.scaleInfo.xAxis.color) {
        options.xAxis.title.style = {
          color : (this.graph.scaleInfo.xAxis.color)?this.graph.scaleInfo.xAxis.color[config.theme]:theme.xAxis.labels.style.color[config.theme]
        };
        options.xAxis.labels.style = {
            color : (this.graph.scaleInfo.xAxis.color)?this.graph.scaleInfo.xAxis.color[config.theme]:theme.xAxis.labels.style.color[config.theme]
        };
      }
    }

    if (this.graph.scaleInfo.yAxis&& this.graph.scaleInfo.yAxis.length>0&&this.graph.scaleInfo.yAxis[0].minVal && this.graph.scaleInfo.yAxis[0].minVal!="default") {
      options.yAxis[0].min = this.graph.scaleInfo.yAxis[0].minVal;
    }

    var lOddSum = 30;
    var lEvenSum = 0;
    for(var j = 1; j < this.graph.scaleInfo.yAxis.length; j++) {
      var gOpt = this.graph.scaleInfo.yAxis[j];
      
      //color hack for old dashboards
      if(gOpt.color[config.theme] === "#707070") {
        gOpt.color[config.theme] = theme.yAxis.labels.style.color[config.theme];
      }
      
      var opt = $.extend(true, {}, options.yAxis[0]);
      opt.title.text = gOpt.title;
      opt.title.style.color = gOpt.color[config.theme];
      opt.labels.style.color = gOpt.color[config.theme];
      var minVal = gOpt.minVal;
      if (minVal && minVal!="default") opt.min = minVal;
      if (j%2 == 1) {
         opt.opposite = true;
         opt.offset = lEvenSum;
         lEvenSum += 50;
      } else {
         lOddSum += 50;
         opt.offset = lOddSum;
      }
      opt.labels.y = 10;
      opt.showLastLabel = true;
      opt.id = "lbl:"+j;

      addPlotLinesBands(opt, this.graph.scaleInfo.yAxis[j]);

      options.yAxis.push(opt);
    }

    if (this.graph.scaleInfo.yAxis.length >= 2) {
      var lEven, lOdd;
      if (this.graph.scaleInfo.yAxis.length%2 == 0) {
        lOdd = this.graph.scaleInfo.yAxis.length - 1 ;
        lEven =this.graph.scaleInfo.yAxis.length;
      } else {
        lOdd = this.graph.scaleInfo.yAxis.length;
        lEven = this.graph.scaleInfo.yAxis.length - 1;
      }
      options.chart.marginRight = ((lEven-2)/2+1)*50;
      options.chart.marginLeft = ((lOdd-1)/2+1)*50;
    }
    
    options.plotOptions = {
            spline: {
                marker: {
                    radius: 3,
                    lineColor: '#888888',
                    lineWidth: 1
                }
            },
            line: {
                marker: {
                    radius: 3,
                    lineColor: '#888888',
                    lineWidth: 1
                }
            },
            area: {
                marker: {
                    radius: 3,
                    lineColor: '#888888',
                    lineWidth: 1
                }
            },
            series: {
            	animation: (typeof config.animation == "undefined" ? true : config.animation)
            }
    };
    options.credits = { enabled: false };

    options.series = [];
    for (var i=0; i<this.graph.series.length; i++) {
      var series1 = this.graph.series[i];
      var optionseries = {
        name : series1.name,
        data : series1.data,
        color : series1.color,
        type : series1.type,
        dashStyle : series1.dashStyle,
        yAxis : series1.yAxis,
        id : series1.id,
        step: config.step ? config.step : false,
        zIndex: series1.zIndex,
        lineWidth: series1.lineWidth? series1.lineWidth : 2
      };
      if (series1.marker) optionseries.marker = series1.marker
      if (series1.style) optionseries.dashStyle = series1.style;
      options.series.push(optionseries);
    }

    if (config.editLine) {
        options.plotOptions = {
            series: {
                cursor: 'pointer',
                events: {
                    click: function (event) {

                        alert(this.options.id + ' clicked\n' +
                              'Alt: ' + event.altKey + '\n' +
                              'Control: ' + event.ctrlKey + '\n' +
                              'Shift: ' + event.shiftKey + '\n');
                    }
                }
            }
       };
    }
    this.chart = $("#"+this.graph.id).highcharts("StockChart", options);

    /*$("#"+this.graph.id+" svg").on("click", ".highcharts-axis", function() {
alert("asf");
    });*/

    this.update = function () {
    }
    
    this.destroy = function() {
      try{$("#"+this.graph.id).highcharts().destroy();}catch(e){}
    }

    this.resize = function () {
     $("#"+this.graph.id).highcharts().reflow(); 
    }
  };
  return SherlockHighStockChart;
});
