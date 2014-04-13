//Get dependenies

var express = require('express'),
    colors = require('colors');

var app = express();

// environment variables
app.set('port', process.env.PORT || 3000);
//app.use(express.favicon());
//app.use(express.methodOverride());
//app.use(app.router);


/**
 * Page URLs.
 */

//TODO send back splash page
app.get('/',function(req,res){
    res.send('Login page');
}); 

//TODO
app.get('/signup',function(req,res){
    res.send('Signup page');    
}); //send back signup page



/**
 * Action URLs.
 */
app.post('/signup');

//start app
app.listen(app.get('port'));
