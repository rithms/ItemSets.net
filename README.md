# ItemSets.net

## Demo
The web app can be found here:
http://itemsets.net

## Tech

"ItemSets.net" was developed with the following tech stack (MEAN):

* [Digital Ocean](https://www.digitalocean.com/?refcode=487c619b6f74) - SSD Cloud Server/Hosting
* [MongoDB](https://api.mongodb.org/) - Open-source document/NoSQL database
* [Mongoose](http://mongoosejs.com/docs/) - MongoDB object modeling for Node.js
* [Node.js](https://nodejs.org/) -  Runtime environment for server-side and networking Javascript applications
* [Express.js](http://expressjs.com/) -  Node.js web application server framework
* [AngularJS](https://angularjs.org/) - JavaScript MVW Framework
* [Bootstrap](http://getbootstrap.com/) - Front-end framework for modern web apps
* [jQuery](https://jquery.com/) - Cross-platform Javascript library
* [Riot Games API](https://developer.riotgames.com/) - League of Legends game data

## Setup

Clone the repo and cd in.
```bash
cd ItemSets.net
```

To run the project locally, you will need to install the following dependencies:

MongoDB, Node.js/npm, Express.js

If you are using Ubuntu, before you install anything run:
```bash
sudo apt-get update
```

### MongoDB

##### Install

###### OSX:
```bash
sudo brew install mongodb
```

###### Ubuntu:
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get install -y mongodb-org
```

##### Run
If it isn't already running, start mongodb.
```bash
sudo service mongod start
```

### Node.js and npm

##### Install

###### OSX:
```bash
sudo brew install node
```

###### Ubuntu:
```bash
sudo apt-get install nodejs
sudo apt-get install npm
```

### Express.js

##### Install
```bash
npm install -g express
```

### Node Modules
In the **ItemSets.net** repository root directory install all the node_module dependencies by running:

###### OSX and Ubuntu:
```bash
npm install
```
Other dependencies, such as AngularJS, Bootstrap, jQuery, etc. are downloaded via a CDN, so you don't have to worry about them.

### Run Server
###### OSX:
```bash
node server.js
```

###### Ubuntu:
```bash
nodejs server.js
```

The server will be running at http://localhost:3000

### Setup API Key

Before running the server, you will need to add your own API Key to the project.
In the file [riot_module/riot.js](https://github.com/rithms/ItemSets.net/blob/master/riot_module/riot.js), add your key to the following line:
```bash
var	key = "API-KEY-HERE";
```
