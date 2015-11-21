var Game = (function () {

	var planets = [],
	user = {

		down : false,
		sx : 0,
		sy : 0,
		x : 0,
		y : 0,
		percent: 0.75, // attack with % of ore
		selected : [],
		
		// is the given planet id in user.selected?
		isSelected : function(id){
			
			var i=0, len = this.selected.length;
			while(i < len){
				
				if(planets[this.selected[i]].id === id){
					
					return true;
					
				}
				
				i++;
			}
			
			return false;
			
		},
		
		removeById : function(id){
			
			var i=0, len = this.selected.length;
			while(i < len){
				
				if(planets[this.selected[i]].id === id){
					
					this.selected.splice(i,1);
					break;
					
				}
				
				i++;
			}
			
		}

	},
	ai, // the current AI class instance

	stageData = [{ // stage 0
			factions : 'p,e,n'.split(','), // the faction id's
			//ai : 'p,e1,n1', // the faction AI settings
			//defaultFaction : 'n',

			planetData : [
			    {id : '1',x : 80,y : 400,owner : 'p',size : 0,upgrades : {economy : 4}}, 
				{id : '2',x : 550,y : 50,owner : 'e',size : 1,upgrades : {economy : 1}}, 
				{id : '3',x : 110,y : 80,owner : 'p',size : 1,upgrades : {economy : 0}},
				{id : '4',x : 220,y : 80,owner : 'p'}, 
				{id : '5',x : 110,y : 190, owner : 'p'},
				
				{id : '6',x : 550,y : 400,owner : 'p',size : 1,upgrades : {economy : 0}},
				{id : '7',x : 500,y : 320,owner : 'p'}, 
				{id : '8',x : 450,y : 400,owner : 'p'},

			]

		},
		{ // stage 1
			factions : 'p,e,n'.split(','), // the faction id's
			ai : 'p,e1,n1', // the faction AI settings
			defaultFaction : 'n',

			planetData : [
			
			    {id:'1',x:80,y:400,owner:'p',size:0},
				{id:'2',x:180,y:350,owner:'n',size:0},
				{id:'3',x:80,y:300,owner:'n',size:0},
				
				{id:'4',x:280,y:400,owner:'n',size:0},
				{id:'5',x:380,y:350,owner:'n',size:0},
				{id:'6',x:280,y:300,owner:'n',size:0},
				
				{id:'7',x:480,y:400,owner:'n',size:0},
				{id:'8',x:580,y:350,owner:'n',size:0},
				{id:'9',x:480,y:300,owner:'n',size:0},
				
				
				{id:'10',x:80,y:200,owner:'n',size:0},
				{id:'11',x:180,y:150,owner:'n',size:0},
				{id:'12',x:80,y:100,owner:'n',size:0},
				
				{id:'13',x:280,y:200,owner:'n',size:0},
				{id:'14',x:380,y:150,owner:'n',size:0},
				{id:'15',x:280,y:100,owner:'n',size:0},
				
				{id:'16',x:480,y:200,owner:'n',size:0},
				{id:'17',x:580,y:150,owner:'n',size:0},
				{id:'18',x:480,y:100,owner:'n',size:0},
				
				{id:'19',x:580,y:50,owner:'e',size:0}

			]

		}
	],

	
	AI = {
		
		best : { // the ai's best planet
		
			index: 0,
			ore:0
			
		},
		
		weakest:{},    // the players weakest planet
		targets: [],   // the planets that the ai can attack
		breakDown: {}, // how many planets each faction controls
		totalForce:0,		
		lastAction: new Date(), // the last time the ai made and attack or upgrade
		actionRate: 1000,
		aggression: 1,
		
		// what the AI is to do on each frame tick
		step : function(){
			
			// make sure that total force is updated
			this.totalForce = this.findTotalForce('e');
			
			this.findTargets();
			
			// find best AI planet, and weakest non-AI planet
			this.findBest();
			this.findWeakest();
			this.setAggression();
			
			
			this.takeAction();
			
		},
		
		takeAction : function(){
			
			var roll, attackChance;
			
			// set actionRate based on aggresion
			this.actionRate = 10000 - 10000 * ((this.aggression + 1)/2);
			
			// if enough time has passed sense last action the ai might do something
			if(new Date() - this.lastAction >= this.actionRate){
			
			    // attack, upgrade, or do nothing
				
			    // if there is one or more targets then the ai can attack
			    if(this.targets.length > 0){
		
		            // however just because the AI can attack does not mean that it will attack, chance of attack depends on aggression
		            //attackChance = ((this.aggression + 1)/2);
					roll = Math.random();
					
                    // if aggression is greather than 0
				    //if(this.aggression > 0){
			        if(roll < this.aggression){
				   
				        var plIndex = this.targets[Math.floor(Math.random()* this.targets.length)];
			            this.allOutAttack(plIndex);
			   
				    }else{
					
					    // focus more on upgrading if even number of planets or if the ai is winning
					
					
				    }
			
			    }
				
				this.lastAction = new Date();
			
			}
			
		},
		
		// set aggression based on number of planets the player has
		setAggression : function(){
			
			var oreAggression = this.findTotalForce('e') / (this.findTotalForce('e') + this.findTotalForce('p')),
			
			planetAggression = this.breakDown['p'] / (this.breakDown['e'] + this.breakDown['p']);
			
			// aggression based on ai ore
			this.aggression = planetAggression * 0.7 + oreAggression * 0.3;
			
			console.log(this.aggression);
			
		},
		
		// find a bunch of planets that the AI could take over
		findTargets : function(){
			
			var p=0, pLen = planets.length;
			
			this.targets = [];
			this.breakDown = {n:0,p:0,e:0};
			
			while(p < pLen){
						
				this.breakDown[planets[p].owner] = this.breakDown[planets[p].owner] === undefined ? 1 :  ++this.breakDown[planets[p].owner];
						
				if(planets[p].owner !== 'e'){
					
					if(this.totalForce > planets[p].ore.current){
            
						this.targets.push(p);
						
					}
					
				}
				
				p++;
			}
			
		},
		
		// find the total ore value of all planets under AI control or the given faction
		findTotalForce : function(faction){
			
			var p =0, pLen = planets.length, totalForce = 0;;
			
			faction = faction === undefined ? 'e' : faction;
			
			//this.totalForce = 0;
			
			// find total force
			while(p < pLen){
				
				if(planets[p].owner === faction){
					
					totalForce += planets[p].ore.current;
					
				}
				
				
				p++;
			}
			
			return totalForce;
			
			
			
		},
		
		// find best AI Planet
		findBest : function(){
		    
			var p=0, pLen = planets.length;
			
			
			this.best = {
				index : 0,
				ore : 0
			};
			
			while(p < pLen){
				
				if(planets[p].owner === 'e'){
					
					if(planets[p].ore.current > this.best.ore){
					
                        this.best.index = p;
                        this.best.ore = planets[p].ore.current;						
						
					}
					
				}
				
				p++;
			}
			
			
		},
		
		// find weakest AI planet
		findWeakest : function(){
			
			var p=0, pLen = planets.length;
			this.weakest = {
				index : 0,
				ore : Infinity
			};
			
			while(p < pLen){
				
				if(planets[p].owner !== 'e'){
					
					if(planets[p].ore.current < this.weakest.ore){
					
                        this.weakest.index = p;
                        this.weakest.ore = planets[p].ore.current;						
						
					}
					
				}
				
				p++;
			}
			
		},
		
		attackWeakestWithBest : function(){
			
			var targetPL = planets[this.weakest.index],
			bestPL = planets[this.best.index];
			// AI will attack weakest
			if(this.best.ore > this.weakest.ore){
				
				targetPL.ore.current -= bestPL.ore.current;
				bestPL.ore.current -= bestPL.ore.current;
				
				if(targetPL.ore.current <= 0 ){
					
					targetPL.owner = 'e';
					
				}
			
			    targetPL.ore.current = Math.abs(targetPL.ore.current);
				
			}
			
		},
		
		allOutAttack : function(targetIndex){
			
			var p = 0, pLen = planets.length,
			targetPl;

			targetIndex = targetIndex === undefined ? this.weakest.index : targetIndex;
			
			targetPl = planets[targetIndex];
			
			// if total force > weakest launch all out attack
			if(this.totalForce > this.weakest.ore){
				
				p = 0; pLen = planets.length;
			    while(p < pLen){
				
				    if(planets[p].owner === 'e'){
					
					    planets[p].ore.current = 0;
					    
				    }
				
				
				    p++;
			    }
				
				targetPl.ore.current -= this.totalForce;
				if(targetPl.ore.current <=0){
					
					if(user.isSelected(targetPl.id)){
						
						user.removeById(targetPl.id);
						
					}
					
					targetPl.owner = 'e';
					
				}
				targetPl.ore.current = Math.abs(targetPl.ore.current);
			}
			
		}
		
	},
	
	// Planet Class
	// Values for owner property: n == neutral, p = player, e = enemy
	Planet = function (arugs) {
		var props = 'id,x,y,owner,size,startingOre,upgrades'.split(','),
		defaults = ['none', 10, 15, 'n', 0, 10, {
				economy : 0,
				sheild : 0
			}
		],
		i = 0,
		len = props.length,
		key;

		arugs = !arugs ? {}

		 : arugs;

		// set values based on arguments object
		while (i < len) {

			// if an argument is not given at all set whatever is in defaults
			if (arugs[props[i]] === undefined) {
				this[props[i]] = defaults[i];
			} else { // else we have to look at what is given

				// if an object we must check to see if there are any keys that are
				// not given if so set what is in defaults
				if (typeof defaults[i] === 'object') {
					this[props[i]] = {};
					for (key in defaults[i]) {
						if (arugs[props[i]][key] === undefined) {
							this[props[i]][key] = defaults[i][key];

						} else {
							this[props[i]][key] = arugs[props[i]][key];
						}
					}
				} else { // else just set what is given
					this[props[i]] = arugs[props[i]];
				}
			}
			i++;
		}

		// set values that are based on the planets size.
		switch (this.size) {
		case 0:
			this.radius = 20;
			break;

		case 1:
			this.radius = 35;

			break;

		default:
			this.radius = 5;
			break;
		}

		this.ore = {
			current : this.startingOre,
			delta : 1,
			max : 100,
			returnRate : 3000,
			lastReturn : new Date()
		};

		this.setUpgrades(); // set any starting upgrades

	};

	Planet.prototype = {
		maxSize : 1,
		maxUpgrades : 5,
		step : function () {

			// step ore returns
			if (new Date() - this.ore.lastReturn >= this.ore.returnRate) {
				
				if(this.owner !== 'n'){
				    if (this.ore.current < this.ore.max) {
					    this.ore.current += this.ore.delta;
					    if (this.ore.current > this.ore.max) {
						    this.ore.current = this.ore.max;
					    }
				    }
				}
				
				this.ore.lastReturn = new Date();
			}

		},

		// set planet values based on this.upgrades, and this.radius
		setUpgrades : function () {

			// The ore return rate depends on the side of the planet
			// and the setting in this.upgrades.economy
			// here the number 5 in this line is the max number of upgrades
			//this.ore.returnRate = 10000 - (1000 / this.maxSize * this.size) - (8500 / this.maxUpgrades * this.upgrades.economy);
			this.ore.returnRate = 3000 - (1500 / this.maxSize * this.size) - (1500 / this.maxUpgrades * this.upgrades.economy);
			this.ore.max = 100 + (this.size * 50) + this.upgrades.economy * 10;

		}

	};

	// set up planets, and starting values for factions
	var setUpStage = function (stage) {
		var p = 0,
		pLen = stageData[stage].planetData.length;

		planets = [];

		// set up planets
		while (p < pLen) {

			planets[p] = new Planet(stageData[stage].planetData[p]);

			p++;
		}

		
	};

	setUpStage(1);

	return {
		planets : planets,
        user : user,
		
		step : function () {
			
			var pi = 0,
			pLen = planets.length;

			// step planets
			while (pi < pLen) {
				planets[pi].step();
				pi++;
			}
			
			// stepAI
			AI.step();
			
			
		},
		setStage : function (stageNumber) {
			
			setUpStage(stageNumber);
			
		},

		playerAttack : function (targetIndex) {

			//var targetPlanet = planets[targetIndex],
			var targetPlanet,
			i,
			len,
			planet;

			// is one or more planet selected?
			if (user.selected.length >= 1) {

				// reseased over a planet?
				p = 0;
				pLen = planets.length;
				while (p < pLen) {

				    // if a planet is found that is the target
					if (api.distance(user.x, user.y, planets[p].x, planets[p].y) <= planets[p].radius) {

						targetPlanet = planets[p];

						// if the planet is the players the missles send help
						if (targetPlanet.owner === 'p') {

							i = 0;
							len = user.selected.length;
							while (i < len) {

								planet = planets[user.selected[i]];

								if (planet.id !== targetPlanet.id) {

									targetPlanet.ore.current += Math.floor(planet.ore.current * user.percent);
									planet.ore.current -= Math.floor(planet.ore.current * user.percent);

								}
								i++;
							}

						// else the player is attacking
						} else {

							i = 0;
							len = user.selected.length;
							while (i < len) {

								planet = planets[user.selected[i]];

								if (planet.id !== targetPlanet.id) {

									targetPlanet.ore.current -= Math.floor(planet.ore.current * user.percent);
									planet.ore.current -= Math.floor(planet.ore.current * user.percent);

								}
								
								i++;
							}
							
							if (targetPlanet.ore.current <= 0) {

								targetPlanet.owner = 'p';
								targetPlanet.ore.current = Math.abs(targetPlanet.ore.current);
							
							}
						}

						break;

					}

					p++;
				}

			}

		}
	};

}
	());
