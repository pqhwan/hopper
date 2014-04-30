var express = require('express'),
    colors = require('colors'),
    pg = require('pg'),
    crypto = require('crypto');

var dbconn = process.env.DATABASE_URL || "postgress://petehyunsikkim:whatever@localhost/hopper";

//"postgres://petehyunsikkim:bigswigmoney@localhost/nodetest";


//db test run
/*
pg.connect(dbconn,function(err,client,done){
    if(err) console.log(err);
    console.log('connection success');

    client.query({
        text:'select * from users'
    },function(err, result){
        console.log(result);
    });
});
*/

var app = express();

// environment variables
app.set('port', process.env.PORT || 5000);
// use root as a static file folder
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());

/**
 * Page URLs.
 */

app.get('/', function(req,res){
    res.sendfile('index.html');
}); 

app.get('/login',function(req,res){
    res.sendfile('login.html');
});

app.get('/signup',function(req,res){
    res.sendfile('signup.html');
});

app.get('/nearby', function(req,res){
    //console.log(req.cookies.hopperCookie);
    res.sendfile('main.html');
});

app.get('/party/create', function(req,res){
    res.sendfile('partyform.html');
});

app.get('/party/:id',function(req,res){
    res.sendfile('partydetails.html');
});


/**
 * Action URLs.
 */

app.post('/login',function(req,res){
    
    pwhash = crypto.createHash('md5').update(req.body.password).digest('hex');
    console.log(req.body.email);

    pg.connect(dbconn,function(err,client,done){
        if(err) {
            console.log(err);
            return;
        }

        client.query({
            text:'select * from users where u_email=$1',
            values:[req.body.email]
        }, function(err,result){
           if(err){
               console.log(err);
               return;
           }

           if(!result){
                res.redirect('/login');
           }

           if(pwhash === result['rows'][0]['u_pw']){
                res.cookie('hopperCookie',result['rows'][0]['u_hash'],
                    {maxAge:900000,httpOnly:true});
                res.redirect('/nearby');
           }

            
        });

    }); 
});


app.post('/signup',function(req,res){
    pg.connect(dbconn,function(err,client,done){
        if(err){
            console.log(err);
            return;
        }
        //create hashes
        hash = crypto.createHash('md5').update(req.body.username+req.body.email).digest('hex');
        pwhash = crypto.createHash('md5').update(req.body.password).digest('hex');

        client.query({
            text:'insert into users values($1,$2,$3,$4)',
            values:[hash,
            req.body.username,
            req.body.email,
            pwhash
            ]
        },function(err,result){
           if(err) console.log(err);
        });

    });
    res.redirect('/login');
});

//TODO get coordinate, send back nearby parties
app.post('/nearby',function(req,res){
    //get user coordinate from req
    //store in db
});


app.post('/party/create',function(req,res){
    console.log(req.body);

});

//start app
app.listen(app.get('port'));

console.log('listening on port '+app.get('port'));
