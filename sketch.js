var w = 800;
var h = 600;
var nodeSize = 24;
var nodes = [];
var inp;
var selectedIndex  = 0;
var overNow = undefined;
var tool = 'node';
var overCanvas = false;
var dragging = false;
var paths = [];
var currentNode;
var currentPath = 0;
var firstPath = true;
var pathsOfNode = [];
var overNode;
var dotDist = 5;
var dd = 0.5;
var lockAnimDots = true;
var overPath;
var scaleFactor = 1.0;
var translateX = 0.0;
var translateY = 0.0;
var hit = false;
var intersectionNodes = [];


function setup() {
  var c = createCanvas(w, h);
  c.parent("canvasContainer");

  inp = createInput('');
  inp.id = "name";
  inp.parent("canvasContainer");
  inp.hide();
  if(!$("input:text").val()) {
     $("input:text").attr("placeholder", "Give it a name:");
  }
  $("input:radio[name='r'][value='node']").prop("checked",true);
  $('input:radio[name="r"]').change(
  function(){
      tool = $(this).val();
      if(tool == 'move')
        $('html,body').css('cursor','move');
      else
        $('html,body').css('cursor','auto');
  });

  //  frameRate(1);

}

function draw() {
  background(color(44, 62, 80));

  push();
  translate(translateX,translateY);
  scale(scaleFactor);
  drawGrid();
  // translate(width/2, height/2);
  if(lockAnimDots){
    dotDist += dd;
    if(dotDist >= nodeSize)
      lockAnimDots = false;
    else
      lockAnimDots = true;
  }

  for(var i=0; i<nodes.length; i++){
    mouseIsOverNode();
    nodes[i].show();
  }

  for(var i=0; i<paths.length; i++){
    paths[i].show();
    isInPathRect(paths[i], i);
    paths[i].pathRect();

  }

  // for (var i = 0; i < intersectionNodes.length; i++) {
  //   stroke(156);
  //   fill(153);
  //   ellipse(intersectionNodes[i].x,intersectionNodes[i].y, nodeSize, nodeSize);
  // }

  if(!lockAnimDots){
    dotDist -= dd;
    if(dotDist <= nodeSize && dotDist >= 5)
      lockAnimDots = false;
    else
      lockAnimDots = true;
  }

  pop();


}

function findIntersection(){

  if(paths.length >= 2){
    for (var i = 0; i < paths.length; i++) {
      for (var j = i; j < paths.length; j++) {
        if(paths[i] != paths[j]){
          hit = collideLineLine(paths[i].getStartNode().x,paths[i].getStartNode().y,
                                paths[i].getEndNode().x,paths[i].getEndNode().y,
                                paths[j].getStartNode().x, paths[j].getStartNode().y,
                                paths[j].getEndNode().x,paths[j].getEndNode().y,
                                true);
          if(hit.x){
            // ellipse(hit.x, hit.y, nodeSize, nodeSize);
            // intersectionNodes.push(hit);
            if(!isThereNode(hit.x, hit.y)){
              console.log(paths[i],paths[j]);
              var isn = paths[i].getStartNode();
              var ien = paths[i].getEndNode();
              var jsn = paths[j].getStartNode();
              var jen = paths[j].getEndNode();
              var newNode = new Node(hit.x, hit.y, nodes.length);
              nodes.push(newNode);
              paths.splice(j,1);
              currentPath = paths.length - 1;
              //if there is no path, flag the first path and current path should be zero as well
              if(paths.length == 0){
                firstPath = true;
                currentPath = 0;
              }
              paths.splice(i,1);
              currentPath = paths.length - 1;
              //if there is no path, flag the first path and current path should be zero as well
              if(paths.length == 0){
                firstPath = true;
                currentPath = 0;
              }
              currentNode = newNode;
              paths.push(new Path(isn, newNode));
              paths[currentPath].setEndNode(currentNode);
              paths[currentPath].setFinished();
              console.log(paths[currentPath].getStartNode().name);
              currentPath++;
              firstPath = false;
              paths.push(new Path(ien, newNode));
              paths[currentPath].setEndNode(currentNode);
              paths[currentPath].setFinished();
              console.log(paths[currentPath].getStartNode().name);
              currentPath++;
              paths.push(new Path(jsn, newNode));
              paths[currentPath].setEndNode(currentNode);
              paths[currentPath].setFinished();
              console.log(paths[currentPath].getStartNode().name);
              currentPath++;
              paths.push(new Path(jen, newNode));
              paths[currentPath].setEndNode(currentNode);
              paths[currentPath].setFinished();
              console.log(paths[currentPath].getStartNode().name);
              //empty the currentNode so the path doesn't go on
              currentNode = {};
              // currentPath++;

            }
            continue;
          }
        }
      }
    }
  }

}

