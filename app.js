var express = require('express'),
    colors = require('colors'),
    crypto = require('crypto'),
    fs = require('fs'),
    request = require('request');
    engines = require('consolidate');

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
app.engine('html',engines.hogan);
app.set('views',__dirname);
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
    //TODO if logged in, forward to /nearby
    res.sendfile('index.html');
}); 

app.get('/login',function(req,res){
    //TODO if logged in, forward to /nearby
    res.sendfile('login.html');
});

app.get('/profile/:id',function(req,res){
    res.sendfile('userprofile.html');
});

app.get('/signup',function(req,res){
    //TODO if logged in, forward to /nearby
    res.sendfile('signup.html');
});

app.get('/nearby', function(req,res){
    //TODO if not logged in, forward to /login
    res.sendfile('main.html');
});

app.get('/party/create', function(req,res){
    //TODO if not logged in, forwrad to /login
    res.sendfile('partyform.html');
});

app.get('/party/:id',function(req,res){
    //TODO if not logged in, forward to /login
    var partySelectQuery = 'select p_name, p_hostname, p_description, p_streetaddress, p_start, p_end from parties where p_hash=$1';
    var params = [req.params.id];

    conn.query(partySelectQuery, params, function(err,data){
        if(err) throw err; //no data, constraint violation?

        if(!data['rowCount']){
            res.send('no such party: <a href="/nearby">RETRY</a>');
            res.end();
            return;
        }

        var row = data['rows'][0];

        //test how start and end are printed
        //console.log('start: ' + row.p_start + ' end: '+row.p_end);
        
        res.render('partyprofile.html',{
            partyname:row.p_name,
            hostname:row.p_hostname,
            description:row.p_description,
            streetaddress:row.p_streetaddress,
            start: row.p_start,
            end: row.p_end
        });
    });

});


//Action URLs-------------------------------------------------------------------------

app.get('/party/activities/:id',function(req,res){
    var findActivitiesByParty = 'select * from activities where a_partyhash=$1';
    var params = [req.params.id];
    conn.query(findActivitiesByParty,params,function(err,data){
        if(err) throw err; 

        if(!data.rowCount){
            res.send('[]');
            res.end();
        }

        var rows = JSON.stringify(data.rows);
        res.send(rows);
        res.end();
    });
});


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
            if(err){
                throw err;
            } else {
                //signup success--> now go log yourself in
                res.redirect('/login');
            }
            
        }
    );
});

//TODO get coordinate, send back nearby parties
app.post('/nearby',function(req,res){
    //get user coordinate from req
    
    var selectPartyQuery = 'select p_coord_x, p_coord_y, p_name, p_description, p_start, p_end, p_upvotes, p_hash from parties';
    conn.query(selectPartyQuery,function(err,data){
        if(err) throw err;
        //console.log(JSON.stringify(data.rows));
        res.send(JSON.stringify(data.rows));
        res.end();
    });
 
});

//party upvoted! 
//1. increment upvotemeter
//2. register activity
app.get('/party/upvote/:id',function(req,res){
    //get upvoter credentials
    var username = req.cookies.u_name;
    var userhash = req.signedCookies.u_hash;

    //increment upvotes
    var incrementQuery = "update parties set p_upvotes=p_upvotes+1 where p_hash=$1";
    var param = [req.params.id];
    conn.query(incrementQuery, param,function(err,data){
        if(err) throw err;
    });

    var nameQuery = "select p_name from parties where p_hash=$1";
    conn.query(nameQuery,[req.params.id],function(err,data){
        var partyname = data.rows[0].p_name;
        var insertActivityQuery = "insert into activities values(datetime('now','localtime'), $1, $2, $3, $4,$5,'')";
        var params = [userhash,username,0,req.params.id,partyname];
        conn.query(insertActivityQuery, params,function(err,data){
            if(err) throw  err;
        });
    });

    res.end();
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
    var partyhash = crypto.createHash('md5').update(hosthash+partyname).digest('hex');
    var description = req.body.details;
    var start = req.body.start;
    var end = req.body.end;
    var streetAddress = req.body.address;
    var addressQueryString = req.body.address.replace(/ /gi, '+');
   
    //get the coordinate and store the party
    request('http://maps.googleapis.com/maps/api/geocode/json?address='+addressQueryString+'&sensor=false',function(err,response,body){

        console.log(req.body);
        //unpack response
        var latlng = JSON.parse(response.body).results[0].geometry.location;
        var coordX = latlng.lat;
        var coordY = latlng.lng;
    
        //prepare query
        var partyInsertQuery = "insert into parties values($1,$2,$3,$4,datetime('now','localtime'),$5,$6,$7,$8,$9,$10,0)";
        var params = [partyhash,hosthash,hostname,partyname,coordX,coordY,description,streetAddress, start,end];

        //execute query
        conn.query(partyInsertQuery,params,function(err,data){
            if(err){
            //error message
                res.send('Redundnat party: <a href="/party/create">RETRY</a>');
                res.end();
                return;
            }
            res.redirect('/nearby');
        });

    });

    //register party creation as an activity
    var insertActivityQuery = "insert into activities values(datetime('now','localtime'), $1, $2, $3, $4,$5,'')";
    var params = [hosthash,hostname,1,partyhash,partyname];
    conn.query(insertActivityQuery,params,function(err,data){
        if(err) throw err;
    });
});

//start app
app.listen(app.get('port'));

console.log('listening on port '+app.get('port'));
