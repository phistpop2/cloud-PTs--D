
var PSession = (function(gapi,$){

        var s = function(){
            this.CLIENT_ID = '419702397883-806pla2si1amlorm7hr44sc1gttq7vi0.apps.googleusercontent.com';
            this.SCOPES = [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ];
            this.API_KEY = 'AIzaSyAmh-d5UMFqedPDYARw2EaZYBE8OGmeKEA';
            this.gapi = gapi;

            this.accessToken  = null;
            this.userInfo = null;
            this.workFolderId = null;
        }

        s.prototype.uploadRecordHistory = function(recordDataSet,successCallback)
        {

            $.ajax({
                'type' : "POST",
                'url' : '/uploadRecordHistory',
                'data' : JSON.stringify(recordDataSet),
                'dataType' : "json",
                'contentType' : "application/json; charset=utf-8",
                'success' : successCallback,
                'failure' : function(err){console.log(err)}
            });
        },

        s.prototype.getUserInfo = function()
        {
            return this.userInfo;
        }

        s.prototype.getAccessToken = function()
        {
            return this.accessToken;
        }

        s.prototype.setUserInformation = function()
        {
            if(this.accessToken)
            {
                var this_ = this;
                var request = gapi.client.request({
                    'path': '/oauth2/v1/userinfo?alt=json',
                    'method': 'GET'});

                request.execute(function(userInfo)
                {
                    this_.userInfo = userInfo;
                    $(document).trigger('completeUserInfo');
                });
            }
        }

        s.prototype.saveToGoogleDrive = function(saveDatas)
        {
              var saveDataStr = JSON.stringify(saveDatas);

              var fileId = this.currentWorkFile.id

                const boundary = '-------314159265358979323846';
                const delimiter = "\r\n--" + boundary + "\r\n";
                const close_delim = "\r\n--" + boundary + "--";

                var text =saveDataStr;
                var contentType = "application/cloudpresentation";
                var metadata = {
                    'parents' : [{'id':this.workFolderId}],
                    'mimeType': contentType};

                var multipartRequestBody =
                    delimiter +  'Content-Type: application/json\r\n\r\n' +
                        JSON.stringify(metadata) +
                        delimiter + 'Content-Type: ' + contentType + '\r\n' + '\r\n' +
                        text +
                        close_delim;

                 var callback;
                if (!callback) { callback = function(file) { console.log("Update Complete ",file) }; }

                gapi.client.request({
                    'path': '/upload/drive/v2/files/'+fileId,
                    'method': 'PUT',
                    'params': {'uploadType': 'multipart','newRevision' : true},
                    'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
                    'body': multipartRequestBody,
                    callback:callback
                });
        },

        s.prototype.uploadBlobTpMerge = function(blobs,dataset,type){
            console.log("uploadBlobTpMerge",blobs);
            var blob = blobs.shift();
            var blobs_ = blobs;
            var type_ = type;
            var reader = new FileReader();
            var this_ = this;
            var dataset_ = dataset;

            console.log("dataset",dataset);
            var reader = new FileReader();
            reader.onloadend = function(evt) {
                console.log("onloadend");
                const boundary = '-------314159265358979323846';
                const delimiter = "\r\n--" + boundary + "\r\n";
                const close_delim = "\r\n--" + boundary + "--";

                var contentType = type||'application/octect-stream';
                var metadata = {
                    'title': dataset_.title,
                    'parents' : [{'id':this_.workFolderId}],
                    'mimeType': contentType
                };

                console.log(this_.workFolderId);
                var base64Data = btoa(evt.target.result);

                var multipartRequestBody =
                    delimiter +
                        'Content-Type: application/json\r\n\r\n' +
                        JSON.stringify(metadata) +
                        delimiter +
                        'Content-Type: ' + contentType + '\r\n' +
                        'Content-Transfer-Encoding: base64\r\n' +
                        '\r\n' +
                        base64Data +
                        close_delim;

                var request = gapi.client.request({
                    'path': '/upload/drive/v2/files?uploadType=resumable',
                    'method': 'POST',
                    'params': {'uploadType': 'multipart'},
                    'headers': {
                        'Content-Type': 'application/json; boundary="' + boundary + '"',
                        'X-Upload-Content-Type': type_
                    },
                    'body': multipartRequestBody});

                console.log('execute');
                request.execute(function(data){
                    console.log("resumable init",data);
                    dataset_.downloadUrls.push(data.webContentLink);
                    dataset_.fileId = data.id;
                    this_.setPermission(data);
                    this_.uploadBlobs(blobs_,dataset_,type_);
                });
            }

            reader.readAsBinaryString(blob);
        },

        s.prototype.uploadBlobs = function(blobs,dataset,type)
        {
            console.log("uploadBlobs");
            var this_ = this;

            this.uploadBlob(blobs.shift(),dataset,function(file){
                console.log("uploaded file",file);
               if(blobs.length){
                   this_.uploadBlobs(blobs,dataset,type);
               }
               else{
                   console.log("completeUploadBlobs");
                   $(document).trigger('completeUploadBlobs');
               }
            },type);
        },

        s.prototype.uploadBlob = function(blob,dataset,callback,type)
        {

            var reader = new FileReader();
            var dataset_ = dataset;
            var type_ = type;
            var this_ = this;

            reader.onload = function(evt) {
                var fileId = dataset_.fileId;

                const boundary = '-------314159265358979323846';
                const delimiter = "\r\n--" + boundary + "\r\n";
                const close_delim = "\r\n--" + boundary + "--";


                var base64Data = btoa(reader.result);
                base64Data = base64Data.substring(76);

                var contentType = type_;
                var metadata = {
                    'parents' : [{'id':this_.workFolderId}],
                    'mimeType': contentType};

                var multipartRequestBody =
                    delimiter +  'Content-Type: application/json\r\n\r\n' +
                        JSON.stringify(metadata) +
                        delimiter + 'Content-Type: ' + contentType + '\r\n' +
                        'Content-Transfer-Encoding: base64\r\n' +
                        '\r\n' +
                        base64Data +
                        close_delim;


                var request =  gapi.client.request({
                    'path': '/upload/drive/v2/files/'+fileId,
                    'method': 'PUT',
                    'params': {'uploadType': 'multipart','alt': 'json'},
                    'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
                    'body': multipartRequestBody});

                request.execute(callback);


            }
            reader.readAsBinaryString(blob);

        },


        s.prototype.checkWorkFolder = function()
        {
            var this_ = this;
            var query = "?q=title='CloudPresentation'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false";
            var callback = function(result){
                if(result.items.length == 0)
                {

                    this_.createWorkFolder();
                }
                else
                {
                    this_.workFolderId = result.items[0].id;
                    this_.searchWorkFiles();
                }
            }
            this.executeSearchQuery(query,callback);
        },


        s.prototype.dataURItoBlob = function(dataURI, callback){
            // convert base64 to raw binary data held in a string
            // doesn't handle URLEncoded DataURIs
            var byteString = atob(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // write the ArrayBuffer to a blob, and you're done
            var bb = new Blob([ab]);

            return bb;
        },

        s.prototype.uploadFile = function(base64Data,type,callback){
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            var blob = this.dataURItoBlob(base64Data);
            console.log('blob',blob);
/*

            base64Data = base64Data.replace('data:audio/wav;base64,','');

            var contentType = type || 'application/octect-stream';
            var metadata = {
                'title': 'test',
                'parents' : [{'id':this.workFolderId}],
                'mimeType': contentType,
                'type': 'anyone'
            };

            var multipartRequestBody =
                delimiter +

                    'Content-Type: application/json\r\n\r\n' +
                    JSON.stringify(metadata) +
                    delimiter +
                    'Content-Type: ' + contentType + '\r\n' +
                    'Content-Transfer-Encoding: base64\r\n' +
                    '\r\n' +
                    base64Data +
                    close_delim;

            var request = gapi.client.request({
                'path': '/upload/drive/v2/files',
                'method': 'POST',
                'params': {'uploadType': 'multipart'},
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody});

            var this_ = this;
            var callback_ = callback;
            request.execute(function(file){
                    this_.setPermission(file,callback_);
                });
*/
        },

        s.prototype.setPermission = function(file,callback)
        {

            var fileId = file.id;
            var role = 'reader';
            var type = 'anyone';

            var setting = {
                'role' : role,
                'type' : type
            };

            var request = gapi.client.request({
                'path': "/drive/v2/files/"+fileId+"/permissions",
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body' : JSON.stringify(setting)
            });

            var callback_ = callback;
            var file_ = file;

            request.execute(function(data)
            {
                data.file = file_;
                if(callback_)
                {
                    callback_(data);
                }

            });
        },

        s.prototype.createWorkFolder = function()
        {
            var this_ = this;

            var folder = {
                title : 'CloudPresentation',
                mimeType : 'application/vnd.google-apps.folder'
            };

            var request = gapi.client.request({
                'path': "/drive/v2/files",
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body' : folder
            });

            request.execute(function(result)
            {
                this_.workFolderId = result.id;
                this_.searchWorkFiles();
            });
        },

        s.prototype.createNewWorkFile = function(title,callback)
        {
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            var text ='{"sequence":[],"models":[]}';
            var contentType = "application/cloudpresentation";
            var metadata = {
                'title' : title,
                'parents' : [{'id':this.workFolderId}],
                'mimeType': contentType};

            var multipartRequestBody =
                delimiter +  'Content-Type: application/json\r\n\r\n' +
                    JSON.stringify(metadata) +
                    delimiter + 'Content-Type: ' + contentType + '\r\n' + '\r\n' +
                    text +
                    close_delim;


            if (!callback) { callback = function(file) { console.log("Update Complete ",file) }; }

            gapi.client.request({
                'path': '/upload/drive/v2/files/',
                'method': 'POST',
                'params': {'uploadType': 'multipart'},
                'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
                'body': multipartRequestBody,
                callback:callback
            });
        },

        s.prototype.searchWorkFiles = function()
        {
            var this_ = this;
            var id = this.workFolderId;

            var callback = function(result)
            {
                var event = $.Event('workList');
                event.workDatas = result;
                $(document).trigger(event);
            };

            this.executeSearchQuery("?q='"+id+"'+in+parents+and+trashed=false+and+mimeType='application/cloudpresentation'",callback);

        },

        s.prototype.openWorkFile = function(fileData,callback)
        {
            var this_ = this;
            var callback_ = callback;
            var fileUrl = fileData.downloadUrl;
            this.currentWorkFile = fileData;

            $.ajax({
                url : fileUrl,
                headers : {
                    'Authorization' : 'Bearer ' + this_.accessToken
                }
            }).done(function(workData){
                callback_(workData);
            });
        },


        s.prototype.getFileByUrl = function(fileUrl,callback)
        {
            var this_ = this;
            var callback_ = callback;

            $.ajax({
                url : fileUrl,
                headers : {
                    'Authorization' : 'Bearer ' + this_.accessToken
                }
            }).done(function(workData){
                    callback_(workData);
                });
        },


        s.prototype.executeSearchQuery = function(query,callback)
        {
            var request = gapi.client.request({
                'path': "/drive/v2/files"+query,
                'method': 'GET',
                'headers': {
                    'Content-Type': 'application/json'
                }
            });

            request.execute(function(result)
            {
                callback(result);
            });
        },

        s.prototype.authorization = function()
        {

            var gapi = this.gapi;
            var this_ = this;
            gapi.client.setApiKey(this.API_KEY);
            gapi.auth.authorize({
                    client_id: this.CLIENT_ID,
                    scope: this.SCOPES.join(' '),
                    immediate: false
                }, function(authResult) {
                    if (authResult && !authResult.error) {
                        this_.accessToken = authResult.access_token;
                        $(document).trigger('accountSuccess');

                    } else {
                        alert("your account is invalidated!");
                    }
                }
            );
            return false;
        }

    return s;
})(gapi,jQuery);