function isThereNode(x,y){
  var res;
  for (var i = 0; i < nodes.length; i++) {
    if (dist(x, y, nodes[i].x, nodes[i].y) <= (nodeSize)/2) {
      res = true;
      break;
    }else {
      res = false;
    }
  }
  return res;
}


function mouseWheel(event) {
  translateX -= mouseX;
  translateY -= mouseY;
  var delta = event.wheelDelta > 0 ? 1.05 : event.wheelDelta < 0 ? 1.0/1.05 : 1.0;
  scaleFactor *= delta;
  translateX *= delta;
  translateY *= delta;
  translateX += mouseX;
  translateY += mouseY;

}

function drawGrid() {
	stroke('rgba(111,111,111,.5)');
	fill(120);
	for (var x = -height* (1/scaleFactor) * 2; x < width * (1/scaleFactor) * 2; x+=w/20) {
		line(x, -height * (1/scaleFactor) * 2, x, height * (1/scaleFactor) * 2);
		// text(Math.floor(map(x,-height* (1/scaleFactor), height * (1/scaleFactor), -h, h)), x+1, 12);
	}
	for (var y = -width* (1/scaleFactor) * 2; y < height * (1/scaleFactor) * 2; y+=w/20) {
		line(-width * (1/scaleFactor) * 2, y, width * (1/scaleFactor) * 2, y);
		// text(Math.floor(map(y,-width* (1/scaleFactor), width * (1/scaleFactor), -w, w)), 1, y+12);
	}
}

function mouseIsOverNode(){
      var overNIndex = undefined;
      for(var i=0; i<nodes.length; i++){
        //mouseX > nodes[i].x-nodeSize && mouseX < nodes[i].x+nodeSize &&
        //mouseY > nodes[i].y-nodeSize && mouseY < nodes[i].y+nodeSize
          if (dist((mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor), nodes[i].x, nodes[i].y) <= (nodeSize)/2) {
              nodes[i].status = true;
              overNow = i;
              overNode = nodes[i];
              overNIndex = i;
              if(!nodes[i].locked) {
                nodes[i].border = 255;
                nodes[i].fill = 153;
              }
              calculateDots(nodes[i]);
              // break;
          } else {
            nodes[i].border = 153;
            nodes[i].fill = 153;
            nodes[i].status = false;
            overNow = undefined;
            // overNode = {};
          }
      }
      overNow = overNIndex;
      if(overNow != undefined)
        overNode = nodes[overNow];
}

function  calculateDots(node){
  var theta = 0;
  var dots = [];

  for (var theta = 0; theta < 2*PI; theta += PI/8) {
    var dotx = node.x + (nodeSize  + dotDist) * cos(theta);
    var doty = node.y + (- (nodeSize  + dotDist) * sin(theta));
    point(dotx, doty);
  }
}

