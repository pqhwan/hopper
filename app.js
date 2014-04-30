var express = require('express'),
    colors = require('colors'),
    crypto = require('crypto'),
    fs = require('fs'),
    request = require('request');

var app = express();

//setup database----------------------------------------------------------------
//db connection
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://hopper.db');

//set up tables
fs.readFile('db/activities.sql',function(err,data){
    if(err) throw err;
    else conn.query(data.toString(), function(err,data){
        if(err) throw err;
        console.log('activities table set up');
    });
});

fs.readFile('db/parties.sql',function(err,data){
    if(err) throw err;
    else conn.query(data.toString(), function(err,data){
        if(err) throw err;
        console.log('parties table set up');
    });
});

fs.readFile('db/users.sql',function(err,data){
    if(err) throw err;
    else conn.query(data.toString(), function(err,data){
        if(err) throw err;
        console.log('users table set up');
    });
});


//environment variables-----------------------------------------------------------
app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser('secret'));
//TODO cookie checking middleware
app.use(function(req,res,next){
   next(); 
});

//static page URLs-----------------------------------------------------------------------
app.get('/', function(req,res){
    //if logged in, forward to /nearby
    res.sendfile('index.html');
}); 

app.get('/login',function(req,res){
    //if logged in, forward to /nearby
    res.sendfile('login.html');
});

app.get('/signup',function(req,res){
    //if logged in, forward to /nearby
    res.sendfile('signup.html');
});

app.get('/nearby', function(req,res){
    //if not logged in, forward to /login

    res.sendfile('main.html');
});

app.get('/party/create', function(req,res){
    //if not logged in, forwrad to /login
    res.sendfile('partyform.html');
});

app.get('/party/:id',function(req,res){
    //if not logged in, forward to /login
    res.sendfile('partydetails.html');
});


//Action URLs-------------------------------------------------------------------------

//login url
app.post('/login',function(req,res){
    //hash password
    var pwhash = crypto.createHash('md5').update(req.body.password).digest('hex');

    //prepare query
    var findUserByEmail = 'select * from users where u_email=$1';

    //execute query
    conn.query(findUserByEmail,[req.body.email], function(err,data){
        if(err) throw err;

        //no such login
        if(!data['rowCount']){
            res.send('no such login: <a href="/login">RETRY</a>');
            res.end();
            return;
        }
    
        var row = data['rows'][0];
        if(pwhash === row['u_pw']){
            //set cookie
            console.log('user authenticated--setting cookies'.green);
            res.cookie('u_hash', row['u_hash'], {maxAge:900000,httpOnly:true,signed:true});
            res.cookie('u_name', row['u_name'], {maxAge:900000,httpOnly:true});
            //redirect to /nearby
            res.redirect('/nearby');
        } else {
            //wrong password
            res.send('wrong password: <a href="/login">RETRY</a>');
            res.end();
        }

    });
});


app.post('/signup',function(req,res){
    //derive hash 
    var hash = crypto.createHash('md5').update(req.body.username+req.body.email).digest('hex');
    var pwhash = crypto.createHash('md5').update(req.body.password).digest('hex');

    //prepare query
    var signupQuery = 'insert into users values($1,$2,$3,$4)';
    var params = [hash, req.body.username, req.body.email, pwhash];

    //execute query
    conn.query(signupQuery, params,function(err,data){
            if(err) throw err;
        }
    );
    
    //success--now go log in
    res.redirect('/login');
});

//TODO get coordinate, send back nearby parties
app.post('/nearby',function(req,res){
    //get user coordinate from req
    //var lat = req.body.lat;
    //var lng = req.body.lng;
    var selectPartyQuery = 'select p_coord_x,p_coord_y,p_name,p_description,p_start,p_end,p_upvotes from parties';
    conn.query(selectPartyQuery,function(err,data){
        if(err) throw err;
        //console.log(JSON.stringify(data.rows));
        res.send(JSON.stringify(data.rows));
        res.end();
    });
 
});

app.post('/party/create',function(req,res){
    /*
    console.log(req.body);
    console.log(req.signedCookies.u_hash);
    console.log(req.cookies.u_name);
    console.log(req.body.address.replace('/ /gi', '+'));
    */

    var partyname = req.body.partyname;
    var hostname = req.cookies.u_name;
    var hosthash = req.signedCookies.u_hash;
    var hash = crypto.createHash('md5').update(hosthash+partyname).digest('hex');
    var description = req.body.details;
    var start = req.body.start;
    var end = req.body.end;

    var addressQueryString = req.body.address.replace(/ /gi, '+');
   
    //ask google where this street address is in coordinates
    request('http://maps.googleapis.com/maps/api/geocode/json?address='+addressQueryString+'&sensor=false',function(err,response,body){

        console.log(req.body);
        //unpack response
        var latlng = JSON.parse(response.body).results[0].geometry.location;
        var coordX = latlng.lat;
        var coordY = latlng.lng;
    
        //prepare query
        var partyInsertQuery = "insert into parties values($1,$2,$3,$4,datetime('now','localtime'),$5,$6,$7,$8,$9,0)";
        var params = [hash,hosthash,hostname,partyname,coordX,coordY,description,start,end];

        //execute query
        conn.query(partyInsertQuery,params,function(err,data){
            if(err) throw err;
            res.redirect('/nearby');
        });

    });
    

});

//start app
app.listen(app.get('port'));

console.log('listening on port '+app.get('port'));
