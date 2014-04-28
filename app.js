//Get dependenies

var express = require('express'),
    colors = require('colors').
    pg = require('pg');

var dbconn = process.env.DATABASE_URL || "postgres://nodetest:bigswigmoney@localhost/nodetest";

var app = express();

// environment variables
app.set('port', process.env.PORT || 3000);
// smallest middleware in the world
app.use(function(req,res,next){
    //console.log(__dirname);
    next();
});


app.use(express.static(__dirname));
//app.use('/assets/css',express.static(__dirname+'/assets/css'));
//app.use('/assets/js',express.static(__dirname+'/assets/js'));
//app.use(express.favicon());
//app.use(express.methodOverride());
//app.use(app.router);


/**
 * Page URLs.
 */

//TODO splash.html
app.get('/',function(req,res){
    res.sendfile('index.html');
}); 

//TODO signup.html (we don't have this yet)
app.get('/login',function(req,res){
    res.sendfile('login.html');

}); //send back signup page

//TODO main.html
app.get('/nearby', function(req,res){
    res.sendfile('main.html');
});

//TODO party create form (don't have this yet)
app.get('/party/create', function(req,res){
    res.sendfile('partyform.html');
});

//TODO party profile (don't have this yet)
app.get('/party/:id',function(req,res){
    res.sendfile('partydetails.html');
});



/**
 * Action URLs.
 */

app.post('/login',function(req,res){
    //get credentials from req
    //find it in db (callback for directing user to /nearby)
    pg.connect(dbconn,function(err,clinet,done){
        console.log('swingin here');
        if(err) return console.rr('postgresql',err);
    });
});

//TODO 
app.post('/signup',function(req,res){
    //get credentials from req
    //store in db
});

//TODO get coordinate, send back nearby parties
app.post('/nearby',function(req,res){
    //get user coordinate from req
    //store in db
});

//start app
app.listen(app.get('port'));

console.log('listening on port '+app.get('port'));
