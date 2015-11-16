var Game = (function(){

    var planets = [],
	user = {
		
		down : false,
		sx:0,sy:0,
		x:0,y:0,
		selected: []
		
	},
	ai, // the current AI class instance
	
	/*
	planetData = [
	    [ // stage 0
		   {x:80,y:400,owner:'p', size:1, upgrades:{economy:5}},
		   {x:550,y:50,owner:'e', size:1},
		   {x:110,y:80, size:1,upgrades:{economy:4}},
		   {x:220,y:80,owner:'p'},
		   {x:110,y:190}
		]
	
	],
	*/
	
	stageData = [
	    { // stage 0
		    factions: 'p,e,n'.split(','), // the faction id's
			ai: 'p,e1,n1', // the faction AI settings
			defaultFaction: 'n',
			
		    planetData : [	           
		        {x:80,y:400,owner:'p', size:1, upgrades:{economy:5}},
		        {x:550,y:50,owner:'e', size:1},
		        {x:110,y:80, size:1,upgrades:{economy:4}},
		        {x:220,y:80,owner:'p'},
		        {x:110,y:190}
	     	    
	        ]
			
			
		},
		
		{ // stage 1
		    factions: 'p,e,n'.split(','), // the faction id's
			ai: 'p,e1,n1', // the faction AI settings
			defaultFaction: 'n',
			
		    planetData : [	           
		        {x:80,y:400,owner:'p', size:0},
				{x:180,y:350,owner:'n', size:0},
				{x:80,y:300,owner:'n', size:0},
		        
				{x:580,y:50,owner:'e', size:0},
	     	    
	        ]
			
			
		}
	]
	
	
	
	
	//factions = {}; // data about all factions including the player are stored here
	factions = [];
	
	
	// Planet Class
	// Values for owner property: n == neutral, p = player, e = enemy
	var Planet = function(arugs){
	    var props = 'x,y,owner,size,startingOre,upgrades'.split(','),
		defaults = [10,15,'n',0,10,{economy:0,sheild:0}],
		i=0,len=props.length,key;
		
		arugs = !arugs ? {} : arugs;
		
		// set values based on arguments object
		while(i< len){
		    
			// if an argument is not given at all set whatever is in defaults
		    if(arugs[props[i]] === undefined){ 
			    this[props[i]] = defaults[i];			
			}else{ // else we have to look at what is given
			
			    // if an object we must check to see if there are any keys that are
				// not given if so set what is in defaults
			    if(typeof defaults[i] === 'object'){
				    this[props[i]] = {};
				    for(key in defaults[i]){
						if(arugs[props[i]][key] === undefined){
							this[props[i]][key] = defaults[i][key];
						
						}else{
						    this[props[i]][key] = arugs[props[i]][key];
						}						
					}
				}else{ // else just set what is given
			        this[props[i]] = arugs[props[i]];
				}
			}
		    i++;
		}
		
		
		// set values that are based on the planets size.
		switch(this.size){
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
		    current:this.startingOre,
			delta:1,
            max: 100,
            returnRate: 5000,
            lastReturn: new Date()			
		};
		
		this.setUpgrades(); // set any starting upgrades
		
	};
	
	
	Planet.prototype={
	    maxSize:1,
		maxUpgrades: 5,
	    step:function(){
		    
			// step ore returns
			if(new Date() - this.ore.lastReturn >= this.ore.returnRate){ 
			    if(this.ore.current < this.ore.max){
			        this.ore.current += this.ore.delta;
			        if(this.ore.current > this.ore.max){
				        this.ore.current = this.ore.max;				
				    }
				}
				this.ore.lastReturn = new Date();
		    }
				
			
		},
		
		// set planet values based on this.upgrades, and this.radius
		setUpgrades:function(){
		    
			// The ore return rate depends on the side of the planet
			// and the setting in this.upgrades.economy
			// here the number 5 in this line is the max number of upgrades
			this.ore.returnRate = 10000 - (1000 / this.maxSize * this.size) - (8500 / this.maxUpgrades * this.upgrades.economy);
			this.ore.max = 100 + (this.size * 50) + this.upgrades.economy * 10;
			
		}
	
	};

	
	var AI = function(factID, AIID){
        this.myFaction = factID;
		this.ai = AIID;
	};
	
	AI.prototype = {
	
	    step : function(){
		
		
		}
	};
	
	
	var Faction = function(factID,AIID){
	    this.id = factID;
		this.totalPlanets=0;
	    this.ai = new AI(factID,AIID);
	};
	Faction.prototype = {
	    countPlanets: function(){
		    var i=0,len=planets.length;
			
			this.totalPlanets=0;
			
			while(i<len){
			    if(planets[i].owner === this.id){
				    this.totalPlanets++;
				
				}
			    i++;			
			}
		}
	
	};
	
	
	
	
	
	
	// set up planets, and starting values for factions
	var setUpStage = function(stage){
	    var p=0,pLen = stageData[stage].planetData.length;
		
		
		planets = [];
		factions = [];
		
		
		
		// set up planets
		while(p<pLen){
			
			planets[p] = new Planet( stageData[stage].planetData[p] );
			
		    p++;
		}
		
		// set up factions
		var f=0,fLen = stageData[stage].factions.length;
		while(f < fLen){
		    factions.push(new Faction(
			        stageData[stage].factions[f],
					stageData[stage].ai[f]
				)				
			);
			factions[f].countPlanets();
			
		    f++;		
		}
		
	};
	
	setUpStage(0);
	
	
    return {
	    planets: planets,
		getUser : function(){return user;},
        step: function(){
 	        var pi=0, pLen = planets.length;
			
			// step planets
			while(pi < pLen){
			    planets[pi].step();
			    pi++;
			}
			
			
	    },
		setStage: function(stageNumber){
		    setUpStage(stageNumber);
		}
	};
	
}());