/************************************************************/
/* Date Time */
    (function() {
       $("head").append($("<style>").text(".right-inner-addon span {padding: 10px 12px; pointer-events: none; position: absolute;  right: 20px;}"));
 
       $ = jQuery;
       $.fn.extend({
         timeCtrlSherlock_v2 : function(options) {
          return new DateTimePlugin(this, options);
         }
       });

       var DateTimePlugin = (function(obj, options) {
         var htm = '<div style="display:inline-block"><div class="btn-group" data-toggle="buttons">'+
           '<label class="btn btn-default btn-sm"><input type="radio" class="relTime" value="0d1h0m">1h</label>'+
           '<label class="btn btn-default btn-sm"><input type="radio" class="relTime" value="0d3h0m">3h</label>'+
           '<label class="btn btn-default btn-sm"><input type="radio" class="relTime" value="0d8h0m">8h</label>'+
           '<label class="btn btn-default btn-sm"><input type="radio" class="relTime" value="1d0h0m">1d</label>'+
           '<label class="btn btn-default btn-sm"><input type="radio" class="relTime" value="3d0h0m">3d</label>'+
           '<label class="btn btn-default btn-sm"><input type="radio" class="relTime" value="7d0h0m">1w</label>'+
           '<label class="btn btn-default btn-sm"><input type="radio" class="relTime" value="relTime">Relative Time</label>'+
           '<label class="btn btn-default btn-sm"><input type="radio" class="relTime" value="absTime">Absolute Time</label>'+
         '</div>'+
         '&nbsp;&nbsp;'+
			'<div class="btn-group">'+
				'<button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" id="refreshOption">'+
					'<span class="display">Manual Refresh</span> <span class="caret"></span> <span class="sr-only">Toggle Dropdown</span>'+
				'</button>'+
				'<ul class="dropdown-menu" role="menu">'+
					'<li class="refresh"><a href="#" class="ref30s">Refresh every 30 seconds</a></li>'+
					'<li class="refresh"><a href="#" class="ref1">Refresh every 1 minute</a></li>'+
					'<li class="refresh"><a href="#" class="ref2">Refresh every 2 minutes</a></li>'+
					'<li class="refresh"><a href="#" class="ref5">Refresh every 5 minutes</a></li>'+
					'<li class="refresh"><a href="#" class="ref10">Refresh every 10 minutes</a></li>'+
					'<li class="divider"></li>'+
					'<li class="refresh"><a href="#" class="noRef">Manual Refresh</a></li>'+
				'</ul>'+
			'</div>'+

      '&nbsp;&nbsp;'+
      '<div class="btn-group">'+
        '<button type="button" class="btn btn-default btn-sm" id="datasource">Switch to Secondary</button>'+
      '</div>'+
      
      '&nbsp;&nbsp;'+
      '<div class="btn-group">'+
        '<button type="button" class="btn btn-default btn-sm" id="theme">Switch to Dark Theme</button>'+
      '</div>'+
         
         
         '<div class="row relTimeCtrl" style="margin-top:10px;display:none;width:700px">'+
         '<div class="col-lg-3"><div class="input-group input-group-sm"><input type="text" class="form-control relTimeDays" placeholder="days" value="0"><span class="input-group-btn"><button class="btn btn-default btn-sm" type="button">Days ago</button></span></div></div>'+
         '<div class="col-lg-3"><div class="input-group input-group-sm"><input type="text" class="form-control relTimeHours" placeholder="days" value="0"><span class="input-group-btn"><button class="btn btn-default btn-sm" type="button">Hours ago</button></span></div></div>'+
         '<div class="col-lg-3"><div class="input-group input-group-sm"><input type="text" class="form-control relTimeMins" placeholder="days" value="0"><span class="input-group-btn"><button class="btn btn-default btn-sm" type="button">Min ago</button></span></div></div>'+
         '<button class="btn btn-primary btn-sm refreshGraph">Submit</button>'+
         '</div>'+
         '<div class="row absTimeCtrl" style="margin-top:10px;margin-left:5px;display:none;font-weight:normal;font-size:13px">'+
         '<div class="display:table-row">'+
         '    <label style="display:table-cell;width:50px;vertical-align:middle">Start</label>'+
         '    <div style="display:table-cell;width:220px;">'+
         '       <div style="width:220px;display:inline-block" class="right-inner-addon"><span class="glyphicon glyphicon-calendar"></span>'+
         '           <input type="button" id="form_datetime_stDT" style="width:205px;height:30px;display:inline-block" class="form-control form_datetime stDT" size="16" value="" data-id="stDT">'+
         '      </div>'+
         '    </div>'+
         '    <label style="display:table-cell;width:40px;vertical-align:middle">End</label>'+
         '    <div style="display:table-cell;width:220px;">'+
         '       <div style="width:220px;display:inline-block" class="right-inner-addon"><span class="glyphicon glyphicon-calendar"></span>'+
         '           <input id="form_datetime_endDT" style="width:205px;height:30px;display:inline-block" class="form-control form_datetime endDT" size="16" type="button" value="" data-id="endDT">'+
         '       </div>'+
         '    </div>'+
         '<div style="display:table-cell;width:100px;vertical-align:middle"><button class="btn btn-primary btn-sm refreshGraph">Submit</button></div>'+
         '</div>'+
         '</div>';
         this.parent = $(htm);

         this.startDT = null;
         this.endDT = null;
         
         var thisObj = this;

         var _convertMST_ = function (timestamp) {
           var MSToffset = -7;
           var d = new Date(timestamp);
           var utc = d.getTime() + (d.getTimezoneOffset() * 60 * 1000);
           var ts = new Date(utc + (60 * 60 * 1000 * MSToffset));
           _timestamp = ts.getTime();
           return _timestamp;
         };

         var defaultConv = new AnyTime.Converter({format: "%m-%d-%Y %H:%i:%s"});
         this.parent.find('.form_datetime.stDT').val(defaultConv.format(new Date(_convertMST_(new Date().getTime())-60*60*1000)));
         this.parent.find('.form_datetime.endDT').val(defaultConv.format(new Date(_convertMST_(new Date().getTime()))));
         thisObj.startDT=parseInt(defaultConv.parse(this.parent.find('.form_datetime.stDT').val()).getTime() / 1000, 10)
         thisObj.endDT=parseInt(defaultConv.parse(this.parent.find('.form_datetime.endDT').val()).getTime() / 1000, 10);
 
         obj.html(this.parent);
         this.parent.find('.form_datetime').AnyTime_picker({
           format: "%m-%d-%Y %H:%i:%s",
           firstDOW: 1,
           latest: new Date(_convertMST_(new Date().getTime())+60*60*1000) 
         }).change(function() {
            var dt = $(this).data("id");
            if (dt == "stDT") {thisObj.startDT=parseInt(defaultConv.parse($(this).val()).getTime() / 1000, 10);}
            else if (dt == "endDT") {thisObj.endDT=parseInt(defaultConv.parse($(this).val()).getTime() / 1000, 10);}
         });
         if (options && options.relTime) {
         } else {
           this.parent.find('.relTime[value="0d1h0m"]').parent().addClass("active");
         }
         this.parent.on('change', 'input:radio[class="relTime"]', function (event) {
           var obj = $(this);
           if (obj.val() == "relTime") {
             thisObj.parent.find('.relTimeCtrl').css({display:'block'});
             thisObj.parent.find('.absTimeCtrl').css({display:'none'});
           } else if (obj.val() == "absTime") {
             thisObj.parent.find('.relTimeCtrl').css({display:'none'});
             thisObj.parent.find('.absTimeCtrl').css({display:'block'});
           } else {
        	 thisObj.parent.find('.relTimeCtrl').css({display:'none'});
      		 thisObj.parent.find('.absTimeCtrl').css({display:'none'});
      		 obj.parent().addClass("active");
      		 options.renderer.refreshGraphs(thisObj.getAction());
      		 obj.parent().removeClass("active");
           }
         });

         this.parent.on('click', '.refreshGraph', function(event) {
        	 var timeRange = thisObj.getDT();
        	 if(timeRange.start >= timeRange.end) {
        		 bootbox.alert("Start-time cannot be greater than or equal to end-time.");
        		 return;
        	 }
        	 
        	 options.renderer.refreshGraphs(thisObj.getAction());
         });
         
         this.parent.on('click', "li.refresh a", function(event){
           event.preventDefault();
           thisObj.setRefresh($(this).attr('class'));
           options.renderer.refreshGraphs({showAjaxLoadAnimation: false, refresh: $(this).attr('class')});
         });
         
         this.setRefresh = function(refresh) {
           if(typeof timer !== 'undefined') clearInterval(timer);
           $("#refreshOption .display").text($('li.refresh a.'+refresh).text());

           var interval;
           switch(refresh) {
           case 'ref30s':
             interval = 30000;
             break;
           case 'ref1':
             interval = 60000;
             break;
           case 'ref2':
             interval = 120000;
             break;
           case 'ref5':
             interval = 300000;
             break;
           case 'ref10':
             interval = 600000;
             break;
           default:
             return;
           }

           timer = setInterval(function() {
             options.renderer.refreshGraphs({showAjaxLoadAnimation: false});
           }, interval);
         }

         this.parent.on('click', '#datasource', function(event) {
           var useSecondary = $(this).text() == "Switch to Secondary";
           thisObj.useSecondary(useSecondary);
           options.renderer.refreshGraphs({useSecondary: useSecondary});
         });
         
         this.useSecondary = function(useSecondary) {
           if(useSecondary) {
             $("#datasource").text("Switch to Primary");
             options.renderer.useSecondary(true);
           } else {
             $("#datasource").text("Switch to Secondary");
             options.renderer.useSecondary(false);
           }
         }

         this.parent.on('click', '#theme', function(event) {
           var useDark = $(this).text() == "Switch to Dark Theme";
           thisObj.useDark(useDark);
           options.renderer.refreshGraphs({noFetchSeries: true, useDark: useDark});
         });
         
         this.useDark = function(useDark) {
           if(useDark) {
             $("#theme").text("Switch to Light Theme");
             options.renderer.useDark(true);
           } else {
             $("#theme").text("Switch to Dark Theme");
             options.renderer.useDark(false);
           }
         }
         
         this.getDT = function() {
            var selected = this.parent.find('.btn-group>.btn.active>input').val();
            if (selected == 'relTime') {
              var d = this.parent.find('.relTimeDays').val().trim();
              var h = this.parent.find('.relTimeHours').val().trim();
              var m = this.parent.find('.relTimeMins').val().trim();
              var times =  _getRealTime_(d+'d'+h+"h"+m+"m");
              return times;
            } if (selected == "absTime") {
              return {start: this.startDT, end: this.endDT};
            } else {
              var times =  _getRealTime_(selected);
              return times;
            }
         };

         this.getString= function() {
            var selected = this.parent.find('.btn-group>.btn.active>input').val();
            if (selected == 'relTime') {
              var d = this.parent.find('.relTimeDays').val().trim();
              var h = this.parent.find('.relTimeHours').val().trim();
              var m = this.parent.find('.relTimeMins').val().trim();
              return "relTime="+d+'d'+h+"h"+m+"m";
            } if (selected == "absTime") {
              if (thisObj.startDT > thisObj.endDT) {
            	bootbox.alert("Start-time cannot be greater than or equal to end-time.");
                return -1;
              }
              return "start="+_getDateStringInTSDBFormat_(new Date(thisObj.startDT * 1000))+"&end="+_getDateStringInTSDBFormat_(new Date(thisObj.endDT * 1000));
            } else {
              return "relTime="+selected;
            }
         };

         this.getAction= function() {
             var selected = thisObj.getString();
             if(selected.indexOf("relTime") != -1) {
            	 return {relTime : selected.split('=')[1]}
             } else {
            	 var times = selected.split('&');
            	 return {start : times[0].split('=')[1], end : times[1].split('=')[1]}
             }
         };

         this.setRelTime = function(relTime) {
           this.parent.find('.relTime').parent().removeClass("active");
           if (this.parent.find('.relTime[value="'+relTime+'"]').length == 0) {
             this.parent.find('.relTime[value="relTime"]').parent().addClass("active");
             this.parent.find('.relTime[value="relTime"]').parent().click();
             var rem = relTime;
             var index = rem.indexOf('d');
             var num = 0;
             if (index >= 0) {
               num = rem.slice(0, index);
               rem = rem.slice(index + 1);
             }
             this.parent.find('.relTimeDays').val(num);
             index = rem.indexOf('h');
             num = 0;
             if (index >= 0) {
               num = rem.slice(0, index);
               rem = rem.slice(index + 1);
             }
             this.parent.find('.relTimeHours').val(num);
             index = rem.indexOf('m');
             num = 0;
             if (index >= 0) {
               num = rem.slice(0, index);
               rem = rem.slice(index + 1);
             }
             this.parent.find('.relTimeMins').val(num);
           }
           else {
             this.parent.find('.relTime[value="'+relTime+'"]').parent().addClass("active");
           }
         }

         this.setAbsTime = function(absTime) {
           this.parent.find('.relTime[value="absTime"]').parent().click();
           absTime.start = absTime.start.replace("T"," ");
           absTime.end  = absTime.end.replace("T", " ");
           this.parent.find('.form_datetime.stDT').val(defaultConv.format(new Date(absTime.start)));
           this.parent.find('.form_datetime.endDT').val(defaultConv.format(new Date(absTime.end)));
           this.startDT=parseInt(new Date(absTime.start).getTime() / 1000, 10)
           this.endDT=parseInt(new Date(absTime.end).getTime() / 1000, 10);
         }
         
         this.setTime = function(params) {
           if(params.relTime) {
             this.setRelTime(params.relTime);
           }
           if(params.start && params.end) {
             this.setAbsTime(params);
           }
         }

         var _getRealTime_ = function (relTime) {
           var endTime = Math.round((new Date()).getTime() / 1000);
           var delta = 0;

           var rem = '' + relTime;
           var num = 0;

           var index = rem.indexOf('d');
           if (index >= 0) {
              num = rem.slice(0, index);
              rem = rem.slice(index + 1);
              delta = delta + (num * 24 * 60 * 60);
           }

           index = rem.indexOf('h');
           if (index >= 0) {
              num = rem.slice(0, index);
              rem = rem.slice(index + 1);
              delta = delta + (num * 60 * 60);
           }

           index = rem.indexOf('m');
           if (index >= 0) {
             num = rem.slice(0, index);
             rem = rem.slice(index + 1);
             delta = delta + (num * 60);
           }

           index = rem.indexOf('s');
           if (index >= 0) {
             num = rem.slice(0, index);
             rem = rem.slice(index + 1);
             delta = delta + num;
           }

           var startTime = endTime - delta;

           return {start: startTime, end: endTime};
         };

         var _getDateStringInTSDBFormat_ = function (ts) {
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
         };
       });
    })();
