class Graph {
  constructor() {
    this.vertices = {};
    // {screeningId: {weight: weight, filmNeighbours: [screeningId], overlapNeighbours: [screeningId]}}
  }

  addVertex(screeningId, weight) {
    this.vertices[screeningId] = {weight: weight, filmNeighbours: [], overlapNeighbours: []};
  }

  addEdge(screening1, screening2, isOverlap, isSameFilm) {
    if (isSameFilm) {
      this.vertices[screening1].filmNeighbours.push(screening2);
      this.vertices[screening2].filmNeighbours.push(screening1);
    }
    if (isOverlap) {
      this.vertices[screening1].overlapNeighbours.push(screening2);
      this.vertices[screening2].overlapNeighbours.push(screening1);
    }
  }

  removeVertex(vertex) {
    //remove edges
    let filmNeighbours = this.vertices[vertex].filmNeighbours;
    for (let neighbour of filmNeighbours) {
      let i = this.vertices[neighbour].filmNeighbours.indexOf(vertex);
      this.vertices[neighbour].filmNeighbours.splice([i], 1);
    }
    let overlapNeighbours = this.vertices[vertex].overlapNeighbours;
    for (let neighbour of overlapNeighbours) {
      let i = this.vertices[neighbour].overlapNeighbours.indexOf(vertex);
      this.vertices[neighbour].overlapNeighbours.splice([i], 1);
    }
    //remove vertex
    delete this.vertices[vertex];
  }

  selectVertex(vertex) {
    //delete neighbours
    let overlapNeighbours = this.vertices[vertex].overlapNeighbours;
    while(overlapNeighbours.length) {
      let overlapNeighbour = overlapNeighbours[0];
      this.removeVertex(overlapNeighbour);
    }

    let filmNeighbours = this.vertices[vertex].filmNeighbours;
    while (filmNeighbours.length) {
      this.removeVertex(filmNeighbours[0]);
    }

    //delete self
    this.removeVertex(vertex);

    //return self
    return vertex;
  }


  /*
   * return any vertices that have no neighbours
   */
  getDisjointVertices() {
    let result = [];
    for (let vertex in this.vertices) {
      if (
        !this.vertices[vertex].overlapNeighbours.length &&
        !this.vertices[vertex].filmNeighbours.some(neighbour => {
          return result.includes(neighbour);
        })
      )
      {
        result.push(vertex);
      }
    }
    return result;
  }

  /*
   * find the vertex with the smallest conflict weight
   */
  getMinConflict() {
    let maxValue = Number.NEGATIVE_INFINITY, maxVertex = 0;
    for (let vertex in this.vertices) {
      let value = this.vertices[vertex].weight;
      let conflictsValue = 0;
      for (let neighbour of this.vertices[vertex].overlapNeighbours) {
        conflictsValue += this.vertices[neighbour].weight;
      }
      value -= conflictsValue;
      if (value > maxValue) {
        maxValue = value;
        maxVertex = vertex;
      }
    };
    return maxVertex;
  }

}

module.exports = Graph;
