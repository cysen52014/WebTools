var fs = require('fs');
module.exports = function(name,so,callback){
	// var Db = require('tingodb')().Db; 
	// var db = new Db('./db', {});
	// var collection = db.collection("apps_insert_name");
 //    if(so){
	// 	collection.insert({name:na,_id:1}, function(err, result) {
	// 		 //console.log('e',result)
	//          if(!result){
	//          	collection.remove({_id:1}, function(err, result) {
	//                 collection.insert({name:na,_id:1}, function(err, result) {
	//                 	//console.log('v',result)
	//                 })
	//          	})
	//          }
	// 	});
	// }else{
	// 	collection.findOne({_id:1}, function(err, result) {
 //             console.log(result)
	// 	})
	// }
	if(so){
		var json = JSON.stringify(name, null, 4);
		fs.writeFile('./db/apps_insert_name.json',json, function(err) { 
			if (err) {
		       return console.error(err);
		    }
		    if(callback){
		    	callback();
		    }
		})
	}else{
		return JSON.parse(fs.readFileSync('./db/apps_insert_name.json','utf-8'));
	}
	
}

