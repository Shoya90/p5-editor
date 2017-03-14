var w = 1000;
var h = 600;
var nodeSize = 12;
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
var uArr = [];
var tArr = [];
var pathsToDelete = [];
var lastPathStart;
var lastPathEnd;
var lasPathOld = paths[paths.length - 1];
var tempNodes = [];
var nodeDragged;
var selecting = false;
var x_sel_start;
var x_sel_end;
var y_sel_start;
var y_sel_end;
var group_sel_drag = false;
var deltaX = 0;
var deltaY = 0;
var x_sel_drag;
var y_sel_drag;
var thumbs_counter = 0;
var historyNodeArray = [];
var historyPathArray = [];
var histoty_pointer = [];
var right_clk_toggle = 0;
var database;
var ref;
var auth;
var userId;
var busy = false;
var projectId = undefined;
var new_project = true;
var img;
var original_img_width;
var original_img_height;
var elevator = false;
var stairs = false;
var entrance = false;
var bathroom = false;
var type = 'generic';

function preload() {
  img = loadImage("images/map4.gif");
  original_img_height = img.height;
  original_img_width = img.width;
}

function setup() {

  var c = createCanvas(w, h);
  c.parent("canvasContainer");

  inp = createInput('');
  inp.id = "name";
  inp.parent("canvasContainer");
  inp.hide();

  $('#generic').on('click', function(event) {
    generic = true;
    type = 'generic';
  });
  $('#elevator').on('click', function(event) {
    elevator = true;
    type = 'elevator';
  });
  $('#stairs').on('click', function(event) {
    stairs = true;
    type = 'stairs';
  });
  $('#entrance').on('click', function(event) {
    entrance = true;
    type = 'entrance';
  });
  $('#bathroom').on('click', function(event) {
    bathroom = true;
    type = 'bathroom';
  });

  // setInterval(takeSnapshot, 5000);

  // if(!$("input:text").val()) {
  //    $("input:text").attr("placeholder", "Give it a name:");
  // }
  $("input:radio[name='r'][value='node']").prop("checked",true);
  $('input:radio[name="r"]').change(
  function(){
      tool = $(this).val();
      if(tool == 'move')
        $('html,body').css('cursor','move');
      else
        $('html,body').css('cursor','auto');
  });

  // firebase setting
  var config = {
    apiKey: "AIzaSyB-V-3OBLvHgMNInk1sad3A6KtyEM6wx_g",
    authDomain: "p5-editor-test.firebaseapp.com",
    databaseURL: "https://p5-editor-test.firebaseio.com",
    storageBucket: "p5-editor-test.appspot.com",
    messagingSenderId: "967415691707"
  };
  firebase.initializeApp(config);
  auth = firebase.auth();
  database = firebase.database();

  auth.onAuthStateChanged(function(u){
    if(u){
      console.log(u.email);
      userId = u.uid;
      ref_Project = database.ref('snapshot/users/' + userId + '/' + 'projects');

    }else {
      userId = undefined;
      window.location.replace("login.html");
    }

  });

  $('#logout').on('click', function(event) {
    auth.signOut();
    window.location.replace("login.html");
  });

  $('#snapshot').on('click', function(event) {
    takeSnapshot();
  });

  $('#load').on('click', function(event) {
    ref_Project.on('value', gotData, errData);
  });

  function gotData(data){
    var loadeds = selectAll('.loaded');
    for (var i = 0; i < loadeds.length; i++) {
      loadeds[i].remove();
    }
    var projects = $.map(data.val(), function(value, index) {
      return [value];
    });
    console.log(projects);

    if(projects.length != 0){
      projects.forEach(function(project){
        var th = $.map(project, function(value, index) {
          return [value];
        });
        var p = createSpan(project.name + '  :  ' + (th.length - 2) + ' snapshots');
        p.class('loaded');
        p.parent('history_loaded');

      });
    }else {
      var p = createSpan('no project yet');
      p.class('loaded');
      p.parent('history_loaded');
    }

  }

}


function errData(err){
  console.log(err);
}

var imgX = 0;
var imgY = 0;

