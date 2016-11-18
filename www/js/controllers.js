var myApp = angular.module('scanner.controllers', ['base64', 'ngStorage', 'ngAnimate'])

.controller('AppCtrl', function($scope, $ionicPopup, $localStorage, $ionicSideMenuDelegate, $base64, ImageService, FileService) {

    $scope.launchDeletePopup = function() {
        console.log("launchDeletePopup");

        // An elaborate, custom popup
        $scope.myPopup = $ionicPopup.show({
            templateUrl: 'templates/clear-skus.html',
            title: 'Clear All Skus',
            scope: $scope
        });
    };

    $scope.clearSkus = function() {
        //console.log("clearSkus");
        $localStorage.skus = [];
        $scope.hidePopup();
        $ionicSideMenuDelegate.toggleLeft();
        //console.log("clearSkus DONE!");
    };

    $scope.hidePopup = function() {

        $scope.myPopup.close();
    };


    $scope.showEmailPopup = function() {

        var date = moment().format("YYYYDDMM");
        var time = moment().format("HHmm");
        $scope.filename = "SKU-list_" + date + "-" + time + ".csv";
        $scope.defaultFileValue = $scope.filename;
        // An elaborate, custom popup
        $scope.myPopup3 = $ionicPopup.show({
            templateUrl: 'templates/send-email.html',
            scope: $scope
        });
    };
    $scope.hidePopup3 = function() {

        $scope.myPopup3.close();
    };

    $scope.sendEmail = function(filename) {

        //alert(filename);

        var fileString = "";
        for (var i = 0; i < $localStorage.skus.length; i++) {
            fileString += $localStorage.skus[i].quantity + "," + $localStorage.skus[i].value + "\n";
        }
        //alert(fileString);
        var barcodeData = $base64.encode(fileString);

        var emailTo = "";
        var emailSubject = "SKU: Scanner File";
        var emailAttachment = "base64:" + filename + "//" + barcodeData + "";
        var emailBody = "Attached is your SKU scanner data file.";

        window.plugin.email.open({
            to: [emailTo],
            attachments: [emailAttachment],
            subject: emailSubject,
            body: emailBody,
            isHtml: false,
        }, function() {

            $scope.hidePopup3();

        }, this);

    }; //END sendEmail()




})

