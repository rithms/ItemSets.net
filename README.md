# ItemSets.net

**'ItemSets.net'** is a web app that generates item sets based on high elo player item builds from Featured Games.
The app generates item sets by analyzing build orders and categorizing items into 5 item set blocks: **'Starting Items'**, **'Offensive Items'**, **'Defensive Items'**, **'Final Build'**, and **'Consumables'**.

The app allows you to **search** item sets by **queue** (Ranked Solo, ARAM), ranked **tier** (Challenger, Master, Diamond), and even **champion**!

There is even a Summoner Search feature coming soon, allowing you to generate item sets based on your own match history!

For more information, visit the [About Page.](http://itemsets.net/#/about)


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


## Backend


### Datastore Schema

Although MongoDB doesn't enforce schemas, the following schemas were created using Mongoose to store data:

##### Champion Schema ([Source](https://github.com/rithms/ItemSets.net/blob/master/models/champion.js))
- [API Example](http://itemsets.net/api/champions)

##### Item Schema ([Source](https://github.com/rithms/ItemSets.net/blob/master/models/item.js))
- [API Example](http://itemsets.net/api/items)

##### Spell Schema ([Source](https://github.com/rithms/ItemSets.net/blob/master/models/spell.js))
- [API Example](http://itemsets.net/api/spells)

##### Match Schema ([Source](https://github.com/rithms/ItemSets.net/blob/master/models/match.js))
- This Schema is used internally by the server to store matches, and is not  used by the API 

##### Set Schema ([Source](https://github.com/rithms/ItemSets.net/blob/master/models/set.js))
- [API Example](http://itemsets.net/api/featured_sets)

### Riot Module ([Source](https://github.com/rithms/ItemSets.net/blob/master/riot_module/riot.js))
A module was created to make requests to the Riot Games API. The module enforces the rate limit, making sure to respect the appropriate retry-after headers and 429 response code. This module has the following methods:

- **getSummonerByName()**
- **getMatchList()**
- **getMatch()**
- **getChampionData()**
- **getItemData()**
- **getSpellData()**
- **getFeaturedGameData()**

These methods are used by the server to call and store data when needed in the datastore.

### API ([Source](https://github.com/rithms/ItemSets.net/blob/master/routes/api.js))

The front-end of the application communicates with a **API**. This API has consists of the following endpoints, along with some alternate versions to help with pagination.

#### Static Data
**/api/champions** - Get all champion data
**/api/items** - Get all item data
**/api/spells** - Get all spell data

#### Featured Sets
**/api/featured_sets/mode/{matchMode}/tier/{tier}/by-champion/{championId}** - Get featured sets from given matchMode, tier, and champion
**/api/featured_sets/mode/{matchMode}/tier/{tier}** - Get featured sets from given match mode and tier
**/api/featured_sets/mode/{matchMode}** - Get featured sets from given match mode
**/api/featured_sets** - Get all featured sets

These endpoints serve data to the front end.

### Server Details

The server periodically calls the getFeaturedGame() method of the riot module, and stores the matchIds of these featured games.

The server also periodically checks each of the stored matchIds to see if the game has ended yet. When the game ends, the server retrieves the match detail data, and generates and stores an item set. (See [generator.js](https://github.com/rithms/ItemSets.net/blob/master/modules/generator.js))

These item sets are then served to the front-end via the API (See Featured Sets endpoint).