function draw() {
  background(color(44, 62, 80));

  push();

  //translate and scale according to zoom and pan variables
  translate(translateX,translateY);
  scale(scaleFactor);
  //draw the grid
  drawGrid();

  push();
  tint(180, 180, 180, 100);
  image(img, (-img.width + width) /2 + imgX,  (-img.height + height)/2 + imgY);
  pop();

  tempNextNode();

  // draw dots around nodes
  // outgoing
  if(lockAnimDots){
    dotDist += dd;
    if(dotDist >= nodeSize)
      lockAnimDots = false;
    else
      lockAnimDots = true;
  }

  for(var i=0; i<nodes.length; i++){
    //detect if mouse is over any node
    mouseIsOverNode();
    //show all nodes

    //if a node is in the selection area, lock it
    if(selecting){
      if((nodes[i].x > x_sel_start && nodes[i].x < x_sel_end && nodes[i].y > y_sel_start && nodes[i].y < y_sel_end)
        ||
        (nodes[i].x > x_sel_end && nodes[i].x < x_sel_start && nodes[i].y > y_sel_start && nodes[i].y < y_sel_end)
        ||
        (nodes[i].x > x_sel_end && nodes[i].x < x_sel_start && nodes[i].y > y_sel_end && nodes[i].y < y_sel_start)
        ||
        (nodes[i].x > x_sel_start && nodes[i].x < x_sel_end && nodes[i].y > y_sel_end && nodes[i].y < y_sel_start)
      ){
        nodes[i].lock();
      }
      else{
        nodes[i].unlock();
      }
    }

    nodes[i].show();

  }

  for(var i=0; i<paths.length; i++){
    //show all paths
    paths[i].show();
    //detect if mouse is over any path rectangle
    isInPathRect(paths[i], i);
    //draw the rectangle corresspoding to each pth
    paths[i].pathRect();

  }

  if(selecting){
    fill(color('rgba(153,153,153,.3)'));
    rect(x_sel_start, y_sel_start, x_sel_end - x_sel_start, y_sel_end - y_sel_start);
  }

  // draw dots around nodes
  // ingoing
  if(!lockAnimDots){
    dotDist -= dd;
    if(dotDist <= nodeSize && dotDist >= 5)
      lockAnimDots = false;
    else
      lockAnimDots = true;
  }

  pop();


}



function groupDrag(dX, dY){
    var x = dX || deltaX;
    var y = dY || deltaY;

    if(group_sel_drag == 1){
      for (var i = 0; i < nodes.length; i++) {
        if(nodes[i].locked){
          nodes[i].x += x;
          nodes[i].y += y;
        }
      }
    }
}


function tempNextNode(){

  var x = (mouseX - translateX) * (1 / scaleFactor);
  var y = (mouseY - translateY) * (1 / scaleFactor);

  if(tool == 'node' && !isThereNode(x, y)){
      fill(color(255,255,255, .9));
      text(nodes.length, x - 5, y - nodeSize);
      ellipse(x, y, nodeSize, nodeSize);
  }

}


