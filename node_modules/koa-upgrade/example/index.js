var koa = require("koa");
var upgrade = require("../lib");

var app = koa();
upgrade(app);

app.use(function*(){
	var con = yield this.upgrade();
	con.send("hello world!");
})
app.listen(80);
