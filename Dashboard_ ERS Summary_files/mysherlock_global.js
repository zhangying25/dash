var SHERLOCKLIB = SHERLOCKLIB ? SHERLOCKLIB : {};
var SHERLOCKSERVERSCONSTANTS_101010 = SHERLOCKSERVERSCONSTANTS_101010 ? SHERLOCKSERVERSCONSTANTS_101010 : {};

if ($.validator) {
 
$.validator.addMethod(
 "regex",
 function(value, element, regexp) {
  var re = new RegExp(regexp);
  return this.optional(element) || re.test(value);
 },
 "Invalid input format. Please check your input."
);

$.validator.addMethod("MustSelectOpt", function(value, element) {
        if(element.selectedIndex <= 0) return false;
                else return true;
}, "You must select an Option.");

$.validator.addMethod('positiveNumber',
    function (value) { 
        return Number(value) > 0;
    }, 'Enter a positive number.');

$.validator.addMethod('percentage',
    function (value) { 
        return Number(value) >= 0 && Number(value)<=0;
    }, 'Enter a positive number.');
}

function keyDownOnlyPositiveNumberInteger(event) {
  if (event.shiftKey) {
    event.preventDefault();
  }
  if (event.keyCode == 46 || event.keyCode == 8) {
  }
  else {
   if (event.keyCode < 95) {
     if (event.keyCode < 48 || event.keyCode > 57) {
        event.preventDefault();
     }
   }
    else {
     if (event.keyCode < 96 || event.keyCode > 105) {
        event.preventDefault();
     }
    }
  }
}

if (jQuery.fn.dataTableExt) 
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "datetime-us-pre": function ( a ) {
    a = a.split(" (")[0];
    //var b = a.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4}),* (\d{1,2}):(\d{1,2}):(\d{1,2}) (am|pm|AM|PM|Am|Pm)/),
    var b = a.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4}),* (\d{1,2}):(\d{1,2}):(\d{1,2})/),
    month = b[1],
    day = b[2],
    year = b[3],
    hour = b[4],
    min = b[5],
    sec = b[6];
    /*ap = b[7];*/

    /*if(hour == '12') hour = '0';
    if(ap == 'pm') hour = parseInt(hour, 10)+12;*/

    if(year.length == 2){
      if(parseInt(year, 10)<70) year = '20'+year;
      else year = '19'+year;
    }
    if(month.length == 1) month = '0'+month;
    if(day.length == 1) day = '0'+day;
    if(hour.length == 1) hour = '0'+hour;
    if(min.length == 1) min = '0'+min;
    if(sec.length == 1) sec = '0'+sec;

    var tt = year+month+day+hour+min+sec;
    return  tt;
  },
  "datetime-us-asc": function ( a, b ) {
    return a - b;
  },
  "datetime-us-desc": function ( a, b ) {
    return b - a;
  }
});

Date.prototype.format = function (format)
{
  var hours = this.getHours();
  var ttime = "AM";
  if(format.indexOf("t") > -1)
  { 
     if (hours >= 12) {
       ttime = "PM";
     }
     if (hours > 12) {
       hours = hours - 12;
     }
  }

  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(),    //day
    "h+": hours,   //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
    "S": this.getMilliseconds(), //millisecond,
    "t+": ttime
  }

  if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
  (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o) if (new RegExp("(" + k + ")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length == 1 ? o[k] :
        ("00" + o[k]).substr(("" + o[k]).length));
  return format;
}

var timeZoneInfo = {
 mp : {
  offset : -25200000,
  displayName : "MST"
 }
};

var dtTZ = new Date();
var localTZOffset = dtTZ.getTimezoneOffset();

$.ajax({
  dataType: "json",
  url: "//sherlock.vip.ebay.com/CoreApp/tz",
  dataType: "jsonp",
  async : false,
  success: function(tz) {
    timeZoneInfo.pp = tz;
  }
});

var console = console ? console : {log: function () {}, dir: function () {} };

