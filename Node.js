function Node(x, y, name){
    this.name = name;
    this.status = false;
    this.x = x;
    this.y = y;
    this.border;
    this.locked = false;
    this.fill;
    this.xOffset = 0
    this.yOffset = 0;
    var nodeSize = 24;


  this.show = function(){
    stroke(this.border);
    fill(this.getFill());
    //setup the node label
    textSize(14);
    text(this.name, this.x - 5 , this.y - nodeSize);
    //draw the node
    ellipse(this.x, this.y, nodeSize, nodeSize);

  }

  this.setFill = function(color){
    this.fill = color;
  }

  this.getFill = function() {
    if (this.fill == undefined)
      this.fill = 153;
    return this.fill;
  }

}
