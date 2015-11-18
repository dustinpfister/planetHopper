(function(){
	
	var canvas = Viewer.getCanvas(),
	planets = Game.planets,
	user = Game.getUser(),
	
	getMousePos = function(e){
		
		var box = e.target.getBoundingClientRect();
		
		e.preventDefault();
		
		return {
			
			x : e.clientX - box.left,
            y :	e.clientY - box.top		
			
		};
		
	};
	
	canvas.addEventListener('mousedown', function(e){
		
		var pos = getMousePos(e);
		
		
		
		var i=0,len = planets.length;
		
		user.selected = [];
		while(i < len){
			
			if(planets[i].owner === 'p'){
			
			if( api.distance(pos.x,pos.y,planets[i].x, planets[i].y) <= planets[i].radius ){
				
		        user.down = true;
		        user.sx = pos.x;
		        user.sy = pos.y;		
				user.x = pos.x;
		        user.y = pos.y;
				
				user.selected.push(i); 
				
				break;
			}
			
			}
			
			i++;
		}
		
		
	});
	
	canvas.addEventListener('mousemove', function(e){
		
		var pos = getMousePos(e),p,pLen,s,sLen;
		
		if(user.down){
			
			user.x = pos.x;
			user.y = pos.y;
			
			p=0; pLen = planets.length;
			planetLoop:while(p < pLen){
				
				if(planets[p].owner === 'p'){
					
					s=0, sLen = user.selected.length;
					
					while(s < sLen){
						
						if(user.selected[s] === p){
							
							p++;
							continue planetLoop;
						}
						
						s++;
					}
					
				    if( api.distance(pos.x,pos.y,planets[p].x, planets[p].y) <= planets[p].radius ){
					
						user.selected.push(p);
					
				    }
					
				}
				
				p++;
			}
			
		}
	});
	
	canvas.addEventListener('mouseup', function(e){
		
		
		Game.playerAttack();
		
		
		user.down = false;
		
	});
	
	
	
}());