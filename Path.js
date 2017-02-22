function Path(start, end){
  this.startNode = start;
  this.endNode = end || undefined;
  this.started = true;
  this.finished = false;
  this.locked = false;
  this.status = false;
  this.length;
  this.color = 255;
  this.xStartRect1;
  this.yStartRect1;
  this.xStartRect2;
  this.yStartRect2;
  this.xEndRect1;
  this.yEndRect1;
  this.xEndRect2;
  this.yEndRect2;
  var nodeSize = 24;
  this.isDrawing;

  this.show = function(){
    strokeWeight(4);
    stroke(this.color);
    if(this.endNode !== undefined){
      line(this.endNode.x, this.endNode.y, this.startNode.x, this.startNode.y);
    }
    else
      line((mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor), this.startNode.x, this.startNode.y);

    // noFill();
    strokeWeight(1);
  }

  this.setColor = function(color){
    this.color = color;
  }

  this.getStartNode = function(){
    return this.startNode;
  }

  this.getEndNode = function(){
    if(this.endNode == undefined){
      var tempEndNode = {x: (mouseX - translateX) * (1 / scaleFactor), y:(mouseY - translateY) * (1 / scaleFactor)};
      this.isDrawing = true;
      return tempEndNode;
    }else{
      this.isDrawing = false;
      return this.endNode;
    }

  }

  this.setEndNode = function(endNode){
    this.endNode = endNode;
  }

  this.isStarted = function(){
    return (this.started === true);
  }

  this.setFinished = function() {
    this.finished = true;
  }

  this.isFinished = function(){
    return this.finished;
  }

  //calculate the distance between start and end point
  this.getLength = function(){
    //use muouse position if end point is not yet inserted
    if(this.endNode == undefined){
      this.length = dist(this.startNode.x, this.startNode.y, (mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor));
    }else{
      this.length = dist(this.startNode.x, this.startNode.y, this.endNode.x, this.endNode.y);
    }
    return this.length;
  }

  //calculate the angle between the end point and the x-axis that passes from the start point
  this.getAngle = function(){
    //use muouse position if end point is not yet inserted
    if(this.endNode == undefined){
      this.angle = Math.atan2(((mouseY - translateY) * (1 / scaleFactor) - this.startNode.y),((mouseX - translateX) * (1 / scaleFactor) - this.startNode.x));
    }else {
      this.angle = Math.atan((this.endNode.y - this.startNode.y) / (this.endNode.x - this.startNode.x));
    }
    return this.angle;
  }

  //draw the rectangle from start point to end point
  //the two ends of the rectangle should always be orthogonal to the path
  this.pathRect = function(){
    //calculate start point for the rectangle
    this.calculateRctsStart();
    noFill();
    beginShape(LINES);
    if(this.endNode == undefined){
      vertex(this.xStartRect1, this.yStartRect1);
      vertex((mouseX - translateX) * (1 / scaleFactor) +  (nodeSize / 2) * cos((PI/2) - this.getAngle()),  (mouseY - translateY) * (1 / scaleFactor) +  (nodeSize / 2) * -sin((PI/2) - this.getAngle()));
      vertex((mouseX - translateX) * (1 / scaleFactor) -  (nodeSize / 2) * cos((PI/2) - this.getAngle()), (mouseY - translateY) * (1 / scaleFactor) -  (nodeSize / 2) * -sin((PI/2) - this.getAngle()));
      vertex(this.xStartRect2, this.yStartRect2);


    }else {
      this.calculateRctsEnd();
      vertex(this.xStartRect1, this.yStartRect1);
      vertex(this.xEndRect1, this.yEndRect1);
      vertex(this.xEndRect2, this.yEndRect2);
      vertex(this.xStartRect2, this.yStartRect2);
    }

    endShape();

  }

  //calculate the start points for the rectangle
  this.calculateRctsStart = function(){

    //calculate from the angle and path length (the polar coordinates) the x and y offsets
    //add the start point coordinates to the the offsets
    this.xStartRect1 = this.startNode.x +  (nodeSize / 2) * cos((PI/2) - this.getAngle());
    this.yStartRect1 = this.startNode.y +  (nodeSize / 2) * -sin((PI/2) - this.getAngle());

    this.xStartRect2 = this.startNode.x - (nodeSize / 2) * cos((PI/2) - this.getAngle());
    this.yStartRect2 = this.startNode.y - (nodeSize / 2) * -sin((PI/2) - this.getAngle());

  }

  //calculate the end points for the rectangle
  this.calculateRctsEnd = function(){

    //same logic from the start point
    this.xEndRect1 = this.endNode.x +  (nodeSize / 2) * cos((PI/2) - this.getAngle());
    this.yEndRect1 = this.endNode.y +  (nodeSize / 2) * -sin((PI/2) - this.getAngle());

    this.xEndRect2 = this.endNode.x - (nodeSize / 2) * cos((PI/2) - this.getAngle());
    this.yEndRect2 = this.endNode.y - (nodeSize / 2) * -sin((PI/2) - this.getAngle());

  }





}
