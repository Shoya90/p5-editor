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
    this.type;
    // var nodeSize = 12;


  this.show = function(){
    stroke(this.border);


    if(this.locked){
      // this.setFill(color(46, 204, 113));
    }

    fill(this.getFill());

    //setup the node label
    textSize(10);
    text(this.name, this.x - 5 , this.y - nodeSize);

    //draw the node
    ellipse(this.x, this.y, nodeSize, nodeSize);

  }

  this.setType = function(type){
    this.type = type;
    switch (type) {
      case 'elevator':
      this.fill = color(230, 126, 34);
        break;
      case 'stairs':
      this.fill = color(243, 156, 18);
        break;
      case 'entrance':
      this.fill = color(155, 89, 182);
        break;
      case 'bathroom':
      this.fill = color(192, 57, 43);
        break;
      case 'generic':
      this.fill = 153;
        break;
    }


  }

  this.setFill = function(color){
    this.fill = color;
    console.log(this.type);
  }

  this.setBorder = function(border) {
    this.border = border;
  }

  this.lock = function(){
    this.locked = true;
  }

  this.unlock = function(){
    this.locked = false;
  }

  this.getFill = function() {
    if (this.fill == undefined)
      this.fill = 153;
    return this.fill;
  }

}