SHERLOCKLIB.simpleDateTimeFormat = function (d) {
  var dd = ["January", "February", "March", 
            "April", "May", "June", "July", "August", "September", 
            "October", "November", "December"][d.getMonth()];

  dd += " " + d.getDate();

  var ampm = "";
  var curr_hour = d.getHours();
  if (curr_hour < 12)
  {
    ampm = "AM";
  }
  else
  {
    ampm = "PM";
  }
  if (curr_hour == 0)
  {
    curr_hour = 12;
  }
  if (curr_hour > 12)
  {
    curr_hour = curr_hour - 12;
  }
  if (curr_hour.length == 1)
  {
    curr_hour = "0" + curr_hour;
  }

  var curr_min = d.getMinutes();
  if (curr_min.length == 1)
  {
    curr_min = "0" + curr_min;
  }

  dd += ", " + curr_hour + ":" + curr_min + ampm
  return dd;
}

SHERLOCKLIB.tsToDisplay = function (timestamp, tenant) {
  var d = new Date(timestamp);
  var utc = d.getTime() + (d.getTimezoneOffset() * 60 * 1000);
  var MSToffset = timeZoneInfo[tenant].offset;
  var ts = new Date(utc + MSToffset);
  //return ts.toLocaleString()+" ("+timeZoneInfo[tenant].displayName+")";
  //return ts.toLocaleString();
  return ts.format("MM/dd/yyyy hh:mm:ss") + " " + timeZoneInfo[tenant].displayName;
};

SHERLOCKLIB.convertTimeStamp = function (timestamp, tenant) {
  var d = new Date(timestamp);
  //get UTC time
  var utc = d.getTime() + (d.getTimezoneOffset() * 60 * 1000);
  // create new Date object for different city
    // using supplied offset
  var offset = timeZoneInfo[tenant].offset;
  var ts = new Date(utc + offset);
  return ts.getTime();
};

SHERLOCKLIB.convertDataPointsToTZByTenant = function (resp, tenant) {
  _.each(resp, function(subset) {
     _.each(subset.DataPoints, function(dp) {
         dp[0] = SHERLOCKLIB.convertTimeStamp(dp[0]*1000, tenant);
     });
  });
  return resp;
}

SHERLOCKLIB.convertTimeStampV2 = function (timestamp, tenant, forceLocal) {
  if (forceLocal) {
    var gmt = timestamp - timeZoneInfo[tenant].offset;
    var target = gmt + (-localTZOffset * 60 * 1000);

    return target;
  } else {
    return timestamp;
  }
};


SHERLOCKLIB.convertDataPointsToTZByTenantV2 = function (resp, tenant, forceLocal) {
  _.each(resp, function(subset) {
     _.each(subset.dps, function(dp) {
         dp[0] = SHERLOCKLIB.convertTimeStampV2(dp[0]*1000, tenant, forceLocal);
     });
  });
  return resp;
}

SHERLOCKLIB.convertTimeStampV3 = function (timestamp, options) {
  if (options.byTenant)
  {
    var offset = timeZoneInfo[options.tenant].offset;
    return timestamp + offset;
  } else if (options.forceLocal) {
    return timestamp;
  } else {
    return timestamp;//gmt
  }
};

SHERLOCKLIB.convertDataPointsToTZByTenantV3 = function (resp, options) {
  _.each(resp, function(subset) {
     var dps = subset.dps||subset.DataPoints;
     _.each(dps, function(dp) {
         dp[0] = SHERLOCKLIB.convertTimeStampV3(dp[0]*1000, {tenant : options.tenant, byTenant:true, forceLocal:options.forceLocal});
     });
  });
  return resp;
}

SHERLOCKLIB.getDateStringInTSDBFormat = function (ts) {
  var str = '';
  str += ts.getFullYear() + '/';
  if ((ts.getMonth() + 1) < 10) { str += '0'; }
  str += (ts.getMonth() + 1) + '/';
  if (ts.getDate() < 10) { str += '0'; }
  str += ts.getDate() + '-';

  if (ts.getHours() < 10) { str += '0'; }
  str += ts.getHours() + ':';

  if (ts.getMinutes() < 10) { str += '0'; }
  str += ts.getMinutes() + ':';

  if (ts.getSeconds() < 10) { str += '0'; }
  str += ts.getSeconds();

  return str;
}

