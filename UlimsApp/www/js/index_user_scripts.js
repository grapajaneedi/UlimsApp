/*jshint browser:true */
/*global $ */(function()
{
 "use strict";
 /*
   hook up event handlers 
 */
 function register_event_handlers()
 {
     setorderlist('#listorder');
    
    
     /* button  Button */
        /* button  #btnbacktologin */
    $(document).on("click", "#btnbacktologin", function(evt)
    {
         /*global activate_page */
         activate_page("#mainpage"); 
         return false;
    });
    
        /* button  #btnsetting */
    $(document).on("click", "#btnsetting", function(evt)
    {
         /*
         obal activate_page */
         activate_page("#settingpage");
         return false;
    });
    
        /* button  #btnconnect */
    $(document).on("click", "#btnconnect", function(evt)
    {
        /* your code goes here */ 
        var url = 'http://' + $('#txtdomain').val()+'/ulims/inventory/RestInventory/checkconnection';
        var req = $.getJSON(
            url,
            function( response )
            {
                customAlert(url,"success");
                $("#btnconnect").removeClass("btn-primary btn-warning").addClass("btn-success");
               //saves the domain on localstorage
                localStorage.setItem("domain",$('#txtdomain').val());
            }
        ).fail(
            function( jqxhr, textStatus, error )
            {
                //errorAlert( error, textStatus );
                $("#btnconnect").removeClass("btn-success btn-primary").addClass("btn-warning");
                customAlert("Request Failed!",textStatus);
            }
        );
        setTimeout(function(){ req.abort(); }, 5000);
        
         return false;
    });
    
        /* button  #btnlogin */
    
    
        /* button  .uib_w_20 */
    $(document).on("click", ".uib_w_20", function(evt)
    {
         /*global activate_page */
         activate_page("#menupage"); 
         return false;
    });
    
        /* button  .uib_w_22 */
    $(document).on("click", ".uib_w_22", function(evt)
    {
         /*global activate_page */
         activate_page("#menupage"); 
         return false;
    });
    
        /* button  #btninventory */
    $(document).on("click", "#btninventory", function(evt)
    {
         /*global activate_page */
         activate_page("#inventorypage"); 
         return false;
    });
    
        /* button  #btnequipment */
    $(document).on("click", "#btnequipment", function(evt)
    {
         /*global activate_page */
         activate_page("#equipmentpage"); 
         return false;
    });
    
        /* button  #btnlogin */
    $(document).on("click", "#btnlogin", function(evt)
    {
        if(!localStorage.getItem('domain')){
            customAlert("Set domain in setting first","warning");
            return false;
        }
        
        if($("#txtusername").val()===""){
            customAlert("Username required","Error");
            return false;
        }
        if($("#txtpassword").val()===""){
            customAlert("Password required","Error");
            return false;
        }
        /* your code goes here */ 
        var data = {"username":$('#txtusername').val(),"password":$('#txtpassword').val()};
    
        var req = $.post(
            customurl('login'),
            {'data':JSON.stringify(data)}, 
            function( data ) {
                var res = JSON.parse(data);
                if(res.result === true){
                    localStorage.setItem('user_id',res.user_id);
                    $("#lbluserdisplay").append(res.user_id);
                    activate_page("#menupage");
                }else{
                    customAlert(res.message,'Error');
                }
            }
        ).fail(
            function( jqxhr, textStatus, error )
            {
                customAlert( error, textStatus );
            }
        );
        setTimeout(function(){ req.abort(); }, 5000);
        
        // return false;
    });
    
        /* button  #btn_inv_scan */
    $(document).on("click", "#btn_inv_scan", function(evt)
    {
        /* your code goes here */ 
        cordova.plugins.barcodeScanner.scan(
          function (result) {
              $('#txt_inv_barcode').val(result.text);
             var data = {"code":result.text};
              //post here to get get the item name
              var req = $.post(
                customurl('getstock'),
                {'data':JSON.stringify(data)}, 
                function( data ) {
                    var res = JSON.parse(data);
                    if(res.result === true){
                        $("#txt_inv_itemname").val(res.name);
                        return false;
                    }else{
                        customAlert(res.message,'error');
                        $("#txt_inv_itemname").val("");
                        $("#txt_inv_qty").val("");
                        $("#txt_inv_barcode").val("");
                        return false;
                    }
                }
            ).fail(
                function( jqxhr, textStatus, error )
                {
                    customAlert( error, textStatus );
                }
            );
            setTimeout(function(){ req.abort(); }, 5000);
              
          },
          function (error) {
              customAlert("Scanning failed: " + error);
          },
          {
              preferFrontCamera : false, // iOS and Android 
              showFlipCameraButton : true, // iOS and Android 
              showTorchButton : true, // iOS and Android 
              torchOn: true, // Android, launch with the torch switched on (if available) 
              prompt : "Place a barcode inside the scan area", // Android 
              resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500 
              //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED 
              orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device 
              disableAnimations : true, // iOS 
              disableSuccessBeep: false // iOS 
          }
       );
        // return false;
    });
    
        /* button  #btncloseapp */
    $(document).on("click", "#btncloseapp", function(evt)
    {
        /* your code goes here */ 
        navigator.app.exitApp();
         return false;
    });
    
        /* button  #btn_inv_submit */
    $(document).on("click", "#btn_inv_submit", function(evt)
    {
        if($("#txt_inv_barcode").val()===""){
            customAlert("Scan or Choose an Item first", "Error");
            return false;
        }
        if($("#txt_inv_qty").val()===""){
            customAlert("Quantity Required!","Error");
            return false;
        }
        
        //search for same code in order on session
        var result = searchitem();
        var data = {};
        if(result===false){
            data = {"code":$("#txt_inv_barcode").val(),"qty":$("#txt_inv_qty").val()};
        }else{
            var mysession = JSON.parse(localStorage.getItem('mycart'));
            data = {"code":$("#txt_inv_barcode").val(),"qty":parseInt($("#txt_inv_qty").val()) + parseInt(mysession[result].qty)};
        }
        //post here to get get the item name
        var req = $.post(
            customurl('addtocart'),
            {'data':JSON.stringify(data)},
            function( data ) {
                var res = JSON.parse(data);
                if(res.result === true){
                    if(result!==false){
                        deleteitem(result);
                    }
                    insertitem(res.data);
                    //update the list of orders
                    setorderlist('#listorder');
                    
                }else{
                    customAlert(res.message,'error');
                }
            }
        ).fail(
            function( jqxhr, textStatus, error )
            {
                customAlert( error, textStatus );
            }
        );
        setTimeout(function(){ req.abort(); }, 5000);
        
        //clears the field
        $("#txt_inv_itemname").val("");
        $("#txt_inv_barcode").val("");
        $("#txt_inv_qty").val("");
         return false;
    });
    
        /* button  #btncheckout */
    $(document).on("click", "#btncheckout", function(evt)
    {
        /* your code goes here */ 
        
        
        if(localStorage.getItem('mycart')){
            //customAlert(JSON.parse(localStorage.getItem("mycart")),'my cart');
            var data = {"mydata": localStorage.getItem('mycart'),"user_id":localStorage.getItem('user_id')};
            var req = $.post(
            customurl('checkout'),
            {'data':JSON.stringify(data)},
            function( data ) {
                var res = JSON.parse(data);
                if(res.result === true){
                    customAlert(res.message,'success');
                    localStorage.setItem("mycart",[]);
                    setorderlist('#listorder');
                }else{
                    customAlert(res.message,'error');
                }
            }
        ).fail(
            function( jqxhr, textStatus, error )
            {
                customAlert( error, textStatus );
            }
        );
        setTimeout(function(){ req.abort(); }, 5000);
            
            
            
        }
         return false;
    });
    
        /* button  #btn_inv_destroy */
    $(document).on("click", "#btn_inv_destroy", function(evt)
    {
        /* your code goes here */ 
        localStorage.setItem("mycart",[]);
        setorderlist('#listorder');
         return false;
    });
    
        /* button  #btn-logout */
    $(document).on("click", "#btn-logout", function(evt)
    {
         /*global activate_page */
         localStorage.setItem("user_id",[]);
         activate_page("#mainpage"); 
         return false;
    });
     
     $(document).on("change", "#opt_eq_type", function(evt)
    {
         /*global activate_page */
         //customAlert($("#opt_eq_type").val(),"success");
         if($("#opt_eq_type").val()==="Usage"){
            $("#txt-eq-enddate").prop("readonly", false);
         }else{
             $("#txt-eq-enddate").prop("readonly", true);
             $("#txt-eq-enddate").val("");
         }
         
         return false;
    });
    
        /* button  #btn-eq-scan */
    $(document).on("click", "#btn-eq-scan", function(evt)
    {
        /* your code goes here */ 
            cordova.plugins.barcodeScanner.scan(
              function (result) {
                  $('#txt-eq-barcode').val(result.text);
                 var data = {"code":result.text};
                  //post here to get get the item name
                  var req = $.post(
                    customurl('getEquipment'),
                    {'data':JSON.stringify(data)}, 
                    function( data ) {
                        var res = JSON.parse(data);
                        if(res.result === true){
                            $("#txt-eq-name").val(res.name);
                             
                            if(res.status=="1"){
                                $("#btn-eq-schedule").html('<i class="glyphicon glyphicon-list button-icon-top" data-position="top"></i>Schedule');
                                $("#btn-eq-schedule").removeClass("btn-danger").addClass("btn-success");
                            }
                            else{
                                $("#btn-eq-schedule").html("Not Available");
                                $("#btn-eq-schedule").removeClass("btn-success").addClass("btn-danger");
                            }
                        }else{
                            customAlert(res.message,'error');
                        }
                    }
                ).fail(
                    function( jqxhr, textStatus, error )
                    {
                        customAlert( error, textStatus );
                    }
                );
                setTimeout(function(){ req.abort(); }, 5000);

              },
              function (error) {
                  customAlert("Scanning failed: " + error);
              },
              {
                  preferFrontCamera : false, // iOS and Android 
                  showFlipCameraButton : true, // iOS and Android 
                  showTorchButton : true, // iOS and Android 
                  torchOn: true, // Android, launch with the torch switched on (if available) 
                  prompt : "Place a barcode inside the scan area", // Android 
                  resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500 
                  //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED 
                  orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device 
                  disableAnimations : true, // iOS 
                  disableSuccessBeep: false // iOS 
              }
           );
         return false;
    });
    
        /* button  #btn-eq-items */
    $(document).on("click", "#btn-eq-items", function(evt)
    {
        customAlert("fixing","warning");
        
        
        /* your code goes here */ 
         return false;
    });
    
        /* button  #btn-eq-schedule */
    $(document).on("click", "#btn-eq-schedule", function(evt)
    {
        /* your code goes here */ 
        if($("#txt-eq-barcode").val()===''){
             customAlert("Scan or Choose an Item first", "Error"); return false;
        }
        
        if($("#txt-eq-startdate").val()===''){
             customAlert("Start Date Required", "Error"); return false;
        }
        
        if($("#opt_eq_type").val()==="Usage"){
            if($("#txt-eq-enddate").val()===''){
                customAlert("End Date Required", "Error"); return false;
            }
        }
        var data = {"code":$("#txt-eq-barcode").val(),"status":$("#opt_eq_type").val(),"startdate":$("#txt-eq-startdate").val(),"enddate":$("#txt-eq-enddate").val(),"remark":$("#txt-remarks").val(),"user_id":localStorage.getItem('user_id')};
        //post here to submit the schedule
        var req = $.post(
            customurl('schedule'),
            {'data':JSON.stringify(data)},
            function( data ) {
                var res = JSON.parse(data);
               customAlert(res.message,"success");
            }
        ).fail(
            function( jqxhr, textStatus, error )
            {
                customAlert( error, textStatus );
            }
        );
        setTimeout(function(){ req.abort(); }, 5000);
        
        
        
         return false;
    });
    
    }
 document.addEventListener("app.Ready", register_event_handlers, false);
})();