function isInPathRect(path, index){

  var distToTopLine = Math.abs((path.xEndRect1 - path.xStartRect1)*(path.yStartRect1 - (mouseY - translateY) * (1 / scaleFactor))
  - (path.xStartRect1 - (mouseX - translateX) * (1 / scaleFactor))*(path.yEndRect1 - path.yStartRect1)) / (Math.sqrt(pow(path.xEndRect1 - path.xStartRect1, 2) + pow(path.yEndRect1 - path.yStartRect1 , 2)));

  var distToBottLine = Math.abs((path.xEndRect2 - path.xStartRect2)*(path.yStartRect2 - (mouseY - translateY) * (1 / scaleFactor))
  - (path.xStartRect2 - (mouseX - translateX) * (1 / scaleFactor))*(path.yEndRect2 - path.yStartRect2)) / (Math.sqrt(pow(path.xEndRect2 - path.xStartRect1, 2) + pow(path.yEndRect2 - path.yStartRect2 , 2)));

  var distToStart = Math.abs((path.xStartRect2 - path.xStartRect1)*(path.yStartRect1 - (mouseY - translateY) * (1 / scaleFactor))
  - (path.xStartRect1- (mouseX - translateX) * (1 / scaleFactor))*(path.yStartRect2 - path.yStartRect1)) / (Math.sqrt(pow(path.xStartRect2 - path.xStartRect1, 2) + pow(path.yStartRect2 - path.yStartRect1 , 2)));

  var distToEnd = Math.abs((path.xEndRect2 - path.xEndRect1)*(path.yEndRect1 - (mouseY - translateY) * (1 / scaleFactor))
  - (path.xEndRect2- (mouseX - translateX) * (1 / scaleFactor))*(path.yEndRect2 - path.yEndRect1)) / (Math.sqrt(pow(path.xEndRect2 - path.xEndRect1, 2) + pow(path.yEndRect2 - path.yEndRect1 , 2)));

  if(distToBottLine <= nodeSize && distToTopLine <= nodeSize &&
    distToStart <= path.getLength() && distToEnd <= path.getLength()){
    path.color = color(39, 174, 96);
    overPath = index;
  }else {
    path.color = 255;
    overPath = undefined;
  }
}


function isConnectedToNode(node){
  for(var i=0; i < paths.length; i++){
    if(paths[i].getStartNode() == node || paths[i].getEndNode() == node){
      getPathsOfNode(node);
      return true;
    }
    else {
      pathsOfNode = [];
      return false;
    }
  }
}

function getPathsOfNode(node){
  for(var i=0; i < paths.length; i++){
    if(paths[i].getStartNode() == node || paths[i].getEndNode() == node){
      pathsOfNode.push(paths[i]);
    }
  }
}

function mousePressed() {

var overOne = false;
  for(var i=0; i<nodes.length; i++){
      if(nodes[i].status == true){
          overOne = true;
          currentNode = nodes[i];
      }
  }

  //check the selected tool
  switch (tool) {
    case "node":
      //checck if mouse is over canvas and if is being dragged
      if(overCanvas && !dragging){
        //if there is at least one node
        if(nodes.length > 0) {
            //if mouse is over one node
            if(overOne){
                for(var i=0; i<nodes.length; i++){
                    //find the node mouse is over
                    //set it's status to true ( is being hovered )
                    //give it a border
                    if(nodes[i].status){
                        nodes[i].locked = true;
                        nodes[i].fill = 255;
                        selectedIndex = i;
                    }else{
                        nodes[i].locked = false;
                    }
                    nodes[i].xOffset = mouseX-nodes[i].x;
                    nodes[i].yOffset = mouseY-nodes[i].y;
                }
            }
            //if mouse is not over any node, but there is at leat one node available, create a new node
            else{
              nodes.push(new Node((mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor), i));
            }
        }
        //create the first node
        else{
            nodes.push(new Node((mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor), i));
        }
      }
      break;

    case "path":

      //check if mouse is over any node
      if(currentNodeF && overCanvas && overNow != undefined){
        //if this is the first path
        if(currentPath == 0 && firstPath){
          //start the first path with the current node as start
          paths.push(new Path(currentNode));
          //it is not first path any more
          firstPath = false;
        }
        //if it is not the first path (based on the value of firstPath)
        else {
          //if the finished attribute of the path is set
          if(paths[currentPath].isFinished()){
            //increment currentPath number and start a new path
            currentPath++;
            paths.push(new Path(currentNode));
            currentNode = {};
          //if the current path isn't finished yet
          }else {
            //check to see start and end node should not be the same
            //also check that the same path doesn't exist already
            if(currentNode != paths[currentPath].getStartNode() && !isTheSamePath(paths[currentPath], currentNode)){
              //set the end node for the current path and set it as finished
              paths[currentPath].setEndNode(currentNode);
              paths[currentPath].setFinished();
              //empty the currentNode so the path doesn't go on
              currentNode = {};
            }else {
              nodes[overNow].setFill = color(231, 76, 60);
              console.log(nodes[overNow].fill, nodes[overNow].name);
            }

          }
        }
      }
      findIntersection();
      break;
    default:
  }

}

