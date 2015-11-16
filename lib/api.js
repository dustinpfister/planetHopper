/*    
 *    api.js
 *
 *    needs: nothing
 *
 *
 *
 *
 *
 */

// a simple API
var api = {
	
    // distance formula
    distance : function (x1, y1, x2, y2) {
		
		// return the distance between the two points
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
		
    },
    
    // your basic bounding box collision detection
    boundingBox : function (x1, y1, w1, h1, x2, y2, w2, h2) {
		
        // if the two objects do not overlap
        if ((x1 > x2 + w2) || (x1 + w1 < x2) || (y1 + h1 < y2) || (y1 > y2 + h2)) { 
            
			//then they do not overlap
			return false; 
        
		}
		
		// else they do
        return true; 
    
    },
    
	// half distance function 
	halfDistance : function (total, pos1, pos2) {

		var d1 = Math.abs(pos1 - pos2),
		d2 = total - d1;

		return d1 < d2 ? d1 : d2;

	},
	
    // get the clockwise, and counter clockwise angles
    getAngles : function (obj, point) {
		
        // get the angle that we need to change to
        var angle = Math.atan2(
                point.y - obj.y,
                point.x - obj.x),
        clock,
        counter;

        if (angle < 0) {
            angle += Math.PI * 2;
        }

        // find the clockwise, and counter clockwise angles.
        clock = angle - obj.heading;
        counter = obj.heading - angle;

        // adjust them if needed
        if (clock <= 0) {
            clock += Math.PI * 2;
        }
        if (counter <= 0) {
            counter += Math.PI * 2;
        }
        if (clock >= Math.PI * 2) {
            clock -= Math.PI * 2;
        }
        if (counter >= Math.PI * 2) {
            counter -= Math.PI * 2;
        }

        // return all the results in an object.
        return {
            angle : angle,
            clockwise : clock,
            counter : counter
        };
    },
	/*
	    _.setUpConstructor(self,arugObj,props,defaults)
		
		Set up a constructor functions properties based on a given argument object, and hard coded defaults.
		this helps speed up the authoring of most constructor functions, by modularising a common design pattern 
		that I often repeat when making constructors.
		
		Arguments:
		
		self -- a reference to the class instance to set up it most cases it would be the this keyword		
		augObj -- the argument object that is given when defining a new class instance
		props -- an array of class properties to set up for the instance
		defaults -- an array of defaults for each properties given in props
		
		EX:
		
		// Your basic constructor may look something like this.
		var Point = function(argumentObj){
		    _.setUpConstructor(
			    this,                 // properties will be added to 'this' or whatever object you give it.									  
				argumentObj,          // pass the argument object, so user define values can be set over the defaults
				['x','y','dx','dy'],  // the list of properties to define
				[10,20,0,0]           // the hard coded defaults for each property
			);
		};
		
		// the argument object given can have any number of properties defined in your props array
		// any properties that you define in the argument object should override your given hard coded defaults
		var pt = new Point({ 
		    x:50,
			dy:-1
		});
		
		console.log(pt.x); // 50
		console.log(pt.y); // 20
		console.log(pt.dx); // 0
		console.log(pt.dy); // -1
	
	*/	
	setUpConstructor:function(self, argumentObj, props, defaults){
        var i = 0;
        // define an empty object for aurgObj if it is undefined, or typeof !== object	
        if (argumentObj === undefined || typeof argumentObj !== 'object'){
            argumentObj = {};
	    }
	
        // set instance properties by given aurgObj, or defaults.
        while (i < props.length) {
            if (argumentObj[props[i]] === undefined) { // if a properties is not given in aurgObj, set the default
                self[props[i]] = defaults[i];
            } else { // else set what has been given
                self[props[i]] = argumentObj[props[i]];
            }
            i++;
        }
	}
};