koa-upgrade
===========

Allow koa to handle websockets like regular requests

- use any middleware (including routers, compression, etc.) for normal & upgrade requests
- upgrade to a websocket at any point in your app
- auto close websockets at the end of the chain or in case of an uncaught error

how it works
------------
Since node's http-server `upgrade` - event does not emit a response object as is the case for the `request` - event, koa-upgrade mimicks one that behaves exalty like a normal response object. This allows koa to handle the upgrade request like any other request & send a response just like always. So, in theory, any middleware should work the same for normal & upgrade requests.

The only difference to regular requests is, that you are able to upgrade them to a WebSocket at any point in your middleware chain. As soon as you have done that, writes to the responses body will be ignored, and you have to write to the websocket instead. Additionally, the websockets gets automatically closed when your request is done, or some uncaught errors occoured.

The cool thing is, that it's up to you if you want to threat an upgrade request like any other request, or if & when you want to upgrade to a WebSocket.

why not koa-websocket
---------------------
The main problem with koa-websocket is, that you have 2 separate middleware chains for regular requests & upgrade requests.
If you want to use a middleware in both chains, you have to do it twice. This can become pretty messy in large chains.
So in contrast to koa-websocket, koa-upgrade does not threat upgrade requests completely different to regular requests. Instead, if you want a specific request to be handled differently, you'd have to do it manually in the middleware.

usage
-----

First, install koa-upgrade to your app

```
var koa = require("koa");
var upgrade = require("koa-upgrade");

var app = koa();
upgrade(app);
```

From now on, you can call `upgrade()` on the context.

```
app.use(function*(){
	if(this.get("Connection") == "Upgrade"){
		var connection = yield this.upgrade();
		connection.send("Hello World!");
	}else{
		this.status = 400;
		this.body = "A upgrade request was expected";
	}
})
```
