const DiGraph = require('./digraph.js');
g = new DiGraph();
g.addVertex(1, 11);
g.addVertex(2, 22);
g.addVertex(3, 33);
g.addVertex(4, 44);
g.addVertex(5, 55);
g.addVertex(6, 66);
g.addVertex(7, 77);

g.addEdge(1, 2, 1);
g.addEdge(1, 5, 3);
g.addEdge(2, 3, 1);
g.addEdge(2, 4, 3);
g.addEdge(3, 4, 3);
g.addEdge(5, 4, 3);
g.addEdge(5, 6, 1);
g.addEdge(5, 7, 1);
g.addEdge(6, 7, 1);
