var fs = require('fs');
var path = require('path');
var S = require("./Db");
// 创建所有目录
var config = {
    files:[
        {
            name: "css",
            type: "dir"
        },
        {
            name: "fonts",
            type: "dir"
        },
        {
            name: "js",
            type: "dir"
        },
        {
            name: "images",
            type: "dir"
        },
        {
            name: "index.html",
            type: "file",
            content : '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Title</title>\n  <link rel="stylesheet" href="css/style.min.css">\n</head>\n<body>\n  <script src="js/main.min.js" type="text/javascript"></script>\n</body>\n</html>'
        }
    ]
};

function getInFiles(dirpath,callback) {
    for (var i = 0; i <= config.files.length - 1; i++) {
        var file = dirpath + "/" +config.files[i].name;
        switch(config.files[i].type){
            case "dir":
                if(config.files[i].name == "css"){
                    var style = file + "/style.css"; 
                    var img =  file + "/img";
                    fs.mkdir(file, 0777, function(){ 
                        fs.mkdirSync(img);
                        fs.readFile('./gulp/b-css.txt','utf-8',function(err,data){
                            if(err){ 
                              console.log(err); 
                            }else{ 
                              fs.writeFileSync(style,data,"utf-8");
                            }   
                        })
                    });   
                }else if(config.files[i].name == "js"){
                    var js = file + "/main.js";
                    fs.mkdir(file, 0777, function(){ 
                        fs.writeFileSync(js,'"use strict"',"utf-8");
                    });   
                }else{
                    fs.mkdirSync(file);
                }
                break;
            case "file":
                fs.writeFileSync(file,config.files[i].content,"utf-8");
                break;
            default:
                break;
        }
        if(i==config.files.length - 1){
            callback(true);
        }
    }

    
}

var mkdirs = module.exports = function(dirpath, mode, callback) {
    var file = 'project/'+dirpath;
    fs.exists(file, function(exists) {
        if(exists) {
                callback(true);
        } else {
                fs.mkdir('project', mode, function(){
                    fs.mkdir(file, mode, function(){
                        getInFiles(file,callback)
                    });
                });
                
                var data = {
                    "name" : dirpath
                }
                
                S(data,true);
        }
    });
};