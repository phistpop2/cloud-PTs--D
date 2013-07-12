var express = require('express');
var crypto = require('crypto');
var path = require('path');
var databaseUrl = "shindoh:1q1q1q@localhost:27017/cloudpresentation"; // "username:password@example.com/mydb"
var collections = ["presentation","recordHistory"];
var db = require("mongojs").connect(databaseUrl, collections);



var googl = require('goo.gl');

var app = express();

app.configure(function(){
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '/')));
});
app.set('view engine', 'ejs');

//app.use('/',express.static(__dirname+"/"));

app.get('/',function(req,res){
    res.sendfile(__dirname+'/index.html');
});

app.post('/onAir',function(req,res){
    var account = req.body.account;
    var slideData = req.body.slideData;
    var slideId = req.body.slideId;
    var currTime = new Date().getTime();
    var presentationKey = crypto.createHash('md5').update(account+currTime).digest('hex');

    var insertData = {
        'slideId' : slideId,
        'account' : account,
        'data' : slideData,
        'date' : currTime,
        'presentationKey' : presentationKey
    }

    var updateData = {
        'account' : account,
        'data' : slideData,
        'date' : currTime
    }

    db.presentation.find({slideId : slideId},function(err,datas){

        if(datas.length == 0)
        {
            db.presentation.save(insertData,function(err,inserted){
                if( err || !inserted ) console.log("presentation not inserted");
                else console.log('presentation inserted');
            });
        }
        else
        {
            presentationKey = datas[0].presentationKey;
            db.presentation.update({slideId : slideId},{$set : updateData},function(err,inserted){
                if( err || !inserted ) console.log("presentation not updated");
                else console.log('presentation updated');
            });
        }


        googl.shorten('http://localhost:16348/presentation/'+presentationKey, function (shortUrl) {
            console.log(shortUrl);
            res.json({'longUrl' : shortUrl.longUrl,'shortUrl' : shortUrl.id});
        });

        googl.setKey('AIzaSyAmh-d5UMFqedPDYARw2EaZYBE8OGmeKEA');


    });
});


app.post('/uploadRecordHistory',function(req,res){
    var account = req.body.account;
    var downloadUrls = req.body.downloadUrls;
    var title = req.body.title;
    var currTime = new Date().getTime();
    var presentationKey = req.body.presentationKey;
    var presentationData = req.body.presentationData;



    var insertData = {
        'account' : account,
        'downloadUrls' : downloadUrls,
        'title' : title,
        'date' : currTime,
        'presentationKey' : presentationKey,
        'presentationData' : presentationData
    }

    db.recordHistory.save(insertData,function(err,inserted){
        if( err || !inserted ) console.log("recordHistory not inserted");
        else console.log('recordHistory inserted');
    });

});

app.get('/presentation/:id',function(req,res){
    var presentationKey = req.params.id;

    db.presentation.find({presentationKey : presentationKey},function(err,datas){
        if(datas.length == 0)
        {

        }
        else
        {
            var data = datas[0].data;
//            res.json({presentationData : data.data});
            data = data.replace(/\\/gi,'&shin;');

            res.render(__dirname+'/proto_presentation.ejs',{'presentationData':data, 'presentationKey' : presentationKey});
        }
    });
});

app.listen(16348);