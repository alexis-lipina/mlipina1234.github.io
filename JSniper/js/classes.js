class Ship extends PIXI.Sprite{
    constructor(x = 0, y = 0){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
    }
}
class SubScope extends PIXI.Sprite{
    constructor(x = 0, y = 0){
        super(PIXI.loader.resources["images/SubScope.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1.2);
        this.x = x;
        this.y = y;
    }
}

class SubSubScope extends PIXI.Sprite{
    constructor(x = 0, y = 0){
        super(PIXI.loader.resources["images/SubScope.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1.4);
        this.x = x;
        this.y = y;
    }
}

class MuzzleFlash extends PIXI.Sprite{
    constructor(x = 0, y = 0){
        super(PIXI.loader.resources["images/MuzFlash.png"].texture);
    
        this.anchor.set(0.5, 0.5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
    }
}

class Map extends PIXI.Sprite{
    constructor(x = 0, y = 0){
        super(PIXI.loader.resources["images/Map.png"].texture);
    
        this.anchor.set(0, 0);
        this.scale.set(1);
        this.x = x;
        this.y = y;
    }
}




class Circle extends PIXI.Graphics{
    constructor(radius, color = 0xFF0000, x = 0, y = 0){
        super();
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
        this.circleColor = color;
    }
    
    
    move(dt = 1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
    
    reflectX(){
        this.fwd.x *= -1;
    }
    
    reflectY(){
        this.fwd.y *= -1;
    }
}

class Bullet extends PIXI.Graphics{
    constructor(color = 0xFFFFFF, x = 0, y = 0){
        super();
        this.beginFill(color);
        this.drawRect(-2, -3, 4 , 6);
        this.endFill();
        this.x = x;
        this.y = y;
        
        this.fwd = {x:0, y:-1};
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this)
    }
    
    move(dt = 1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}