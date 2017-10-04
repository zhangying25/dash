window.SHERLOCKHEADERLIB_101010 = {};
window.SHERLOCKHEADERLIB_101010.servername=window.location.host.split(":")[0];
if (window.SHERLOCKHEADERLIB_101010.servername == "sherlock" || window.SHERLOCKHEADERLIB_101010.servername == "sherlockpp" || window.SHERLOCKHEADERLIB_101010.servername == "sherlockpg") {
	window.location.href = window.location.href.replace("//"+window.SHERLOCKHEADERLIB_101010.servername, "//"+window.SHERLOCKHEADERLIB_101010.servername+".vip.ebay.com");
}

var scripts= document.getElementsByTagName('script');
var mysrc= scripts[scripts.length-1].src;
var sherlock_tenant = "mp";
var sherlock_tenant_fullname = "eBay";
var screenShot = "Not Supported On This Client";


var scriptCore = mysrc.replace("sherlock_header.js", "sherlock_header_core.js?v2");
var XMLHttpFactories = [
	function () {return new XMLHttpRequest()},
	function () {return new ActiveXObject("Msxml2.XMLHTTP")},
	function () {return new ActiveXObject("Msxml3.XMLHTTP")},
	function () {return new ActiveXObject("Microsoft.XMLHTTP")}
];

function createXMLHTTPObject() {
	var xmlhttp = false;
	for (var i=0;i<XMLHttpFactories.length;i++) {
		try {
			xmlhttp = XMLHttpFactories[i]();
		}
		catch (e) {
			continue;
		}
		break;
	}
	return xmlhttp;
}

window.SHERLOCKHEADERLIB_101010.urlStartComputed = mysrc.split("/CoreApp")[0];

var xhrObj = createXMLHTTPObject();
xhrObj.open('GET', scriptCore, false);
xhrObj.send('');

var se = document.createElement('script');
se.type = "text/javascript";
se.text = xhrObj.responseText;
document.getElementsByTagName('head')[0].appendChild(se);

var html2canvasRef=document.createElement('script');
html2canvasRef.setAttribute("type","text/javascript");
html2canvasRef.setAttribute("src", "/CoreApp/assets/js/libs/html2canvas.js");
document.getElementsByTagName("head")[0].appendChild(html2canvasRef);

var submitFeedback = function(){
	
	var metaData = {
			useragent : navigator.userAgent,
			referrer: document.referrer
		};
	
	
	
	var data = {
		category:	$("#suggestion_or_bug").val(),
		feedbackSummary : $("#feedbackSummary").val().trim(),
		feedbackDetail :  $("#feedbackDetails").val().trim(),
		pageURL : window.location.href,
		userEmail : sherlockUserProfileObject["Email"][0],
		metadata : JSON.stringify(metaData),
		screenshot : screenShot,
	};
	
	loadXMLDocWithPOST("/MySherlockApp/feedback",data );
}

function loadXMLDocWithPOST(url, payload, callBack, errorCallBack) {
	var xmlhttp;
	
	
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera,
			// Safari
			xmlhttp = new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				if (callBack != null && callBack != undefined)
				callBack(xmlhttp.responseText);
			} else if (xmlhttp.readyState == 4 && xmlhttp.status == 500) {
				if (errorCallBack != null && errorCallBack != undefined) {
					errorCallBack(xmlhttp.responseText, delta);
				}
			}
		}
		xmlhttp.open("POST", url, true);
		xmlhttp.setRequestHeader("Content-type", "application/json");
		xmlhttp.send(JSON.stringify(payload));
}

document.addEventListener("DOMContentLoaded", function(event) { 
    
    var feedbackControl = document.createElement('div');
    feedbackControl.className = "modal fade";
    feedbackControl.id = "feedbackcontrol";
    feedbackControl.setAttribute("data-html2canvas-ignore","true");
    document.getElementsByTagName('body')[0].appendChild(feedbackControl);
    
   
    $('#feedbackcontrol').load('/CoreApp/sherlock_header/sherlock_header_feedback_control.html', function(data, status, xhr){
    	
    	if(xhr.status == 200)
    	  {
	    	var feedbackButton = document.createElement('div');
	        feedbackButton.className = "feedbackbutton";
	        feedbackButton.id = "feedbackbutton";
	        feedbackButton.setAttribute("data-html2canvas-ignore","true"); 
	        document.getElementsByTagName('body')[0].appendChild(feedbackButton);
	        feedbackButton.innerHTML = "Feedback";
	
	    	 $("#submitFeedback").click(function (){
	    		 
	    		 if($("#feedbackDetails").val() == "Please provide details about your feedback or the bug."){
	    			 $("#feedbackDetails").val("");
	    		 }
	    		 
	    		 $("#feedbackSummary").removeClass("invalidInput");
	    		 $("#feedbackDetails").removeClass("invalidInput");
	    		 if( $("#feedbackSummary").val().trim() == "")
	    			 {
	    			    $("#feedbackSummary").addClass("invalidInput");
	    			 }
	    		 
	    		 if($("#feedbackDetails").val().trim() == "")
				 {
				    $("#feedbackDetails").addClass("invalidInput");
				 }
	    		 
	    		 if($("#feedbackDetails").val().trim() != "" && $("#feedbackSummary").val().trim() != "")
	    		 { submitFeedback();
	    		   $('#feedbackcontrol').modal('hide');
	    		 }
	    	 });
	    	 
	    	 $("#feedbackDetails").focus(function(){
	    		 if($("#feedbackDetails").val() == "Please provide details about your feedback or the bug."){
	    			 $("#feedbackDetails").val("");
	    		 }
	    	 }); 
	    	 
	    	 $(feedbackButton).click(function (){
	        	 $('#feedbackcontrol').on('shown.bs.modal', function (e) {
	             $("#feedbackSummary").val("");
	        	 $("#feedbackDetails").val("Please provide details about your feedback or the bug.");
	        	 $("#feedbackSummary").removeClass("invalidInput");
	    		 $("#feedbackDetails").removeClass("invalidInput");
	        	 // Commenting out following code as the process of snapshot is interrupting basic functionality of providing feedback
//	        		 try {
//	        			 $(".modal-backdrop.fade.in").attr("data-html2canvas-ignore","true");
//	        	            if(html2canvas)
//	        	               html2canvas(document.body, {
//	        	            	   ignoreElementsByIds : ["feedbackcontrol"],
//	        	                  onrendered: function(canvas) {
//	        	                	  screenShot = canvas.toDataURL();
//	        	               }
//	        	              });
//	        	            }
//	        	            catch(exception){
//	        	            	console.log(exception);	 
//	        	            } 
	        		});
	        	 $('#feedbackcontrol').modal('show');		
	        });
    	}
    });
   
    
});


