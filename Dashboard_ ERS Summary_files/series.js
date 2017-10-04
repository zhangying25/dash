define(function() {
  var series = function() {
    this.generateSeries = function(sec, sArray, expr, noAsZero, addGap) {
      var timeHash = new Object();

      var nseries = [];

      var updateSeriesIntoHash = function(series, sVar) {
        for(var i in series) {
          var point = series[i];
          var time = parseInt(point[0]/sec)*sec;
          var info = timeHash[time];
          if (!info) {
            info = new Object();
            timeHash[time] = info;
          }
          if (info[sVar]) {
            info[sVar] += point[1];
          }
          else 
            info[sVar] = point[1];
        }
      };

      var seriesLength = sArray.length;
      for(var i = 0; i < seriesLength; i++) {
        var series = sArray[i];
        updateSeriesIntoHash(series, i);
      }

      var sorted = Object.keys(timeHash).sort();
      for(var i in sorted) {
        var key = parseInt(sorted[i]);
        var info = timeHash[key];
        var keys = Object.keys(info);
        if (noAsZero || keys.length == seriesLength) {
          var val = 0;
          try {
            var eval1 = '(function() { var np='+keys.length+';';
            for (var j=0;j < seriesLength; j++) {
              var sVar = String.fromCharCode(97+j);

              var value = info[j];
              if (!value && noAsZero) value = 0;

              eval1 += "var " + sVar + "=" + value + ";";
            }
            eval1 += "return " + expr + ";})();"
            var val = eval(eval1);
            if (isNaN(val)) {
              if (addGap) {
                nseries.push([key, null]);
              }
            } else {
              nseries.push([key, val]);
            }
          } catch (e) {
            if (addGap) {
              nseries.push([key, null]);
            }
          } 
        } else {
          if (addGap) {
            nseries.push([key, null]);
          }
        }
      }

      return nseries;
    };

    this.findAllSum = function(sec, coloErr, colos) {
      var series = [];
      var vars = [];
      for(var coloIdx in colos) {
        var colo = colos[coloIdx];
        var _series = coloErr[colo]||[];
        series.push(_series);
        var sVar = String.fromCharCode(97+parseInt(coloIdx));
        vars.push(sVar);
      }
      var allSeries = generateSeries(sec, series, vars.join("+"), true, true);
      coloErr.all = allSeries;
    };

    this.findAllAvg = function(sec, coloErr, colos) {
      var series = [];
      var vars = [];
      for(var coloIdx in colos) {
        var colo = colos[coloIdx];
        var _series = coloErr[colo]||[];
        series.push(_series);
        var sVar = String.fromCharCode(97+parseInt(coloIdx));
        vars.push(sVar);
      }
      var allSeries = generateSeries(sec, series, "("+vars.join("+")+")/np", true, true);
      coloErr.all = allSeries;
    };

    this.findSumOfAllValuesInSeries = function(series) {
      var sum = 0;
      for(var i in series) {
        if (series[i][1] != null && !isNaN(series[i][1]))
          sum += series[i][1];
      }
      return sum;
    }

    this.findAvgOfAllValuesInSeries = function(series) {
      var sum = 0;
      for(var i in series) {
        if (series[i][1] != null && !isNaN(series[i][1]))
          sum += series[i][1];
      }
      return sum/series.length;
    }

  };

  return series;
});