//find all the intersections after the new path added
function findIntersection(path){
  var thisPath = path || paths[paths.length - 1];
  //if an argument is passed, also consider the last path
  if(path != undefined){
    for (var i = 0; i < paths.length; i++) {
      //for every path find it's t and u with the last added path
        findTU(paths[i], thisPath);

    }
  }
  //if argument is not passed, use the last line as the second line, and find the intersection between it and all path
  else {
    for (var i = 0; i < paths.length - 1; i++) {
      //for every path find it's t and u with the last added path
        findTU(paths[i], thisPath);

    }
  }


  //for all the paths, except the last path, cut it on the intersection with the last path
  cutOldPath();

  // if there is a u, intersection on the last path, sort the uArray and cut the last path into right pieces
  if(uArr.length >= 1){
    uArr.sortOn('u');
    cutLastPathToPieces();
  }
}
//find t and u
//every path can be expressed in the form P(a) + (P(b) - P(a))*t, where P(a) is the start node and P(b) is the end node
//if 0<t<1 then the point is on the line segment, if not the point is on the line but not on the segment
//the last path is presented as P(1) + (P(2) - P(1))*u , where P(1) is the start node and P(2) is the end node, and the same t for u
function findTU(p1,p2){

  //to find the x and y of intersection between the last path and any path we should solve two equations
  //dom is the determinant which will be the denominator and is the same for u and t
  var dom = ((p2.getStartNode().y - p2.getEndNode().y) * (p1.getEndNode().x - p1.getStartNode().x) -
            (p1.getEndNode().y - p1.getStartNode().y) * (p2.getStartNode().x - p2.getEndNode().x));

  //to prevent division by zero
  if( dom != 0 ){
      //numerator for t, which is the determinant resulting from the two equations
      var bt = ((p2.getStartNode().y - p2.getEndNode().y) * (p2.getStartNode().x - p1.getStartNode().x)-
                (p2.getStartNode().y - p1.getStartNode().y) * (p2.getStartNode().x - p2.getEndNode().x));
      var t = bt / dom;

      //numerator for t, which is the determinant resulting from the two equations
      var bu = ((p2.getStartNode().y - p1.getStartNode().y) * (p1.getEndNode().x - p1.getStartNode().x)-
                (p1.getEndNode().y - p1.getStartNode().y) * (p2.getStartNode().x - p1.getStartNode().x));
      var u = bu / dom;
  }

  //calculate the intersection
  var x = p1.getStartNode().x + (t * (p1.getEndNode().x - p1.getStartNode().x));
  var y = p1.getStartNode().y + (t * (p1.getEndNode().y - p1.getStartNode().y));

  //if the intersection is on the both paths and the is not another node on the same x and y
  if((t > 0 && t < 1) && (u > 0 && u < 1) && !isThereNode(x,y)){
    //save the start point of the last path, the path we are trying to find intersection with other paths
    lastPathStart = p2.getStartNode();

    //create and push the intersection node
    intxNode = new Node(x, y, nodes.length);
    nodes.push(intxNode);

    //push the new two paths that sould be added later, in place of the old path, into tArray
    //which are from the satrt of this path to the intersection
    tArr.push({node1: p1.getStartNode(), node2: intxNode});
    //and from the intersection to the end node of this path
    tArr.push({node1: p1.getEndNode(), node2: intxNode});

    //mark this path(p1) as to be deleted later
    pathsToDelete.push(p1);

    //push into uArray the intersection node and it's u value
    //u is later used to sort the array
    uArr.push({node: intxNode, u:u});

    //save the last path's end node
    lastPathEnd = p2.getEndNode();

  }

}

//sort array based on a key
Array.prototype.sortOn = function(key){
    this.sort(function(a, b){
        if(a[key] < b[key]){
            return -1;
        }else if(a[key] > b[key]){
            return 1;
        }
        return 0;
    });
}

//delete a selected path
function deletePath(p){
  for (var i = 0; i < paths.length; i++) {
    if(p == paths[i]){
      paths.splice(i,1);
      //decrement the current path counter
      currentPath--;
      break;
    }
  }
}

//the paths which han ad intersection with the last path, sould be replaced with two path segments
function cutOldPath() {
  for (var i = 0; i < tArr.length; i++) {
      currentPath++;
      newPath = new Path(tArr[i].node1 , tArr[i].node2);
      paths.push(newPath);
      newPath.setEndNode(tArr[i].node2);
      newPath.setFinished();
  }

  //delete the old marked paths
  var i = 0;
  var len = pathsToDelete.length;
  while (i < len) {
    deletePath(pathsToDelete[i]);
    i++;
  }

  // empty the tArray and marked paths
  pathsToDelete = [];
  tArr = [];
}

//the last must the segmented based on u values which are sorted
function cutLastPathToPieces(){

  //first draw a path between the startNode of the last path and the node with the laest u
  currentPath++;
  newPath = new Path(lastPathStart, uArr[0].node);
  paths.push(newPath);
  newPath.setEndNode(uArr[0].node);
  newPath.setFinished();

  //draw a path between any node based on u, with it's next node
  for (var i = 0; i < uArr.length - 1; i++) {
      currentPath++;
      newPath = new Path(uArr[i].node, uArr[i + 1].node);
      paths.push(newPath);
      newPath.setEndNode(uArr[i + 1].node);
      newPath.setFinished();
  }
  //at last draw a path between the endNode of the last path and the node with the most u
  currentPath++;
  newPath = new Path(uArr[uArr.length - 1].node, lastPathEnd);
  paths.push(newPath);
  newPath.setEndNode(lastPathEnd);
  newPath.setFinished();

  //empty the uArray for this last path
  uArr = [];

  //delete the last path
  for (var i = 0; i < paths.length; i++) {
    if(paths[i].getStartNode() == lastPathStart && paths[i].getEndNode() == lastPathEnd){
      paths.splice(i,1);
      currentPath--;
      break;
    }
  }

}

//function to know if there is a node on a given x and y
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