function customAlert( error_msg, title )
{
//    navigator.notification.beep(2);
//    navigator.notification.vibrate(250);
    navigator.notification.alert( error_msg,"", title,"Okay" );
}

function customurl(action){
    return "http://" + localStorage.getItem("domain") + '/ulims/inventory/RestInventory/' + action;
}

function setorderlist(selector)
{
    var mysession = [];
    if(localStorage.getItem('mycart')){
        mysession = JSON.parse(localStorage.getItem('mycart'));
    }
    $(selector).html("");
    var total = 0 ;
    $.each(mysession, function( index, obj ) {
        $(selector).append('<a class="list-group-item allow-badge widget uib_w_31" data-uib="twitter%20bootstrap/list_item" data-ver="1"><span class="badge">'+obj.qty + '</span><p class="list-group-item-text">' + obj.code + '</p><h4 class="list-group-item-heading">' + obj.name + '</h4></a>');  
        
        total = total + (parseInt( obj.price ) * parseInt( obj.qty ));
    });
    
    $("#txt_inv_total").val(total);
}

function searchitem(){
    var mysession ={};
    if(localStorage.getItem('mycart')){
        mysession = JSON.parse(localStorage.getItem('mycart'));
    }
    var myindex = false;
    for( var i = 0, len = mysession.length; i < len; i++ ) {
        if( mysession[i].code === ($("#txt_inv_barcode").val()).toLowerCase() ) {
            myindex =  i;
            break;
        }
    } 
    return myindex;
}

function deleteitem(index){
    var mysession = [];
    if(localStorage.getItem('mycart')){
        mysession = JSON.parse(localStorage.getItem('mycart'));
        mysession.splice(index,1);
        localStorage.setItem('mycart',JSON.stringify(mysession));
    }
    return true;
}

function insertitem(data){
    var mysession;
    if(!localStorage.getItem("mycart")){
          mysession = [];
    }else{
         mysession = JSON.parse(localStorage.getItem("mycart"));
    }
    
    mysession.push(data);
    localStorage.setItem('mycart',JSON.stringify(mysession));
    return true;
}
