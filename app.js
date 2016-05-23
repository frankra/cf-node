
var cfenv = require('cfenv');
var express = require('express');
var app	= express();
var appEnv = cfenv.getAppEnv();
var mongodb = require('mongodb');
var bodyparser = require('body-parser');
var mongoConnectionURL;

function getMongoConnectionURL(){
	var credentials;
	//Determine credentials from CF environment
	if(process.env.VCAP_SERVICES){
		var env = JSON.parse(process.env.VCAP_SERVICES);
		console.log(env)
	  credentials = env['mongodb'][0]['credentials'];
		console.log(credentials)
	}
	else{
	  credentials = {
	    hostname:"localhost",
	    port:27017,
	    username:"",
	    password:"",
	    name:"",
	    db:""
	  }
	}

  credentials.hostname = (credentials.hostname || 'localhost');
  credentials.port = (credentials.port || 27017);
  credentials.db = (credentials.db || 'test');

  if(credentials.username && credentials.password){
    return credentials.uri;
  }
  else{
    return "mongodb://" + credentials.hostname + ":" + credentials.port + "/" + credentials.db;
  }
}

mongoConnectionURL = getMongoConnectionURL();

//Configure Applcation=================
app.use(express.static(process.cwd() + '/ui/'));
app.use(bodyparser.json()); // to support JSON-encoded bodies
app.use(bodyparser.urlencoded({// to support URL-encoded bodies
	extended: true
}));

//services
app.get('/api/Messages',function(req,res){
	mongodb.connect(mongoConnectionURL).then(function(conn){
		return conn.collection('Messages');
	}).then(function(messagesCollection){
		if (messagesCollection){
			return messagesCollection.find({},{sort:[['date','desc']]});
		}
	}).then(function(cursor){
		return cursor.toArray();
	}).then(function(aMessages){
		res.send(aMessages);
	}).catch(function(error){
		console.log('Catched error: ', error.stack);
		res.status(500).send();
	});
});

app.post('/api/Messages',function(req,res){
	mongodb.connect(mongoConnectionURL).then(function(conn){
		return conn.collection('Messages');
	}).then(function(messagesCollection){
		if (messagesCollection){
			return messagesCollection.insert({
				text: req.body.text,
				date: Date.now()
			});
		}
	}).then(function(sth){
		res.send(sth);

	}).catch(function(error){
		console.log('Error catched', error);
		res.status(500).send();
	});
});

app.put('/api/Messages/:id',function(req,res){
	res.send({test:true});
});

app.delete('/api/Messages/:id',function(req,res){
	mongodb.connect(mongoConnectionURL).then(function(conn){
		return conn.collection('Messages');
	}).then(function(messagesCollection){
		if (messagesCollection){
			return messagesCollection.remove({
				_id: req.params.id
			});
		}
	}).then(function(removedMessage){
		if (removedMessage){
			res.status(200).send();
		}else {
			res.status(404).send();
		}
	}).catch(function(error){
		res.status(500).send();
	});
});
//Start Application====================
app.listen(appEnv.port, appEnv.bind,  function() {
  console.log("server starting on " + appEnv.url)
});