function mapCoordinates(){

}

function isTheSamePath(path, end_node){
  var result;
  for (var i = 0; i < paths.length; i++) {
    if((path.getStartNode() == paths[i].getStartNode() && end_node == paths[i].getEndNode())
      ||
      (path.getStartNode() == paths[i].getEndNode() && end_node == paths[i].getStartNode())){
      result = true;
      break;
    }
    else {
      result = false;
    }
  }

  return result;

}

function mouseMoved(){
  if(mouseX < w && mouseY < h){
    overCanvas = true;
  }
  else {
    overCanvas = false;
  }
}

function mouseDragged() {


    switch (tool) {
      case 'move':
        translateX += mouseX - pmouseX;
        translateY += mouseY - pmouseY;
        break;
      case 'node':
        dragging = true;
        $("input:text").hide();
          for(var i=0; i<nodes.length; i++){
              if(nodes[i].locked){
                  nodes[i].x = mouseX-nodes[i].xOffset;
                  nodes[i].y = mouseY-nodes[i].yOffset;
              }
          }
        break;

    }


}



function mouseReleased() {

  currentNodeF();

  switch(tool){
    case 'node':
      dragging = false;
      for(var i=0; i<nodes.length; i++){
        nodes[i].locked = false;
        if(nodes[i].status ){
          inp.position(nodes[i].x, nodes[i].y - 24);
          $("input:text").fadeIn(200);
          $("input:text").focus();
        }
      }
      break;
    case 'path':
      break;
  }
}

function mouseIsOnNode(){
  if(overNow != undefined){
    if(dist((mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor), nodes[overNow].x, nodes[overNow].y) < nodeSize/2){
      return true;
    }else {
      overNow = undefined;
      return false;
    }
  }else {
    return false;
  }

}


//find the node has the status true i.e. is being hovered
function currentNodeF(){
  for(var i=0; i<nodes.length; i++){
      if(nodes[i].status == true){
          overOne = true;
          currentNode = nodes[i];
          return currentNode;
      }
      else{
        return false;
      }
  }
}


function keyPressed() {
  if (keyCode === ENTER) {
    nodes[selectedIndex].name = $("input:text").val();
    $("input:text").val("");
    $("input:text").fadeOut(200);
  }
  if (keyCode === ESCAPE) {
    $("input:text").fadeOut(200);
    if(paths.length != 0 && !paths[currentPath].isFinished()){
      paths.splice(currentPath, 1);
      currentPath = paths.length - 1;
      //if there is no path, flag the first path and current path should be zero as well
      if(paths.length == 0){
        firstPath = true;
        currentPath = 0;
      }
    }



  }
  if (keyCode === DELETE) {

    if(mouseIsOnNode()){
      //delete the node from the array
      nodes.splice(overNow, 1);
      $("input:text").fadeOut(200);
      //get the paths connected to this node
      getPathsOfNode(overNode);
      //find and delete every path in the array of paths connected to this node (i.e. overNode)
      for (var i = 0; i < pathsOfNode.length; i++) {
        for (var j = 0; j < paths.length; j++) {
          if(paths[j] == pathsOfNode[i])
            paths.splice(j,1);
          }
        }

      //empty the paths conected to the node that got deleted
      pathsOfNode = [];
      //current path should be the index of the last path
      currentPath = paths.length - 1;
      //if there is no path, flag the first path and current path should be zero as well
      if(paths.length == 0){
        firstPath = true;
        currentPath = 0;
      }
    }
      //delete path
      if(overPath != undefined)
        paths.splice(overPath, 1);


  }

  if (key == 'R') {
    scaleFactor = 1;
    translateX = 0.0;
    translateY = 0.0;
  }

  if (key == 'N') {
    $("input:radio[name='r'][value='node']").prop("checked",true);
    tool = 'node';
  }

  if (key == 'P') {
    $("input:radio[name='r'][value='path']").prop("checked",true);
    tool = 'path';
  }

  if (key == 'M') {
    $("input:radio[name='r'][value='move']").prop("checked",true);
    tool = 'move';
  }

  if(tool == 'move')
    $('html,body').css('cursor','move');
  else
    $('html,body').css('cursor','auto');

}
