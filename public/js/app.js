
var server = 'http://localhost:3000';
var username;
var messages = [];
var socket;
var messages_client_limit = 50;

var lang = {
    nickname: 'Please enter your nickname',
    offline: 'Offline',
    connected: 'Connected',
    servererror: 'Server Error...disconnected from server'
};

var chat;
var content;
var header;
var userslist;
var footer;

$(function() {

    chat        = $('#chat');
    content     = $('#content');
    header      = $('#header');
    userslist   = $('#users');
    footer      = $('#footer');

    $.get('/js/templates.html', function(templates) {
        $('body').append(templates);
    });

    $('#field').val('');

    $('#connectBtn').click(function(event) {

        event.stopPropagation();
        event.preventDefault();

        bootbox.prompt({
            title: lang.nickname,
            callback: function(result) {
                if (result === null) {
                    return;
                } else {
                    if ($.trim(result) === '') {
                        return;
                    }
                    connect(result);
                }
            }
        });

    });

});


function connect(name) {

    username = name;
    chat.show();

    $('#disconnectBtn').show();
    $('#connectBtn').hide();

    $(window).resize(function() {
        updateChatView();
    });

    updateChatView();

    socket = io.connect(server);

    socket.emit('new', {
        username: username
    });

    socket.on('message', function(data) {
        data.classname = 'message';
        updateChat(data);
    });

    socket.on('login', function(data) {
        data.message = lang.connected;
        data.classname = 'connected';
        updateChat(data);
    });

    socket.on('users', function(data) {
        userslist.html( Mustache.render( $('#users-list').html() , data ) );
    });

    socket.on('logout', function(data) {
        data.message = lang.offline;
        data.classname = 'offline';
        updateChat(data);
    });

    socket.on('disconnect', function(data) {
        bootbox.alert(lang.servererror);
    });

    $("#field").keyup(function(e) {
        if (e.keyCode == 13) {
            sendMessage();
        }
    });

}

function sendMessage() {
    var text = field.value;
    if ($.trim(text) !== '') {
        $('#field').val('');
        socket.emit('send', {
            message: text,
            username: username
        });
    }
}

function updateChat(data) {
    messages.push(data);
    if (messages.length > messages_client_limit) {
        messages.splice(0, 1);
    }
    content.html( Mustache.render( $('#messages-list').html() , { messages:messages }) );
    scrollchat();
}

function updateChatView() {
    var margin = 50;
    content.height($(window).height() - header.height() - footer.height() - margin);
    userslist.height($(window).height() - header.height() - footer.height() - (margin * 1.8));
    scrollchat();
}

function scrollchat(){
    content.scrollTop(content[0].scrollHeight);
}


