var SHERLOCKLIB = SHERLOCKLIB ? SHERLOCKLIB : {};
SHERLOCKLIB.groupsApp = "/groups/v1";

var groupsObj = new function() {
  var groupsHash = {};
  var groupsHashMetaAll = {};
  var groupsHashCreate = {};

  var thisObj = this;

  var roleResponse = null;
  var operationsResponse = {};

  var operationsHash = {};
  var rolesHash = {};

  this.owner = undefined;

  this.userDefaultOperations = function() {
    var permissionsHash = {read:true, create:true};
    return permissionsHash;
  }

  if (typeof getSherlockUserInfo!=='undefined' && getSherlockUserInfo() != null) 
    this.owner = getSherlockUserInfo().user;

  if (! this.owner) {
    window.location.href = "http://sherlock.vip.ebay.com/CoreApp/signIn";
    return;
  }

  var loadOwnerInfo = function() {
    var err = false;
    $.ajax({
      timeout:3000,
      maxTries: 10,
      url : SHERLOCKLIB.groupsApp +"/roles/getuserroles?username=" + thisObj.owner,
      type : "get",
      dataType : "json",
      async: false,
      success : function(respObj) {
        roleResponse = respObj;
      },
      error : function(jqXHR, textStatus,errorThrown) {
       err = true;
      }
    });

    if (err) return;

    $.ajax({
      timeout:3000,
      maxTries: 10,
      url : SHERLOCKLIB.groupsApp +"/roles/getallroles",
      type : "get",
      dataType : "json",
      async: false,
      success : function(respObj) {
        for(var i in respObj) {
          var roleInfo = respObj[i];
          var operations = new Object();
          operationsResponse[roleInfo.rolename] = operations;
          for(var j in roleInfo.operations) {
            operations[roleInfo.operations[j]] = true;
          }
        }
      },
      error : function(jqxhr, textstatus,errorthrown) {
       err = true;
      }
    });

    if (err) return;

    $.ajax({
      timeout:15000,
      maxTries: 10,
      url : SHERLOCKLIB.groupsApp +"/getallgroupsids?username=",
      type : "get",
      dataType : "json",
      async: false,
      success : function(respObj) {
        for(var i in respObj) {
          var entry = respObj[i];
          groupsHashMetaAll[entry._id] = entry.name;
        }
      },
      error : function(jqxhr, textstatus,errorthrown) {
       err = true;
      }
    });

    if (err) return;

    var ownerInfo = {
      version : "v2",
      ts : ts,
      roleResponse : roleResponse,
      operationsResponse : operationsResponse,
      groupsHashMetaAll : groupsHashMetaAll
    };
    localStorage.setItem(thisObj.owner, JSON.stringify(ownerInfo));
  };

  var ownerInfo = localStorage.getItem(thisObj.owner);
  var ts = new Date().getTime();
  if (ownerInfo) {
    try {
      ownerInfo = JSON.parse(ownerInfo);
    } catch(e) {
      ownerInfo = undefined;
    }
  }

  if (ownerInfo && ownerInfo.version == "v2" &&  (ts - ownerInfo.ts) < 300000) {
    roleResponse = ownerInfo.roleResponse;
    operationsResponse = ownerInfo.operationsResponse;
    setTimeout(function() {
      loadOwnerInfo();
    }, 15000);
  } else { 
    loadOwnerInfo();
  }

  var respObj = roleResponse;
  if(respObj && respObj[2] && respObj[2].operations) {
    $.each(respObj[2].operations, function(index, value) {
      operationsHash[value] = true;
    })
  }

  if(respObj && respObj[1] && respObj[1].roles) {
    $.each(respObj[1].roles, function(index, value) {
      rolesHash[value] = true;
    })
  }

  if ($("#groupsTbl").length == 1) {
  var oTable = $("#groupsTbl").dataTable({"sDom": '<"shGroup_filterLeft"f><"createShGroup">t<"bottom"p><"clear">'});
  $(".shGroup_filterLeft").css({'float':'left', 'margin-top':'20px'});
  $(".createShGroup").css({'float':'right', 'margin-top':'20px'});
  $(".createShGroup").html("<button class='btn btn-primary' style='margin-top:-10px;'><span class='glyphicon glyphicon-plus-sign'></span> Create User Group</button>");
  $(".createShGroup").on("click", function() {
    thisObj.createTable();
    trackFunc("MyUserGroups_CreateNew");
  });

  var permissionsDefault = this.userDefaultOperations();
  if (permissionsDefault.create == undefined) {
     $(".createShGroup").css({display:"none"});
  }

  $("#groupsTbl").on("click","tbody td button", function(event) {
     var $this = $(this);
     var groupId = $this.data("id");
     var groupDetails = groupsHash[groupId];

     var formHtml = '<form class="form-horizontal" id="formGroupEdit">' +
      '<div class="form-group">' + 
      ' <label class="col-md-3 control-label" for="groupName">User Group <font color="red">*</font></label>' +
      ' <div class="col-md-6">' +
      '  <input id="groupName" name="groupName" placeholder="type group name" class="form-control input-md" type="text" required="" value="'+groupDetails.name+'">'+
      '  </div>'+
      '</div>'+
      '<div class="form-group">' + 
      ' <label class="col-md-3 control-label" for="groupDL">Group DL </label>'+
      ' <div class="col-md-8">'+
      '  <input id="groupDL" name="groupDL" placeholder="Type a DL" class="form-control input-md" type="text">'+
      ' </div>'+
      '</div>'+
      '<div class="form-group">' + 
      ' <label class="col-md-3 control-label" for="users">Users <font color="red">*</font></label>'+
      ' <div class="col-md-8">'+
      '  <div style="max-height:200px;overflow:auto"><input id="users" name="users" class="form-control input-md" required="" type="text"></div>'+
      '  <a id="clrUsers" href="#"><span class="glyphicon glyphicon-remove" style="color:red;font-size:9px"></span>Clear Users</a>'+
      ' </div>'+
      '</div>'+
      '<div class="form-group">' + 
      ' <label class="col-md-3 control-label" for="owners">Group Admin <font color="red">*</font></label>'+
      ' <div class="col-md-8">'+
      '  <input id="owners" name="owners" class="form-control input-md" required="">'+
      ' </div>'+
      '</div>'+
      '</form>';
     setTimeout(function() {
       $("#groupDL").on("change", function(e) {
             $.ajax({
               async:false,
               url: SHERLOCKLIB.groupsApp + "/ldap/DL/"+e.val+"/members",
               type: "get",
               dataType: "json",
               success : function(membersResponse) {
                 if (membersResponse.body[0].ERROR) {
                   bootbox.alert(e.val + " has more than 50 members. We add only first 50 members from the DL. You have still an option to add more users in Users field.", function() {});
                 }
                 var members = membersResponse.body[0].USERS;
                 var selected = $("#users").select2("data");
                 var selectedArr = [];
                 _.each(selected, function(s) {
                    selectedArr.push(s.id);
                 });
                 members = _.union(selectedArr, members);
                 var data = [];
                 _.each(members, function(member) {
                   data.push({id:member, text:member});
                 });
                 $("#users").select2("data", data); 
               },
               error: function() {
               }
             });
       });
       $("#clrUsers").click(function() { $("#users").select2("val", ""); return false;});
       $('#formGroupEdit').validate({
              highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
              },
              unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
              },
              errorElement: 'span',
              errorClass: 'help-block',
              errorPlacement: function(error, element) {
                if(element.parent('.input-group').length) {
                  error.insertAfter(element.parent());
                } else {
                   error.insertAfter(element);
                }
              }
       });
       $("#groupName").rules("add", { regex: /^[A-Za-z0-9\._%\-\s]+$/, maxlength: 25 });
       $("#users, #owners").select2({
         placeholder: "User IDs",
         ajax : {
           url:function (query){
             return SHERLOCKLIB.groupsApp + "/ldap/users/filter/"+query;
           },
           results: function(list) {
               var data = {results: []};
               for(var id in list) {
                  var user = list[id];
                  data.results.push({id:user, text:user});
               }
               return data;
           }
         },
         minimumInputLength: 2,
         multiple: true,
         initSelection : function (element, callback) {
           var target = element.attr("id");
           var data = [];
           if (target == "users") {
              for(var id in groupDetails.users) {
                 var user = groupDetails.users[id];
                 data.push({id:user, text:user});
              }
           } else if (target == "owners") {
              for(var id in groupDetails.owner) {
                 var user = groupDetails.owner[id];
                 data.push({id:user, text:user});
              }
           }
           callback(data);
         }
       }).select2('val', []);
       $("#groupDL").select2({
          ajax : {
             url: function (query) {
               return SHERLOCKLIB.groupsApp + "/ldap/DL/filter/"+query
             },
           results: function(list) {
               var data = {results: []};
               for(var id in list) {
                  var user = list[id];
                  data.results.push({id:user, text:user});
               }
               return data;
           }
         },
         minimumInputLength: 2,
         multiple: false,
         initSelection : function (element, callback) {
           var data = {id: groupDetails.DL, text: groupDetails.DL};
           callback(data);
         }
       }).select2('val', []);
     }, 180);
     bootbox.dialog({
        message: formHtml,
        title: "Edit User Group : " + groupDetails.name,
        buttons: {
         success: {
           label: "Update",
           className: "btn-primary",
           callback: function() {
             var isValid = $('#formGroupEdit').valid();
             if (!isValid) {
               return false;
             }
             groupDetails.name = $("#groupName").val().trim();
             groupDetails.DL = $("#groupDL").val().trim();
             groupDetails.owner = $("#owners").val().trim().split(',');
             var users = $("#users").val().trim().split(',');
             if (users.length > 0) {
               groupDetails.users = users;
             }
             var close = true;
             $.ajax({
               async:false,
               cache:false,
               url: SHERLOCKLIB.groupsApp + "/addedit?operation=update&username="+thisObj.owner,
               type: "post",
               dataType: "json",
               contentType:"application/json",
               data: JSON.stringify(groupDetails), 
               success : function() {
                 thisObj.populateGroupsTable(true);
                 return true;
               },
               error: function(jqXHR) {
                 if (jqXHR.responseText == '"GROUP_ALREADY_EXISTS"') {
                   bootbox.alert("This Group name already exists. Please choose a different name for the Group", function() {});
                   $("#groupName").focus();
                 } else {
                   bootbox.alert(jqXHR.responseText, function() {});
                 }
                 close = false;
               }
             });
             return close;
           }
         },
         danger: {
           label: "Cancel",
           className: "btn-warning",
           callback: function() {
           }
         }
        },
     });
     trackFunc("MyUserGroups_Edit");
  });

  } //if table is there

  this.createTable = function() {
   var formHtml = '<form class="form-horizontal" id="formGroupCreate">' +
      '<div class="form-group">' + 
      ' <label class="col-md-3 control-label" for="groupName">User Group <font color="red">*</font></label>' +
      ' <div class="col-md-6">' +
      '  <input id="groupName" name="groupName" placeholder="type group name" class="form-control input-md" type="text" required="">'+
      '  </div>'+
      '</div>'+
      '<div class="form-group">' + 
      ' <label class="col-md-3 control-label" for="groupDL">Group DL </label>'+
      ' <div class="col-md-8">'+
      '  <input id="groupDL" name="groupDL" placeholder="Type a DL" class="form-control input-md" type="text">'+
      ' </div>'+
      '</div>'+
      '<div class="form-group">' + 
      ' <label class="col-md-3 control-label" for="users">Users <font color="red">*</font></label>'+
      ' <div class="col-md-8">'+
      '  <div style="max-height:200px;overflow:auto"><input id="users" name="users" class="form-control input-md" required="" type="text"></div>'+
      '  <a id="clrUsers" href="#"><span class="glyphicon glyphicon-remove" style="color:red;font-size:9px"></span>Clear Users</a>'+
      ' </div>'+
      '</div>'+
      '<div class="form-group">' + 
      ' <label class="col-md-3 control-label" for="owners">Group Admin <font color="red">*</font></label>'+
      ' <div class="col-md-8">'+
      '  <input id="owners" name="owners" class="form-control input-md" required="" type="text">'+
      ' </div>'+
      '</div>'+
      '</form>';
     setTimeout(function() {
       $("#clrUsers").click(function() { $("#users").select2("val", ""); return false;});
       $("#groupDL").on("change", function(e) {
             $.ajax({
               async:false,
               url: SHERLOCKLIB.groupsApp + "/ldap/DL/"+e.val+"/members",
               type: "get",
               dataType: "json",
               success : function(membersResponse) {
                 if (membersResponse.body[0].ERROR) {
                   bootbox.alert(e.val + " has more than 50 members. We add only first 50 members from the DL. You have still an option to add more users in Users field.", function() {});
                 }
                 var members = membersResponse.body[0].USERS;
                 var selected = $("#users").select2("data");
                 var selectedArr = [];
                 _.each(selected, function(s) {
                    selectedArr.push(s.id);
                 });
                 members = _.union(selectedArr, members);
                 var data = [];
                 _.each(members, function(member) {
                   data.push({id:member, text:member});
                 });
                 $("#users").select2("data", data); 
               },
               error: function() {
               }
             });
       });
       $('#formGroupCreate').validate({
              highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
              },
              unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
              },
              errorElement: 'span',
              errorClass: 'help-block',
              errorPlacement: function(error, element) {
                if(element.parent('.input-group').length) {
                  error.insertAfter(element.parent());
                } else {
                   error.insertAfter(element);
                }
              }
       });
       $("#groupName").rules("add", { regex: /^[A-Za-z0-9\._%\-\s]+$/, maxlength: 25});

       $("#users, #owners").select2({
         placeholder: "User IDs",
         ajax : {
           url:function (query){
             return SHERLOCKLIB.groupsApp + "/ldap/users/filter/"+query;
           },
           results: function(list) {
               var data = {results: []};
               for(var id in list) {
                  var user = list[id];
                  data.results.push({id:user, text:user});
               }
               return data;
           }
         },
         minimumInputLength: 2,
         multiple: true,
         initSelection : function (element, callback) {
           var data = [{id: thisObj.owner, text: thisObj.owner}];
           callback(data);
         }
       }).select2('val', []);
       $("#groupDL").select2({
          ajax : {
             url: function (query) {
               return SHERLOCKLIB.groupsApp + "/ldap/DL/filter/"+query
             },
           results: function(list) {
               var data = {results: []};
               for(var id in list) {
                  var user = list[id];
                  data.results.push({id:user, text:user});
               }
               return data;
           }
         },
         minimumInputLength: 2,
         multiple: false
       });
     }, 180);
     bootbox.dialog({
        message: formHtml,
        title: "Create User Group",
        buttons: {
         success: {
           label: "Create",
           className: "btn-primary",
           callback: function() {
             var isValid = $('#formGroupCreate').valid();
             if (!isValid) {
               return false;
             }

             var groupDetails = {};
             groupDetails.name = $("#groupName").val().trim();
             groupDetails.DL = $("#groupDL").val().trim();
             groupDetails.owner = $("#owners").val().trim().split(',');
             var users = $("#users").val().trim().split(',');
             if (users.length > 0) {
               groupDetails.additionalusers = users;
             }
             var close = true;
             $.ajax({
               async:false,
               url: SHERLOCKLIB.groupsApp + "/addedit?operation=create&username="+thisObj.owner,
               type: "post",
               dataType: "json",
               contentType:"application/json",
               data: JSON.stringify(groupDetails), 
               success : function() {
                 thisObj.populateGroupsTable(true);
               },
               error: function(jqXHR) {
                 if (jqXHR.responseText == '"GROUP_ALREADY_EXISTS"') {
                   bootbox.alert("This Group name already exists. Please choose a different name for the Group", function() {});
                   $("#groupName").focus();
                 } else {
                   bootbox.alert(jqXHR.responseText, function() {});
                 }
                 close = false;
               }
             });
             return close;
           }
         },
         danger: {
           label: "Cancel",
           className: "btn-warning",
           callback: function() {
           }
         }
        },
     });
  };

  this.populateGroupsTable = function(addIntoTable, _cb) {
    if (addIntoTable) {
     oTable.fnClearTable();
     $("#MyUserGroups").css({position:"relative", 'margin-top':'2px', 'min-height':'200px'});
     $("#MyUserGroups").showAjaxAnimation();
    }
    $.ajax({
      timeout:5000,
      maxTries: 10,
      async : true,
      url : SHERLOCKLIB.groupsApp + "/managegroups?username="+this.owner,
      dataType : 'json',
      success : function(groups) {
        _.each(groups, function(group) {
           groupsHash[group._id] = group;
           var permissionsHash = thisObj.getMyPermissionsByGroupIdExternal(group._id);
           if (addIntoTable) {
             oTable.fnAddData([group.name, group.owner, group.DL, group.users.join(", "),
               permissionsHash.update?"<button title='Edit' data-id='"+group._id+"' type='button' class='btn btn-default btn-xs active'><span class='glyphicon glyphicon-pencil'></span></button>":""]
             , false);
           }
           if (permissionsHash.create) {
             groupsHashCreate[group._id] = group;
           }
        });
        if (_cb) _cb();
        if (addIntoTable) {
          oTable.fnDraw();
          $("#MyUserGroups").hideAjaxAnimation();
        }
      }
    });
  };

  this.getMyGroupIds = function() {
    return Object.keys(groupsHash);
  };

  this.getMyGroupIdsCreate = function() {
    return Object.keys(groupsHashCreate);
  };
  
  this.getMyGroups = function() {
    return groupsHash;
  }
  
  this.getMyOwnedGroups = function() {
    var myOwnedGroups = new Array();
    for(var x in groupsHash) {
      for(var y in groupsHash[x].owner) {
        if(groupsHash[x].owner[y] == groupsObj.owner) {
          myOwnedGroups.push(groupsHash[x]);
        }
      }
    }
    return myOwnedGroups;
  }

  this.getGroupsNameValueArr = function() {
    var arr = new Array();
    _.each(groupsHash, function(group, id) {
      arr.push({name:group.name,value:id});
    });
    arr.sort(function(g1, g2) {
      var x = g1.name.toLowerCase();
      var y = g2.name.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });
    return arr;
  };

  this.getGroupsCreateNameValueArr = function() {
    var arr = new Array();
    _.each(groupsHashCreate, function(group, id) {
      arr.push({name:group.name,value:id});
    });
    arr.sort(function(g1, g2) {
      var x = g1.name.toLowerCase();
      var y = g2.name.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });
    return arr;
  };

  this.getGroupName = function(groupId) {
    var gi = groupsHash[groupId];
    if (gi == undefined) {
     var name = ownerInfo.groupsHashMetaAll[groupId];
     if (name) return name;
     else return "Unknown";
    }
    else return gi.name;
  };

  this.getGroupInfoById = function(groupId, _cb) {
    $.ajax({
      timeout:5000,
      maxTries: 10,
      async : true,
      url : SHERLOCKLIB.groupsApp + "/get/"+groupId+"?username=&operation=",
      dataType : 'json',
      success : function(groupsInfoArr) {
        _cb(groupsInfoArr[0]);
      }
    });
  };

  this.isApprover = function(_cb) {
    var approver = false;
    if(operationsHash.approve) {
       approver = true;
    }
    if (_cb) _cb(approver);
    return approver;
  }

  this.getMyPermissionsInternal = function() {
    return operationsHash;
  }

  this.getMyPermissionsByGroupIdExternal = function(groupId) {
    var permissionsHash = {};
    var gi = groupsHash[groupId];
    if (gi == undefined) return permissionsHash;
    var searchOwner = gi.owner.indexOf(thisObj.owner);
    var searchUsers = gi.users.indexOf(thisObj.owner);
    if (searchOwner == -1 && searchUsers == -1) {
       return permissionsHash;
    }
    if (searchOwner > -1) {
      return operationsResponse["owner"];
    } else if (searchUsers > -1) {
      return operationsResponse["user"];
    }
  };

  this.getMyPermissionsByGroupIdExternalByOwner = function(groupId) {
    var permissionsHash = {};
    var gi = groupsHash[groupId];
    if (gi == undefined) return permissionsHash;
    var searchOwner = gi.owner.indexOf(thisObj.owner);
    if (searchOwner == -1) {
       return permissionsHash;
    }
    if (searchOwner > -1) {
      return operationsResponse["owner"];
    }
  };
};
