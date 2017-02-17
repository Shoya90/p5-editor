var w = 1200;
var h = 800;
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


function preload(){


}

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
      console.log(tool);
  });

  //  frameRate(1);

}

function draw() {
  background(color(44, 62, 80));
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

  if(!lockAnimDots){
    dotDist -= dd;
    if(dotDist <= nodeSize && dotDist >= 5)
      lockAnimDots = false;
    else
      lockAnimDots = true;
  }





}

function mouseIsOverNode(){
      for(var i=0; i<nodes.length; i++){
          if (mouseX > nodes[i].x-nodeSize && mouseX < nodes[i].x+nodeSize &&
             mouseY > nodes[i].y-nodeSize && mouseY < nodes[i].y+nodeSize) {
              nodes[i].status = true;
              overNow = i;
              overNode = nodes[i];
              if(!nodes[i].locked) {
                nodes[i].border = 255;
                // nodes[i].fill = 153;
              }
              calculateDots(nodes[i]);
          } else {
            nodes[i].border = 153;
            // nodes[i].fill = 153;
            nodes[i].status = false;
          }
          console.log(nodes[i]);
      }

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

  var distToTopLine = Math.abs((path.xEndRect1 - path.xStartRect1)*(path.yStartRect1 - mouseY)
  - (path.xStartRect1 - mouseX)*(path.yEndRect1 - path.yStartRect1)) / (Math.sqrt(pow(path.xEndRect1 - path.xStartRect1, 2) + pow(path.yEndRect1 - path.yStartRect1 , 2)));

  var distToBottLine = Math.abs((path.xEndRect2 - path.xStartRect2)*(path.yStartRect2 - mouseY)
  - (path.xStartRect2 - mouseX)*(path.yEndRect2 - path.yStartRect2)) / (Math.sqrt(pow(path.xEndRect2 - path.xStartRect1, 2) + pow(path.yEndRect2 - path.yStartRect2 , 2)));

  var distToStart = Math.abs((path.xStartRect2 - path.xStartRect1)*(path.yStartRect1 - mouseY)
  - (path.xStartRect1- mouseX)*(path.yStartRect2 - path.yStartRect1)) / (Math.sqrt(pow(path.xStartRect2 - path.xStartRect1, 2) + pow(path.yStartRect2 - path.yStartRect1 , 2)));

  var distToEnd = Math.abs((path.xEndRect2 - path.xEndRect1)*(path.yEndRect1 - mouseY)
  - (path.xEndRect2- mouseX)*(path.yEndRect2 - path.yEndRect1)) / (Math.sqrt(pow(path.xEndRect2 - path.xEndRect1, 2) + pow(path.yEndRect2 - path.yEndRect1 , 2)));

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
              nodes.push(new Node(mouseX, mouseY, i));
            }
        }
        //create the first node
        else{
            nodes.push(new Node(mouseX, mouseY, i));
        }
      }
      break;

    case "path":
      //check if mouse is over any node
      if(currentNodeF && overCanvas){
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
            console.log("qua deve essere inc: ", currentPath);
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
      break;
    default:
  }

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
  dragging = true;
  $("input:text").hide();
    for(var i=0; i<nodes.length; i++){
        if(nodes[i].locked){
            nodes[i].x = mouseX-nodes[i].xOffset;
            nodes[i].y = mouseY-nodes[i].yOffset;
        }
    }
    // console.log(dragging);

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

  }
  if (keyCode === DELETE) {

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

      //delete path
      if(overPath != undefined)
        paths.splice(overPath, 1);


  }



}