//function for handling zoom
function mouseWheel(event) {
  if(overCanvas){
    translateX -= mouseX;
    translateY -= mouseY;
    //if scroll up => scale set delta as 1.05, if scroll down, set it to 1/1.05
    var delta = event.wheelDelta > 0 ? 1.05 : event.wheelDelta < 0 ? 1.0/1.05 : 1.0;
    //mult delta to scale factor
    scaleFactor *= delta;
    translateX *= delta;
    translateY *= delta;
    translateX += mouseX;
    translateY += mouseY;

    //resize image
    image(img, (-img.width + width) /2 + imgX,  (-img.height + height)/2 + imgY, img.width * delta, 0);

  }


}

function drawGrid() {
	stroke('rgba(111,111,111,.5)');
	fill(120);
	for (var x = -height* (1/scaleFactor) * 8; x < width * (1/scaleFactor) * 8; x+=w/40) {
		line(x, -height * (1/scaleFactor) * 8, x, height * (1/scaleFactor) * 8);
		// text(Math.floor(map(x,-height* (1/scaleFactor), height * (1/scaleFactor), -h, h)), x+1, 12);
	}
	for (var y = -width* (1/scaleFactor) * 8; y < height * (1/scaleFactor) * 8; y+=w/40) {
		line(-width * (1/scaleFactor) * 8, y, width * (1/scaleFactor) * 8, y);
		// text(Math.floor(map(y,-width* (1/scaleFactor), width * (1/scaleFactor), -w, w)), 1, y+12);
	}
}

function mouseIsOverNode(){
      var overNIndex = undefined;
      for(var i=0; i<nodes.length; i++){
          if (dist((mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor), nodes[i].x, nodes[i].y) <= (nodeSize)/2) {
              nodes[i].status = true;
              overNow = i;
              overNode = nodes[i];
              overNIndex = i;
              if(!nodes[i].locked) {
                nodes[i].border = 255;
                // nodes[i].fill = 153;
              }
              calculateDots(nodes[i]);
              // break;
          } else {
            nodes[i].border = 153;
            // nodes[i].fill = 153;
            nodes[i].status = false;
            overNow = undefined;
            // overNode = {};
          }
      }
      overNow = overNIndex;
      if(overNow != undefined)
        overNode = nodes[overNow];

      //TODO:working with right click
      // if(overNow != undefined && mouseButton == RIGHT){
      //   ellipse((mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor),nodeSize * 4,nodeSize * 4);
      // }
}

//dot positions around the node on hover
function  calculateDots(node){
  var theta = 0;
  var dots = [];
  //use the polar coordinates to go around the node
  for (var theta = 0; theta < 2*PI; theta += PI/8) {
    var dotx = node.x + (nodeSize  + dotDist) * cos(theta);
    var doty = node.y + (- (nodeSize  + dotDist) * sin(theta));
    point(dotx, doty);
  }
}