SHERLOCKLIB.getTsdbData = function (url, tenant, callback) {
  url = "/CoreApp/proxy/getHttp?url=" + encodeURIComponent(url);
  $.ajax({
    url: url,
    timeout : 30000,
    maxTries: 10,
    type: 'GET',
    dataType: 'json',
    success: function (resp) {
      if (tenant != "na") {
        resp = SHERLOCKLIB.convertDataPointsToTZByTenantV3(resp, {tenant:tenant, byTenant:true});
      }
      callback(resp);
    },
    error: function (resp) {
      console.log('error reading from url (getdata) = ' + url + ' RESPONSE = ' + resp);
      console.dir(resp);
    }
  });
};

SHERLOCKLIB.drawGraph = function(data, jq, fnNameFormat, toolTipsFormat) { 
  var series=[];
  var colorsLines = [];
  var tooltips={};
  if(toolTipsFormat){
	  tooltips = toolTipsFormat;
  } else {
	  tooltips.valueDecimals = 2;
  }
  for (var i in data) {
    series.push({
      name : fnNameFormat(data[i]),
      data : data[i].DataPoints,
      tooltip: tooltips
    });
  }
  var options = {
    title : {
       text : '' 
    },
    colors : ["#B00000", "#880000", "#580000", "#D80000", "#FF0000", "#993333", "#FF3333" ],
    chart : {
     zoomType: 'x',
     margin: 0,
     marginRight: 0,
     marginLeft:50,
     marginBottom: 30
    },
    yAxis : {
     opposite : false,
     min: 0,
     offset : 0,
     labels:{
       align:'left',
       x:0
     },
     labels: { style: { color: '#2A2A2A', fontWeight: 'normal' } }
     },
     series : series,
     rangeSelector: {
        enabled : false
     },
     navigator : {
       enabled : false
     },
     scrollbar : {
       enabled : false
     },
     credits : {
       enabled : false
     },
     tooltip : {
      shared: false
    }
  };
  $(jq).highcharts('StockChart', options);
};

SHERLOCKLIB.loadJavaScriptSync = function(hrefScript)
{
  var xhrObj = createXMLHTTPObject();
  xhrObj.open('GET', hrefScript, false);
  xhrObj.send('');

  var se = document.createElement('script');
  se.type = "text/javascript";
  se.text = xhrObj.responseText;
  document.getElementsByTagName('head')[0].appendChild(se);
}


$('head').append(
  "<style>" +
  "hr.mysherlockHR {"+
  "  border: 0;"+
  "  height: 1px;"+
  "  background-image: -webkit-linear-gradient(left, rgba(0,0,0,0), rgba(0,0,0,0.75), rgba(0,0,0,0)); "+
  "  background-image:    -moz-linear-gradient(left, rgba(0,0,0,0), rgba(0,0,0,0.75), rgba(0,0,0,0)); "+
  "  background-image:     -ms-linear-gradient(left, rgba(0,0,0,0), rgba(0,0,0,0.75), rgba(0,0,0,0)); "+
  "  background-image:      -o-linear-gradient(left, rgba(0,0,0,0), rgba(0,0,0,0.75), rgba(0,0,0,0)); "+
  "}"+
  "</style>");


var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
};

var crc32 = function(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

$.fn.inView = function(){
  var win = $(window);
  obj = $(this);
  var scrollPosition = win.scrollTop();
  var visibleArea = scrollPosition + win.height();
  var objStartPosition = obj.offset().top;
  var objEndPosition = objStartPosition + obj.outerHeight();
  return (objStartPosition <= scrollPosition && objEndPosition >= scrollPosition) || (objStartPosition >= scrollPosition && objStartPosition <= visibleArea)
};
