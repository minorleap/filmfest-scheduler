const Graph = require('./graph.js');
let g = new Graph();
g.addVertex(1, 1);
g.addVertex(2, 2);
g.addVertex(3, 3);
g.addVertex(4, 2);
g.addEdge(1, 3, false, true);
g.addEdge(2, 1, true, false);
g.addEdge(2, 4, true, true);