//detect if the mouse is entered into the path rectangle
function isInPathRect(path, index){

  //calculate the distance to each side of the rectangle
  var distToTopLine = Math.abs((path.xEndRect1 - path.xStartRect1)*(path.yStartRect1 - (mouseY - translateY) * (1 / scaleFactor))
  - (path.xStartRect1 - (mouseX - translateX) * (1 / scaleFactor))*(path.yEndRect1 - path.yStartRect1)) / (Math.sqrt(pow(path.xEndRect1 - path.xStartRect1, 2) + pow(path.yEndRect1 - path.yStartRect1 , 2)));

  var distToBottLine = Math.abs((path.xEndRect2 - path.xStartRect2)*(path.yStartRect2 - (mouseY - translateY) * (1 / scaleFactor))
  - (path.xStartRect2 - (mouseX - translateX) * (1 / scaleFactor))*(path.yEndRect2 - path.yStartRect2)) / (Math.sqrt(pow(path.xEndRect2 - path.xStartRect1, 2) + pow(path.yEndRect2 - path.yStartRect2 , 2)));

  var distToStart = Math.abs((path.xStartRect2 - path.xStartRect1)*(path.yStartRect1 - (mouseY - translateY) * (1 / scaleFactor))
  - (path.xStartRect1- (mouseX - translateX) * (1 / scaleFactor))*(path.yStartRect2 - path.yStartRect1)) / (Math.sqrt(pow(path.xStartRect2 - path.xStartRect1, 2) + pow(path.yStartRect2 - path.yStartRect1 , 2)));

  var distToEnd = Math.abs((path.xEndRect2 - path.xEndRect1)*(path.yEndRect1 - (mouseY - translateY) * (1 / scaleFactor))
  - (path.xEndRect2- (mouseX - translateX) * (1 / scaleFactor))*(path.yEndRect2 - path.yEndRect1)) / (Math.sqrt(pow(path.xEndRect2 - path.xEndRect1, 2) + pow(path.yEndRect2 - path.yEndRect1 , 2)));
  //if all of the distances are within width and height of the rectangle
  if(distToBottLine <= nodeSize && distToTopLine <= nodeSize &&
    distToStart <= path.getLength() && distToEnd <= path.getLength()){
    path.color = color(39, 174, 96);
    overPath = index;
    //if we are over a path and not over a node, draw a temp node on the path
    if(overNow == undefined && tool == 'path'){
      fill(color(153,153,153, .6));
      text(nodes.length,(mouseX - translateX) * (1 / scaleFactor) - 5,(mouseY - translateY) * (1 / scaleFactor) - nodeSize);
      ellipse((mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor), nodeSize, nodeSize);
    }
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

//get all the paths connected to a specific node
function getPathsOfNode(node){
  for(var i=0; i < paths.length; i++){
    if(paths[i].getStartNode() == node || paths[i].getEndNode() == node){
      pathsOfNode.push(paths[i]);
    }
  }
}


function LockCount(){
var locked_count = 0;
  for (var i = 0; i < nodes.length; i++) {
    if(nodes[i].locked){
      locked_count++;
    }
  }
  return locked_count;
}

function mousePressed() {

if(mouseButton == RIGHT && right_clk_toggle == 0)  {
  $("input:radio[name='r'][value='path']").prop("checked",true);
  tool = 'path';
  right_clk_toggle = 1;
}else if (mouseButton == RIGHT && right_clk_toggle == 1) {
  $("input:radio[name='r'][value='node']").prop("checked",true);
  tool = 'node';
  right_clk_toggle = 0;

  cancelDrawing();
}

var overOne = false;
  for(var i=0; i<nodes.length; i++){
      if(nodes[i].status == true){
          overOne = true;
          currentNode = nodes[i];
      }
  }

  //check the selected tool
  switch (tool) {
    case "select":
      if(!selecting){
        x_sel_start = (mouseX - translateX) * (1 / scaleFactor);
        y_sel_start = (mouseY - translateY) * (1 / scaleFactor);
        x_sel_end = x_sel_start;
        y_sel_end = y_sel_start;
        selecting = true;
      }
      if(dragging){
        console.log('drag');
      }
      break;

    case "node":
      //checck if mouse is over canvas and if is being dragged
      if(overCanvas && !dragging && mouseButton == LEFT){
        //if there is at least one node
        if(nodes.length > 0) {
            //if mouse is over one node
            if(overOne){

                switch (type) {
                  case 'elevator':
                  nodes[overNow].setType('elevator');
                    break;
                  case 'stairs':
                  nodes[overNow].setType('stairs');
                    break;
                  case 'entrance':
                  nodes[overNow].setType('entrance');
                    break;
                  case 'bathroom':
                  nodes[overNow].setType('bathroom');
                    break;
                  case 'generic':
                  nodes[overNow].setType('generic');
                      break;
                    // default: nodes[overNow].setType('generic');
                }

                for(var i=0; i<nodes.length; i++){
                    //find the node mouse is over
                    //set it's status to true ( is being hovered )
                    //give it a border
                    if(nodes[i].status){
                        nodes[i].locked = true;
                        // nodes[i].fill = 255;
                        selectedIndex = i;
                    }else{
                        nodes[i].locked = false;
                    }
                    nodes[i].xOffset = mouseX-nodes[i].x;
                    nodes[i].yOffset = mouseY-nodes[i].y;
                }
            }

            else if (LockCount() <= 1) {
              nodes.push(new Node((mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor), i));
            }

            else if (LockCount() > 1) {
              console.log(LockCount());
            }
            //if mouse is not over any node, but there is at leat one node available, create a new node


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
              // currentNode = {};
              findIntersection();
              //start the new path from currently created node
              currentPath++;
              newPath = new Path(currentNode);
              paths.push(newPath);

            }else {
              // nodes[overNow].setFill = color(231, 76, 60);
            }

          }
        }
      }
      //the case which user clicks on a path, while is drawing a path, or just wants to start a new path from an old path
      //a node is added on the path
      else if(paths.length >= 1){

        var newNodeOnPath;
        var pathNodeAddedOn;
        for (var i = 0; i < paths.length; i++) {
          //check if any path is clicked or not
          isInPathRect(paths[i],i);
          //if a path is clicked while drawing a path
          if(overPath != undefined && mouseButton == LEFT){

            //save the current position of the mouse (considering scale a translate)
            newNodeOnPath = new Node((mouseX - translateX) * (1 / scaleFactor), (mouseY - translateY) * (1 / scaleFactor), nodes.length);
            tempNodes.push({x: (mouseX - translateX) * (1 / scaleFactor), y:(mouseY - translateY) * (1 / scaleFactor)});
            //add the new node on the path
            nodes.push(newNodeOnPath);
            //save the clicked path
            pathNodeAddedOn = paths[i];

            //cut the clicked path
            //first piece
            currentPath++;
            newPath = new Path(pathNodeAddedOn.getStartNode(), newNodeOnPath);
            paths.push(newPath);
            newPath.setEndNode(newNodeOnPath);
            newPath.setFinished();
            //second piece
            currentPath++;
            newPath = new Path(newNodeOnPath, pathNodeAddedOn.getEndNode());
            paths.push(newPath);
            newPath.setEndNode(pathNodeAddedOn.getEndNode());
            newPath.setFinished();

            //delete the saved path
            for (var i = 0; i < paths.length; i++) {
              if(paths[i].getStartNode() == pathNodeAddedOn.getStartNode() && paths[i].getEndNode() == pathNodeAddedOn.getEndNode()){
                paths.splice(i,1);
                currentPath--;
                break;
              }
            }

            //because it was a drawing path and so was not finished, set it as finished
            for (var i = 0; i < paths.length; i++) {
              if(!paths[i].isFinished()){
                paths[i].setEndNode(newNodeOnPath);
                paths[i].setFinished();
                //after setting the path as finished, find the potential intersections
                findIntersection(paths[i]);
                break;
              }
            }

            //third piece
            currentPath++;
            newPath = new Path(newNodeOnPath);
            paths.push(newPath);


            //break out of the main loop (find the hovering path)
            break;
          }
        }

      }

      break;
  }

}


