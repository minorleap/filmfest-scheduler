class DiGraph {
  constructor() {
    this.vertices = {}; // {screeningId: filmId, incomingEdges, outgoingEdges}
    /*
    outgoingEdges: {screeningId: weight}
    incomingEdges: [screeningId]
    */
  }

  addVertex(screeningId, filmId) {
    this.vertices[screeningId] = {'filmId': filmId, 'incomingEdges': [], 'outgoingEdges': {}};
  }

  addEdge(origin, destination, weight) {
    this.vertices[origin].outgoingEdges[destination] = weight;
    this.vertices[destination].incomingEdges.push(origin);
  }

  removeVertex(screeningId) {
    this.vertices[screeningId].incomingEdges.forEach(incomingId => {
      delete this.vertices[incomingId].outgoingEdges[screeningId];
    });
    Object.keys(this.vertices[screeningId].outgoingEdges).forEach(outgoingId => {
      this.vertices[outgoingId].incomingEdges = this.vertices[outgoingId].incomingEdges.filter(screening => screening != screeningId);
    });
    delete this.vertices[screeningId];
  }

  topologicalSort(vertex, visited, vertexStack) {
    visited[vertex] = true;
    Object.keys(this.vertices[vertex].outgoingEdges).forEach(neighbour => {
      if (visited[neighbour] === false) {
        this.topologicalSort(neighbour, visited, vertexStack);
      }
    })
    vertexStack.push(vertex);
  }

  longestPath(start) {
    let vertexStack = [];

    let parent = {};
    Object.keys(this.vertices).forEach(vertex => {
      parent[vertex] = -1;
    })

    let visited = {};
    Object.keys(this.vertices).forEach(vertex => {
      visited[vertex] = false;
    })

    Object.keys(this.vertices).forEach(vertex => {
      if (visited[vertex] === false) {
        this.topologicalSort(vertex, visited, vertexStack);
      }
    })

    let distances = {};
    Object.keys(this.vertices).forEach(vertex => {
      distances[vertex] = Number.NEGATIVE_INFINITY;
    })
    distances[start] = 0;

    while(vertexStack.length) {
      let vertex = vertexStack.pop();
      if (distances[vertex] != Number.NEGATIVE_INFINITY) {
        Object.keys(this.vertices[vertex].outgoingEdges).forEach(neighbour => {
          let distanceNeighbour = distances[neighbour];
          if (distances[neighbour] < distances[vertex] + this.vertices[vertex].outgoingEdges[neighbour]) {
            distances[neighbour] = distances[vertex] + this.vertices[vertex].outgoingEdges[neighbour];
            parent[neighbour] = vertex;
          }
        })
      }
    }

    let furthestDistance = 0, furthestVertex = start;
    for (let vertex in distances) {
      if (distances[vertex] > furthestDistance) {
        furthestDistance = distances[vertex], furthestVertex = vertex;
      }
    }


    let i = furthestVertex;
    let j = furthestVertex;
    let path = [];
    while(parent[j] !== -1) {
      path.push(j);
      j = parent[j];
    }
    if (distances[i] != Number.NEGATIVE_INFINITY) {
      //path.push(start);
    }
    let result = {};
    while (path.length) {
      let vertex = path.pop();
      result[vertex] = this.vertices[vertex].filmId;
    }
    return result;
  }
}

module.exports = DiGraph;
