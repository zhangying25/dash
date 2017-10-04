define(function(){
  var BootstrapPanel = function (config){
    this.config = config;
    var strHtml = '';
    if(config.isCollapse) {
      strHtml += '<div class="panel-group" id="accordion_'+config.id+'">';
    }
    strHtml += '<div class="panel panel-default mainPanel" style="height:'+(config.height?config.height:"100%")+';border:'+(config.disable_border?'none':'')+'">'+
     '<div class="leftSideTogglesOptions btn-group pull-left" style="margin-left:5px;margin-top:5px">' +
       '<div class="btn-group" data-toggle="buttons">' +
         '<label class="wow1 btn btn-default active" style="display:none">' +
            '<input type="checkbox" autocomplete="off" checked value="1w"> 1w Ago' +
         '</label>' +
         '<label class="dod1 btn btn-default active" style="display:none">' +
            '<input type="checkbox" autocomplete="off" checked value="1d"> 1d Ago' +
         '</label>' +
       '</div>' +
     '</div>' +
     
     (config.hideTitles? '' : 
     '<header class="panel-heading" style="padding: 2px 2px;" '+ (config.isCollapse ? 'data-toggle="collapse" data-parent="#accordion_'+config.id+'" href="#'+config.id+'"' : '') + '>' +
     '<span class="panel-title" style="padding:0px;height:30px;display:inline-block;">' +
       '<span id="title_'+config.id+'" style="padding:7px;line-height:30px;'+(config.labelFontSize ? 'font-size:'+config.labelFontSize+'px':'')+'">'+ (config.historicalUrl ? '<a href="'+config.historicalUrl+'" target="_blank">'+config.title+'</a>' : config.title) + '</span>' +
       '<input id="title_entry_'+config.id+'" style="display:none;padding:7px;width:200px;"></input>' +
     '</span>'+
     '<div class="btn-group pull-right" style="margin-right:5px;">' +
       (config.show_tools?'' +
           '<div class="dropdown">'+
             '<a data-toggle="dropdown" class="glyphicon glyphicon-th-list" href="#"></a>'+
             '<ul class="dropdown-menu dropdown-menu-right multi-level" style="width: auto;text-align: left;">'+
               '<li><a href="#" style="padding: 5px 15px"><span class="glyphicon glyphicon-edit"></span> Edit Metric(s)</a></li>'+
               '<li><a href="#" style="padding: 5px 15px"><span class="glyphicon glyphicon-plus"></span> Add New Metric</a></li>'+
               '<li><a href="#" style="padding: 5px 15px"><span class="glyphicon glyphicon-pencil"></span> Add/Edit Lines</a></li>'+
               '<li><a href="#" style="padding: 5px 15px"><span class="glyphicon glyphicon-wrench"></span> Edit Styles/Colors</a></li>'+
               '<li class="divider" style="margin:0"></li>'+
               '<li><a href="#" style="padding: 5px 15px"><span class="glyphicon glyphicon-info-sign"></span> Edit Description</a></li>'+
               '<li class="divider" style="margin:0"></li>'+
               '<li class="dropdown-submenu dropdown-submenu-left">'+
                 '<a href="#" style="padding: 5px 15px"><span class="glyphicon glyphicon-move"></span> Move To Group</a>'+
                 '<ul class="dropdown-menu">'+
                 '</ul>'+
               '</li>'+
               (!config.disable_close?'' +
                   '<li class="divider" style="margin:0"></li>'+
                   '<li><a href="#" style="padding: 5px 15px"><span class="glyphicon glyphicon-remove"></span> Remove Graph</a></li>'
               :'') +
              '</ul>'+
             '</div>'
       :((!config.disable_close?'' +
           '<li><a href="#"><span class="glyphicon glyphicon-remove"></span></a></li>'
       :''))) +
       (config.description?'' +
           '<a href="#" class="btn btn-default glyphicon glyphicon-info-sign btn-graph-menu" title="'+config.title+'" style="color:#428bca"></a>'
           :'') +
     '</div>' +
     '<div class="clearfix"></div></header>'
     )+
     
     '<div id="'+config.id+'" class="panel-body '+ (config.isCollapse? 'panel-collapse collapse in' : '') +'" style="height:calc(100% - 40px);width:100%;padding:0;position:relative">'+
     '</div>'+
   '</div>';

    if(config.isCollapse) {
      strHtml += '</div>';
    }

    this.jqDom = $(strHtml);
    var thisObj = this;

    if (thisObj.config.titleEditable) {
      thisObj.title =this.jqDom.find('#title_'+thisObj.config.id).text();
      
      this.jqDom.find('#title_'+thisObj.config.id).click(function(e) {
        e.stopPropagation();
        var val = $('#title_'+thisObj.config.id).text();
        if(thisObj.config.isEditGraph) {
          val = "";
          thisObj.config.isEditGraph = false;
        }
        $('#title_'+thisObj.config.id).css('display', 'none');
        $('#title_entry_'+thisObj.config.id)
        .val(val)
        .css('display', '')
        .focus();
      });

      this.jqDom.find('#title_entry_'+thisObj.config.id).click(function() {
        return false;
      });

      this.jqDom.find('#title_entry_'+thisObj.config.id).blur(function() {
        thisObj.submitChange();
      });

      this.jqDom.find('#title_entry_'+thisObj.config.id).keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
          thisObj.submitChange();
        }
      });
      
      this.jqDom.find('#title_entry_'+thisObj.config.id).focus(function() {
        thisObj.submitted = false;
      });
      
      thisObj.submitChange = function() {
        if(thisObj.submitted) return;
        thisObj.submitted = true;
        if($.trim($('#title_entry_'+thisObj.config.id).val()) === "") {
          $('#title_entry_'+thisObj.config.id).focus();
          return false;
        }
        $('#title_entry_'+thisObj.config.id).css('display', 'none');
        $('#title_'+thisObj.config.id)
        .text($('#title_entry_'+thisObj.config.id).val())
        .css('display', '');
        
        if (thisObj.config.onChange) {
          if(thisObj.config.onChange($('#title_entry_'+thisObj.config.id).val())) {
            thisObj.title = $('#title_'+thisObj.config.id).text();
          } else {
            $('#title_'+thisObj.config.id).text(thisObj.title);
          }
        }
      }
    }
    
    if(thisObj.config.url) {
    	thisObj.jqDom.on("mouseup", function() {
    		window.open(thisObj.config.url)
    	});
    	thisObj.jqDom.find("*").css("cursor", "pointer");
    	if(thisObj.config.historicalUrl) {
    		thisObj.jqDom.find('#title_'+config.id).on("mouseup", function(e) {
    			e.stopPropagation();
    		});
    	}
    }
    

    this.jqDom.find(".leftSideTogglesOptions input").on("change", function() {
      var $dom = $(this);
      var value = $dom.val();
      setTimeout(function() {
        var checked = $dom.parent().hasClass("active");
        if (thisObj.onToggleLeftSideOptions) {
          thisObj.onToggleLeftSideOptions(value, checked);
        }
      }, 30);
    }); 

    this.jqDom.find("a").has(".glyphicon-remove").on("click", function() {
      if (thisObj.config.onCloseClick)
        thisObj.config.onCloseClick($(this).closest(".panel"));
      return false;
    });

    this.jqDom.find("a").has(".glyphicon-wrench").on("click", function() {
      if (thisObj.config.onToolsClick)
        thisObj.config.onToolsClick($(this).closest(".panel"));
      return false;
    });

    this.jqDom.find("a").has(".glyphicon-plus").on("click", function() {
      if (thisObj.config.onAddSeriesClick)
        thisObj.config.onAddSeriesClick($(this).closest(".panel"));
      return false;
    });

    this.jqDom.find("a").has(".glyphicon-pencil").on("click", function() {
      if (thisObj.config.onAddLinesClick)
        thisObj.config.onAddLinesClick($(this).closest(".panel"));
      return false;
    });

    this.jqDom.find("a").has(".glyphicon-edit").on("click", function() {
      if (thisObj.config.onEditClick)
        thisObj.config.onEditClick($(this).closest(".panel"));
      return false;
    });

    this.jqDom.find("a").has(".glyphicon-info-sign").on("click", function() {
      if (thisObj.config.onDescriptionClick)
        thisObj.config.onDescriptionClick($(this).closest(".panel"));
      return false;
    });

    this.jqDom.find("a").has(".glyphicon-move").on("hover", function() {
      if (thisObj.config.onMoveClick)
        return thisObj.config.onMoveClick($(this).next());
    });

    this.jqDom.find("a.btn.glyphicon-info-sign").popover({
      content: config.description,
      title: config.title,
      trigger: 'hover',
      placement: 'left',
      html: true,
      container: '#mainDashboard'
    });

    this.getJqDom = function() {
      return this.jqDom;
    };

    this.showWOWToggle = function() {
      this.jqDom.find(".wow1").css({display:"block"});
    };

    this.showDODToggle = function() {
      this.jqDom.find(".dod1").css({display:"block"});
    };

    this.setOnToggleLeftSideOptions = function(_cb) {
      thisObj.onToggleLeftSideOptions = _cb;
    };
  }
  return BootstrapPanel;
});
