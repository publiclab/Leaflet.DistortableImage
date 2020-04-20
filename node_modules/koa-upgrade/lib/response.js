var WritableStream = require("stream").Writable;
var statusCodes = require("http-status-codes");
var ws = require("ws");

class Response extends WritableStream{
	constructor(socket,head){
		super();
		this.upgraded = false;
		this.socket = socket;
		this.head = head;
		this.finished = false;
		this.headersSent = false;
		this.headers = {};
		this.statusCode = 200;
		this.statusMessage = undefined;
		this.sendDate = true;

		this.on("finish",function(){
			this._write(null,null,function(){});
			this.finished = true;
		});
	}
	_write(chunk,encoding,callback){
		if(!this.headersSent) this.writeHead(this.statusCode,this.statusMessage,this.headers);
		if(this.upgraded){
			if(this.websocket && !chunk && this.websocket.readyState == ws.OPEN){
				this.websocket.close(this.statusCode == 500 ?1011:1000);
			}
			callback();
		}else{
			if(!chunk){
				this.socket.end(callback);
			}else{
				this.socket.write(chunk,encoding,callback);
			}
		}
	}

	addTrailers(){

	}

	getHeader(name){
		return this.headers[name];
	}

	removeHeader(name){
		if(this.headersSent) throw new Error("Headers have already been sent");
		delete this.headers[name];
	}

	setHeader(name,value){
		if(this.headersSent) throw new Error("Headers have already been sent");
		this.headers[name] = value;
	}

	setTimeout(ms,cb){

	}

	writeContinue(){

	}

	writeHead(code,message,headers){
		if(this.headersSent) throw new Error("Headers have already been sent");
		if(!this.upgraded){
			this.socket.write("HTTP/1.1 "+code+" "+(message||statusCodes.getStatusText(code))+"\r\n");
			for(var header in headers){
				this.socket.write(header+": "+headers[header]+"\r\n");
			}
			this.socket.write("\r\n");
		}
		this.headersSent = true;
	}

	upgrade(req){
		if(this.headersSent) throw new Error("Headers have already been sent");
		this.upgraded = true;
		return new Promise(function(s,f){
			var errorCallback = function(){
				f(new Error("Upgrade failed"));
			}.bind(this);
			this.socket.on("finish",errorCallback);
			new ws.Server({noServer:true}).handleUpgrade(req,this.socket,this.head,function(conn){
				this.socket.removeListener("finish",errorCallback);
				this.websocket = conn;
				s(conn);
			}.bind(this));
		}.bind(this));
	}
}

module.exports = Response;
