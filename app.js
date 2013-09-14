
var users = [];

var express = require('express');
var path = require('path');
var cons = require('consolidate');

var routes = require('./routes');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

app.engine('html', cons.mustache);
app.set('view engine', 'html');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your-secret-here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var io = require('socket.io').listen(app.listen( app.get('port')));

io.sockets.on('connection', function (socket) {

    socket.on('new', function (data ) {

        var user = {};
        user.username = data.username;
        user.socket  = socket.id;
        users.push(user);

        io.sockets.emit('login', { username: user.username });
        io.sockets.emit('users', { users:users });

        user = null;

    });

    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });

    socket.on('disconnect', function () {
        for(var i=0;i<users.length;i++){
            if(users[i].socket == socket.id){
                socket.broadcast.emit('logout',{ username:users[i].username });
                users.splice(i,1);
                socket.broadcast.emit('users',{ users:users });
                break;
            }
        }
    });

});
