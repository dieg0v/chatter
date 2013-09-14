
exports.index = function(req, res){

	/**
	 * test mustache templates
	 */
	var view = {
		title: "Chatter",
		version: function () {
			return '0.1';
		},
		des:"yes, another node.js/socket.io chat example"
	};

	res.render('index', view);

};