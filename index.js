//var app = require('express')();
var express=require('express');
var app=express();
var http = require('http').Server(app);
var session = require('express-session');
var io = require('socket.io')(http);
var bodyParser=require('body-parser');
var username;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'ssshhhhh'}));
app.get('/', function(req, res){
  
  res.sendFile(__dirname+'/login.html');
});
app.post('/login',function(req,res){
	console.log("login called");
	
	console.log(req.body.user.name);
	login(req,res);
});

app.get('/instant_chat', function (req, res) {
	
    res.send('<p>Please login first</p><br><p><a href="http://localhost:3100">login</a></p>')
});

app.post('/instant_chat', function (req, res) {
	
    authenticate(req,res);
});




app.get('/logout', function (req, res) {
    delete req.session.user_id;
    res.redirect('/login');
});


function login(req,res){
	var post=req.body;
	//if (post.user.name === 'varun' && post.user.password === 'varun') {
	if (post.user.password === 'makerparty') {
        req.session.user_id = post.user.name;
        //res.redirect('/instant_chat');
        username=req.session.user_id;
        console.log('redirecting to post');
        res.writeHead(307,{'Location':'/instant_chat'});
        res.end();
    }
    else {
        res.send('<p>Bad user/password</p><p><a href="http://localhost:3100">login</a></p>');
    } 
}


function authenticate(req,res){
	console.log("authenticate called");
	if (!req.session.user_id) {
        res.send('You are not authorized to view this page');
    }
    else {
    	console.log(req.session.user_id);
    	res.sendFile(__dirname + '/index.html');

    }
}

function start_chat(){
    console.log("start_chat called");

    


    io.on('connection', function(socket){
      console.log('a user connected');
      console.log(username);
      console.log("socket id:"+socket.id);
      //socket.join(socket.id);
      //console.log(clients);
      



      socket.emit('server_socket_id',{socket_id:socket.id});
      socket.emit('username',username);
      io.emit('user_connected',username+' connected, id:'+socket.id);
      //socket.broadcast.emit('user_connected',username+' connected');
      socket.on('chat message', function(msg){
        
        console.log('message: ' + msg);
        //io.sockets.emit('chat message', msg)
        //io.emit('chat message',msg);
        socket.broadcast.emit('chat message',msg);
      });
      socket.on('disconnect', function(){
          console.log(socket.id+' disconnected');
          io.emit('user_disconnected',socket.id);
      });

    });

}
start_chat();

http.listen(3100, function(){
  console.log('listening on *:3100');
});