//check if the path (that is to be added), already exists or not
//even it exists in the opposite direction, considered to be existing the same path
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

//check if the mouse is over canvas or not
function mouseMoved(){

  if(tool == 'select' && group_sel_drag == true){
    calculateDeltas();
    groupDrag();

  }


  if(mouseX < w && mouseY < h){
    overCanvas = true;
  }
  else {
    overCanvas = false;
  }
}


function mouseDragged() {

    if (mouseButton == CENTER){
      translateX += mouseX - pmouseX;
      translateY += mouseY - pmouseY;
    }
    switch (tool) {
      case 'node':
          dragging = true;
          // $("input:text").hide();
            for(var i=0; i<nodes.length; i++){
                if(nodes[i].locked){
                    nodes[i].x = mouseX - nodes[i].xOffset;
                    nodes[i].y = mouseY - nodes[i].yOffset;
                    nodeDragged = nodes[i];
                }
            }

        break;

      case "select":
        x_sel_end = (mouseX - translateX) * (1 / scaleFactor);
        y_sel_end = (mouseY - translateY) * (1 / scaleFactor);
        break;

    }

// dragging = true;

}



function mouseReleased() {

  currentNodeF();

  switch(tool){
    case 'node':
    // for(var i=0; i<nodes.length; i++){
    //     if(nodes[i].locked){
    //       nodes[i].x = x_sel_drag + nodes[i].xOffset;
    //       nodes[i].y = y_sel_drag + nodes[i].yOffset;
    //     }
    // }
      dragging = false;
      for(var i=0; i<nodes.length; i++){
        nodes[i].locked = false;
        if(nodes[i].status ){
          // inp.position(nodes[i].x, nodes[i].y - 24);
          // $("input:text").fadeIn(200);
          // $("input:text").focus();
        }
      }

      getPathsOfNode(nodeDragged);
      pathsOfNode.forEach(function(path){
        findIntersection(path);
      });
      pathsOfNode = [];

      break;
    case 'select':

      mouseIsOverNode();
      if(overNow){
      }

      selecting = false;
      group_sel_drag = false;
      deltaCounter = 0;
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

var refX = 0;
var refY = 0;
var deltaCounter = 0;

function calculateDeltas(){


  for (var i = 0; i < nodes.length; i++) {

    if(nodes[i].locked){
      if(deltaCounter == 0){
        refX = nodes[i].x;
        refY = nodes[i].y;
      }
      deltaX = (mouseX - translateX) * (1 / scaleFactor) - nodes[i].x;
      deltaY = (mouseY - translateY) * (1 / scaleFactor) - nodes[i].y;
      deltaCounter++;
      break;
    }
  }

  group_sel_drag = true;
}

function UndoGroupDrag(){

  var x;
  var y;
  for (var i = 0; i < nodes.length; i++) {
    if(nodes[i].locked){

      x = refX - nodes[i].x;
      y = refY - nodes[i].y;
      break;
    }
  }

  groupDrag(x, y);
}


function loadHistory(el){
  var index;
  if(el.srcElement == undefined){
    //mozilla
    index = el.target.id;
  }else {
    //chrome
    index = el.srcElement.id;
  }
  index = parseInt(index);
  var index_temp = _.cloneDeep(index);
  histoty_pointer.forEach(function(del){
    if(index > del){
      index_temp--;
    }
  });
  console.log(index_temp);
  nodes = _.cloneDeep(historyNodeArray[index_temp]);
  paths = _.cloneDeep(historyPathArray[index_temp]);
  paths.forEach(function(path){
    path.setEndNode(nodes[path.getEndNode().name]);
    path.setStartNode(nodes[path.getStartNode().name]);
  });
  translateX = _.cloneDeep(historyNodeArray[index_temp].tX);
  translateY = _.cloneDeep(historyNodeArray[index_temp].tY);
  scaleFactor = _.cloneDeep(historyNodeArray[index_temp].scFa);
  currentPath = _.cloneDeep(historyPathArray[index_temp].curPth);

  //select this thumb
  $("#" + index  + " > span").attr('class', 'img_number_selected');
  $("#delete" + index).hide();
  //unselect every other thumb
  for (var i = 0; i < getThumbsId(); i++) {
    if(i != index){
      $("#" + i  + " > span").attr('class', 'img_number');
      $("#delete" + i).show();
    }
  }
}


function getThumbsId(){
  var thumbs_arr = [];
  $('div','#thumbs').each(function(){
      thumbs_arr.push($(this).attr('id'));
    });
    _.reverse(thumbs_arr);
    return (_.max(thumbs_arr) + 1 );
}



function deleteHistory(el){
  var index;
  if(el.srcElement == undefined){
    //mozilla
    index = el.target.id;
  }else {
    //chrome
    index = el.srcElement.id;
  }
  var parent = index.substr(6);
  parent = parseInt(parent);
  var x  = _.cloneDeep(parent);
  histoty_pointer.forEach(function(del){
    if(parent > del){
      x--;
    }
  });

  historyNodeArray.splice(x,1);
  historyPathArray.splice(x,1);

  console.log(historyNodeArray);


  histoty_pointer.push(parent);
  $("#" + index).parent().hide("fast", function(){
    $(this).remove();
  });
  el.stopPropagation();
}


var project_name;

function takeSnapshot(){
  var img;
  var img_num;
  var temp_div;
  project_name = $('#project_name').val();

  if(project_name != ''){
    $("#snapshot").prop("disabled", true);
    $("#snapshot").addClass('busy');
    saveFrames("out", "png", 1, 60, function(data){
      busy = true;

      historyNodeArray[historyNodeArray.length] = _.cloneDeep(nodes);
      historyNodeArray[historyNodeArray.length - 1].tX = _.cloneDeep(translateX);
      historyNodeArray[historyNodeArray.length - 1].tY = _.cloneDeep(translateY);
      historyNodeArray[historyNodeArray.length - 1].scFa = _.cloneDeep(scaleFactor);
      historyPathArray[historyPathArray.length] = _.cloneDeep(paths);
      historyPathArray[historyPathArray.length - 1].curPth = _.cloneDeep(currentPath);

      img = createImg(data[0].imageData);
      img.size(100,75);
      img.id(thumbs_counter);
      img.class("thumbs_img");

      img_delete = createImg('images/ic_clear_white_18px.svg');
      img_delete.id('delete' + thumbs_counter);
      img_delete.class('delete_ico');
      img_delete.mouseClicked(deleteHistory);

      img_num = createSpan(thumbs_counter);
      img_num.class('img_number');
      temp_div = createDiv('');

      img.parent(temp_div);
      img_num.parent(temp_div);
      img_delete.parent(temp_div);

      $("#delete" + thumbs_counter).hide();
      for (var i = 0; i < getThumbsId(); i++) {
        if(i != thumbs_counter){
          $("#delete" + i).show();
        }

      }

      temp_div.id(thumbs_counter);
      temp_div.class('img_container');
      temp_div.mouseClicked(loadHistory);

      $("#thumbs").prepend($("#" + thumbs_counter + ""));

      //unselect every thumb
      for (var i = 0; i < getThumbsId(); i++) {
        $("#" + i  + " > span").attr('class', 'img_number');
      }
      //select the newest thumb
      $("#" + thumbs_counter  + " > span").attr('class', 'img_number_selected');



      var now = new Date();
      now = now.getTime();

      var project = {
        name: project_name,
        date : now
      }

      if(new_project){
        ref_Project = database.ref('snapshot/users/' + userId + '/' + 'projects');
        projectId = ref_Project.push(project);
        ref_thumb = database.ref('snapshot/users/' + userId + '/' + 'projects/' + projectId.key);
        new_project = false;
        $("#project_name").prop('disabled', true);
      }

      var data = {
        number: thumbs_counter,
        image: data[0].imageData,
        nodes : JSON.stringify(nodes),
        paths : JSON.stringify(paths),
        translateX: translateX,
        translateY: translateY,
        scaleFactor: scaleFactor,
        currentPath: currentPath,
        date: now
      }

      ref_thumb.push(data);

      thumbs_counter++;
      $("#snapshot").removeAttr('disabled');
      $("#snapshot").removeClass('busy');
      $("#snapshot").addClass('snapshot');
    });

  }else {
    console.log('please enter a name for project!');
  }

}


function cancelDrawing(){
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



function keyPressed() {

  if (key == 'X') {
    if(!busy){
      takeSnapshot();
    }

  }


  if (keyCode === ENTER) {
    // nodes[selectedIndex].name = $("input:text").val();
    // $("input:text").val("");
    // $("input:text").fadeOut(200);
  }
  if (keyCode === ESCAPE) {
    // $("input:text").fadeOut(200);
    cancelDrawing();

    if(group_sel_drag == true){
      UndoGroupDrag();
      group_sel_drag = false;
    }



  }
  if (keyCode === DELETE) {

    //delete one node when mouse is over it
    if(mouseIsOnNode()){
      //delete the node from the array
      nodes.splice(overNow, 1);
      // $("input:text").fadeOut(200);
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

    //if mouse isn't over node or there are multiple nodes selected
    else{
      var nodes_to_del = [];
      //find the lockd nodes
      for (var i = 0; i < nodes.length; i++) {
        if(nodes[i].locked == true){
          nodes_to_del.push(nodes[i]);
        }
      }

      //delete the locked nodes (added to nodes_to_del)
      for (var i = 0; i < nodes.length; i++) {
        for (var j = 0; j < nodes_to_del.length; j++) {
          if(nodes[i] == nodes_to_del[j]){
            //before deleting a node, get the paths connecting to it
            getPathsOfNode(nodes[i]);
            nodes.splice(i,1);
            //delete all the paths of the deleted node
            for (var k = 0; k < pathsOfNode.length; k++) {
              for (var l = 0; l < paths.length; l++) {
                if(paths[l] == pathsOfNode[k]){
                  paths.splice(l,1);
                }
              }
            }

            pathsOfNode = [];
            currentPath = paths.length - 1;
            if(paths.length == 0){
              firstPath = true;
              currentPath = 0;
            }

          }
        }
      }
      nodes_to_del = [];

    }


    //delete path
    for (var i = 0; i < paths.length; i++) {
      isInPathRect(paths[i],i);
      if(overPath != undefined){
        paths.splice(overPath, 1);
        currentPath--;
        if(paths.length == 0){
          firstPath = true;
          currentPath = 0;
        }
      }
    }

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

  if (key == 'M' && LockCount() > 1) {
    group_sel_drag = true;
    calculateDeltas();
  }

  if (key == 'P') {
    $("input:radio[name='r'][value='path']").prop("checked",true);
    tool = 'path';
  }

  if (key == 'S') {
    $("input:radio[name='r'][value='select']").prop("checked",true);
    tool = 'select';
  }



  // if (key == 'M') {
  //   $("input:radio[name='r'][value='move']").prop("checked",true);
  //   tool = 'move';
  // }

  if(tool == 'move')
    $('html,body').css('cursor','move');
  else
    $('html,body').css('cursor','auto');

}
