var PORT = 80;
var webroot = './webroot::80';

var http = require('http');
var url=require('url');
var fs=require('fs');
var mine=require('./mine').types;
var path=require('path');
var rl=require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt('设置web目录和端口（留空则默认 ./webroot::80 ）>');
rl.prompt();
rl.on('line', function (str) {
	str = str.trim();
	if(str){
		
		webroot = str;
	}
	
	var  pathArr = webroot.split('::');
	webroot = pathArr[0];
	PORT = pathArr[1];
		
	cServer();
	
	
});


	
	function cServer(){

	var server = http.createServer(function (request, response) {
		request.setEncoding('utf8');
		
		var pathname = url.parse( decodeURI(request.url)).pathname;
		var realPath = path.join(webroot, pathname);
		//console.log(realPath);
		var ext = path.extname(realPath);
		ext = ext ? ext.slice(1) : 'unknown';
		fs.exists(realPath, function (exists) {
			if (!exists) {
				response.writeHead(404, {
					'Content-Type': 'text/plain'
				});

				response.write("This request URL " + pathname + " was not found on this server.");
				response.end();
			} else {
				
				//判断文件 或 目录
				fs.stat(realPath, function(err,stats){
					
					if(stats.isFile()){	//文件
						fs.readFile(realPath, "binary", function (err, file) {
							if (err) {
								response.writeHead(500, {
									'Content-Type': 'text/plain'
								});
								response.end(err);
							} else {
								var contentType = mine[ext] || "application/octet-stream";
								response.writeHead(200, {
									'Content-Type': contentType
								});
								response.write(file, "binary");
								response.end();
							}
						});
					}else if(stats.isDirectory()){
						
						fs.readdir(realPath, function(err,files){
							
							var contentType = mine['html'] || "text/plain";
								response.writeHead(200, {
									'Content-Type': contentType
								});
								
							for(var i in files){
								var u = url.format(url.parse(path.join( pathname,files[i])));
								response.write('<a href="'+u+'">'+files[i]+'</a><br>');
							}
							response.end();
						});
					}
					
				});
				
				
			}
		});
	});
	server.listen(PORT);
	
	console.log("port: " + PORT + ".");
	console.log("webroot: " + webroot + ".");
}