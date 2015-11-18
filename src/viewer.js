var Viewer = (function(){
    var canvas = document.createElement('canvas'),
	context = canvas.getContext('2d'),
	user = Game.getUser(),
	planets = Game.planets;
	
	canvas.width=640;
	canvas.height=480;
	
	var clear = function(){
	    context.fillStyle='#000000';
	    context.fillRect(0,0,canvas.width,canvas.height);
	};
	
	var renderPlanets = function(){
	    var pl = Game.planets;
		var i = 0,len=pl.length;
		
		while(i<len){
		    switch(pl[i].owner){
			    case 'p':
				    context.strokeStyle='#00ff00';
				break;
				case 'e':
				    context.strokeStyle='#ff0000';
				break;
				default:
				    context.strokeStyle='#ffffff';
				break;
			}
				
		    context.beginPath();
			context.arc(pl[i].x,pl[i].y,pl[i].radius,0,Math.PI*2);
			context.closePath();
		    context.stroke();
		    
		    i++;
		}
		
	};
	
	var renderOreCounts = function(){
	    var pl = Game.planets;
		var i = 0,len=pl.length;
		
		context.fillStyle='#ffffff';
		context.textAlign='center';
		context.textBaseline='middle';
		context.font = '15px courier';
		
		while(i<len){
		    
			context.fillText(pl[i].ore.current,pl[i].x,pl[i].y);
			context.fillText(pl[i].ore.returnRate,pl[i].x,pl[i].y+20);
			
		    i++;
		}
	},
	renderAttackLines = function(ctx){
		
		var i, len;
		
		if(user.down){
			
			ctx.strokeStyle = '#ffffff';
			
			i=0; len = user.selected.length;
			while(i < len){
				
			    ctx.beginPath();
			    ctx.moveTo(planets[ user.selected[i] ].x, planets[ user.selected[i] ].y);
			    ctx.lineTo(user.x,user.y);
			    ctx.stroke();
				
				i++;
			
			}
			
		}
		
		
	};
	
	clear();	
	renderPlanets();
	renderOreCounts();
	
	
	return{
	    attach:function(container){
		    switch(typeof container){
			    default:
					document.body.appendChild(canvas);
				break;			
			}
		},
		
		render:function(){
			
	        clear();	
        	renderPlanets();
			renderOreCounts();
			renderAttackLines(context);
			
			context.fillStyle='#ffffff';
			context.textAlign = 'left';
			context.font = '10px arial';
			context.fillText('best AI: ' + Game.stats.best,15,15);
			context.fillText('weakest player: ' + Game.stats.weakest,15,25);
			context.fillText('total force: ' + Game.stats.totalForce,15,35);
			
		},
		
		getCanvas : function(){
			
			return canvas;
		}
	};

}());