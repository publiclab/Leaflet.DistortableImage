var ws = require("ws");
var Response = require("./response");

module.exports = function(app){
	var listen = app.listen;
	var createContext = app.createContext;
	var server = new ws.Server({noServer:true});
	app.listen = function(){
		var server = listen.apply(app,arguments);
		server.on("upgrade",function(req,sock,head){
			server.emit("request",req, new Response(sock,head));
		});
	}
	app.createContext = function(req,res){
		var context = createContext.call(app,req,res);
		context.upgrade = function(){
			return res.upgrade(req);
		}
		return context;
	}
}