.controller('EmailCtrl', function($scope, $ionicModal) {

        var date = moment().format("YYYYDDMM");
        var time = moment().format("HHmm");
        $scope.filename = date + "-" + time;
    })
    .controller('ManualCtrl', function($scope, $ionicModal, $localStorage) {

        $scope.manuallyAddedSkus = [];
        $scope.inputSku = {
            id: -1,
            value: "",
            quantity: 1
        };
        //$scope.skus = skuObj;

        $scope.addSku = function(submittedSku) {

            //alert( "addSku" );
            //alert( submittedSku );
            var newSku = {
                id: $localStorage.skus.length + 1,
                value: submittedSku.value,
                quantity: submittedSku.quantity
            };

            $scope.skus.push(newSku);
            $scope.manuallyAddedSkus.push(newSku);
            $scope.inputSku = {
                id: -1,
                value: "",
                quantity: 1
            };

            //alert($scope.inputSku);
        };
        $scope.flushSkus = function() {

            $scope.manuallyAddedSkus = [];
        };

    })
  .controller("SkuCtrl", function($scope, $cordovaBarcodeScanner, $cordovaCamera, $ionicPopup, $timeout, $base64, $localStorage, $state, ImageService, FileService) {

        $scope.$storage = $localStorage;
        if (!$localStorage.skus) {
            $localStorage.skus = [];
        }

        $scope.scanSuccess = function(result) {
            /* alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled); */

            if (result.text !== "") {
                //alert("let's go");
                var found = false;
                angular.forEach($localStorage.skus, function(sku) {

                    if (sku.value === result.text && !found) {
                        //alert(sku.value+" -> "+(sku.value === result.text));
                        sku.quantity += 1;
                        found = true;
                    }
                });
                if (!found) {
                    //alert("pushing new SKU");
                    $localStorage.skus.push({
                        id: ($localStorage.skus.length + 1),
                        value: result.text,
                        quantity: 1
                    });
                }
            }
        };
        $scope.scanFail = function(error) {

            alert("Scanning failed: " + error);
        };

        $scope.scanBarcode = function() {
            //$scope.skus.push( { value:'sdasdasd', quantity:1 } );
            $cordovaBarcodeScanner.scan().then($scope.scanSuccess, $scope.scanFail);
        };

        $scope.getTotalNumSkus = function() {
            return $localStorage.skus.length;
        }
        $scope.getSkuQuantity = function() {
            var count = 0;
            var qtyVal;

            angular.forEach($localStorage.skus, function(sku) {

                qtyVal = parseInt(sku.quantity);
                count += qtyVal;
            });
            return count;
        }

        // Triggered on a button click, or some other target
        $scope.showPopup = function(selectedSku) {

            $scope.selectedSku = selectedSku;
            $scope.data = {}

            //$scope.barcode = "http://stuffpoint.com/cats/image/455437-cats-lovely-cat.jpg";

            // An elaborate, custom popup
            $scope.myPopup = $ionicPopup.show({
                templateUrl: 'templates/edit-sku.html',
                title: 'Edit SKU',
                scope: $scope
            });
            $timeout(function() {

                $("#barcode").JsBarcode($scope.selectedSku.value, {
                    height: 20
                });
            }, 10);
        };


        $scope.hidePopup = function() {

            $scope.myPopup.close();
        };
        $scope.skuIncrement = function() {

            //Number($scope.selectedSku.quantity) += 1;
            console.log("skuIncrement before: " + $scope.selectedSku.quantity);
            var qty = parseInt($scope.selectedSku.quantity);
            qty += 1;
            $scope.selectedSku.quantity = qty;
            console.log("skuIncrement after: " + $scope.selectedSku.quantity);
        };
        $scope.skuDecrement = function() {

            //if( Number($scope.selectedSku.quantity) >= 1 ) //Number($scope.selectedSku.quantity) -= 1;
            console.log("skuDecrement before: " + $scope.selectedSku.quantity);
            var qty = parseInt($scope.selectedSku.quantity);
            if (qty >= 1) {
                qty -= 1;
            }
            $scope.selectedSku.quantity = qty;
            console.log("skuDecrement after: " + $scope.selectedSku.quantity);
        };
        $scope.updateSku = function() {

            $scope.myPopup.close();
        };
        $scope.removeSku = function(item) {

            var index = $localStorage.skus.indexOf(item);
            $localStorage.skus.splice(index, 1);
            $scope.myPopup.close();
        };


        $scope.manuallyAddedSkus = [];
        $scope.inputSku = {
            id: -1,
            value: "",
            quantity: 1
        };
        //$scope.skus = skuObj;

        $scope.inputSkuIncrement = function() {

            console.log("inputSkuIncrement before: " + $scope.inputSku.quantity);
            var qty = parseInt($scope.inputSku.quantity);
            qty += 1;
            $scope.inputSku.quantity = qty;
            console.log("inputSkuIncrement after: " + $scope.inputSku.quantity);
        };
        $scope.inputSkuDecrement = function() {

            console.log("inputSkuDecrement before: " + $scope.inputSku.quantity);
            var qty = parseInt($scope.inputSku.quantity);
            if (qty >= 1) {
                qty -= 1;
            }
            $scope.inputSku.quantity = qty;
            console.log("inputSkuDecrement after: " + $scope.inputSku.quantity);
        };
        $scope.updateBarcode = function() {
            //alert("wee");
            $("#barcode").JsBarcode($scope.inputSku.value, {
                height: 20
            });
        }
        $scope.addSku = function() {

            //alert( "addSku" );
            //alert( submittedSku );

            var newSku = {
                id: ($localStorage.skus.length + 1),
                value: $scope.inputSku.value,
                quantity: $scope.inputSku.quantity
            };



            $localStorage.skus.push(newSku);
            $scope.manuallyAddedSkus.push(newSku);
            $scope.inputSku = {
                id: -1,
                value: "",
                quantity: 1
            };

            //alert('addSku');
            $scope.myPopup2.close();
        };
        $scope.flushSkus = function() {

            $scope.manuallyAddedSkus = [];
        };

        // Triggered on a button click, or some other target
        $scope.showManualPopup = function() {

            $scope.inputSku = {
                id: -1,
                value: "",
                quantity: 1
            };

            // An elaborate, custom popup
            $scope.myPopup2 = $ionicPopup.show({
                templateUrl: 'templates/add-sku.html',
                scope: $scope
            });
        };


        $scope.hidePopup2 = function() {

            $scope.myPopup2.close();
        };

        $scope.defaultFileValue = "weee";



        //New stuff for Watson app below...

        $scope.doWatson = function() {
          console.log("Inside doWatson");

          var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation:true
          };

          $cordovaCamera.getPicture(options).then(function(imageData) {
            var image = document.getElementById('myImage');
            image.src = "data:image/jpeg;base64," + imageData;

            console.log("Inside doWatson getPicture: " + imageData);

            $localStorage.skus.push({
                    id: ($localStorage.skus.length + 1),
                    value: 'chriscoleman',
                    quantity: 1
            });

          }, function(err) {
              console.log("error Inside doWatson");
          });
        }
        

        //New stuff for Watson app above.

    }) //end SKUCtrl


.controller('QuantityCtrl', function($scope, $ionicModal) {});