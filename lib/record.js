RecordControl = (function($,window,navigator,document){

    var r = function()
    {
        window.URL = window.URL || window.webkitURL;
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||       window.MozBlobBuilder;
        navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        this.audio = document.querySelector('audio');
        this.recorder = null;
    }


    r.prototype.onFail = function(e) {
        console.log('Rejected!', e);
    };


    r.prototype.startRecording = function(){
        var this_ = this;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({audio: true}, function(s){
                var context = new webkitAudioContext();
                var mediaStreamSource = context.createMediaStreamSource(s);

                this_.recorder = new Recorder(mediaStreamSource);
                this_.recorder.record();
            }, this.onFail);
        } else {
            console.log('navigator.getUserMedia not present');
        }
    }

    r.prototype.stopRecording = function(){
                          console.log('stop...');
        var this_ = this;

        var recorder_ = this.recorder;
        this.recorder.stop();

        this.recorder.exportWAV(function(s) {
            console.log('check');
            var event = jQuery.Event('recordComplete');
            recorder_.recordDatas.push(s);
            event.recordDatas = recorder_.recordDatas;
            $(document).trigger(event);
            return;
/*
            var url =    window.URL.createObjectURL(s);
            this_.audio.src = url;
            var reader = new window.FileReader();
            reader.onload = function(evt)
            {
                var blob = evt.target.result;

                event.blob = blob;

            }

            reader.readAsDataURL(s);
*/
        });
    }



    return r;
})(jQuery,window,navigator,document);





