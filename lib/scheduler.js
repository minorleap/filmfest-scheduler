const Screening = require('./screening.js'),
  Graph = require('./graph.js'),
  DiGraph = require('./digraph.js'),
  parser = require('./parser.js'),
  itertools = require('iter-tools'),
  clonedeep = require('lodash.clonedeep');

const getScore = schedule => {
  let score = 0;
  for (let screening of schedule) {
    score += screening.priority;
  }
  return score;
};

const printSchedule = schedule => {
  console.log(`Score: ${getScore(schedule)}`);
  let screeningsByDate = getScreeningsByDate(schedule);
  for (let festDate in screeningsByDate) {
    console.log(screeningsByDate[festDate][0].getFormattedDate() + '\n');
    for (let screening of screeningsByDate[festDate]) {
      console.log(`${screening.film.title}: ${screening.venue} at ${screening.start.getUTCHours()}:${screening.start.getUTCMinutes()}`);
    }
    console.log('\n');
  }
};

const getScreeningsByDate = screenings => {
  let screeningsByDate = {};
  for (let screening of screenings) {
    let festDate = new Date(screening.start.getFullYear(), screening.start.getMonth(), screening.start.getDate());
    if (!screeningsByDate.hasOwnProperty(festDate)) {
      screeningsByDate[festDate] = [screening];
    } else {
      screeningsByDate[festDate].push(screening);
    }
  }
  return screeningsByDate;
};

// takes an array of arrays of screening IDs and returns
// the highest-scoring one
const getBestSchedule = (screenings, schedules) => {
  let priorities = {};

  for (let screening of screenings) {
    priorities[screening.id] = screening.priority;
  }
  let bestScore = 0;
  let bestSchedule = 0;
  for (let [i, schedule] of schedules.entries()) {
    let score = 0;
    for (let screeningId of schedule) {
      score += priorities[screeningId];
    }
    if (score > bestScore) {
      bestScore = score;
      bestSchedule = i;
    }
  }
  return schedules[bestSchedule];
};

const minConflict = screenings => {
  //make a graph of the screenings
  let schedule = [];
  let g = new Graph();

  //add vertices for each screening
  for (let screening of screenings) {
    g.addVertex(screening.id, screening.priority);
  }

  //add edges for screenings of the film same or that overlap
  let pairs = itertools.combinations(screenings, 2);
  for ([i, j] of pairs) {
    isOverlap = !(i.canPrecede(j) || j.canPrecede(i));
    isSameFilm = (i.film.id === j.film.id);
    if (isOverlap || isSameFilm) {
      g.addEdge(i.id, j.id, isOverlap, isSameFilm);
    }
  }
  //find the approximate max-weight independent set
  while(Object.keys(g.vertices).length) { //this defines order
    let disjointVertices = g.getDisjointVertices();
    if (disjointVertices.length) {
      for (let disjointVertex of disjointVertices) {
        schedule.push(g.selectVertex(disjointVertex));
      }
      continue;
    }
    let mc = g.getMinConflict();
    let selectedVertex = g.selectVertex(mc);
    schedule.push(selectedVertex);
    //schedule.push(g.selectVertex(g.getMinConflict()));
  }

  //return the corresponding schedule of screenings
  screenings = screenings.filter(screening => {
    return schedule.includes(screening.id);
  });
  return screenings;
};

const recursiveLongestPath = screenings => {
  // Create one directed graph per day, each with one vertex per event plus one source node
  const makeGraphs = screeningsByDate => {
    let graphsByDate = [];
    for (let festDate in screeningsByDate) {
      let g = new DiGraph();
      // add a source vertex
      g.addVertex('source', 'source');
      // add one node per screening
      for (let screening of screeningsByDate[festDate]) {
        g.addVertex(screening.id, screening.film.id);
        // add a weighted edge from the start vertex to the screening vertex
        g.addEdge('source', screening.id, screening.priority);
      }
      for (let [u, v] of itertools.permutations(screeningsByDate[festDate], 2)) {
        if (u.canPrecede(v)) {
          g.addEdge(u.id, v.id, v.priority);
        }
      }
      graphsByDate.push(g);
    }
    return graphsByDate;
  };

  let schedules = [];
  let firstPass = {
    graphs: makeGraphs(getScreeningsByDate(screenings)),
    schedule: [],
    films: {}
  };
  let queue = [firstPass];

  while(queue.length) {
    let currentPass = queue.pop();
    let day = 0;
    while (day < currentPass.graphs.length) {
      let graph = currentPass.graphs[day];
      let path = graph.longestPath('source');
      let dupe;
      for (let screeningId in path) {
        if (currentPass.films.hasOwnProperty(path[screeningId])) {
          // found a duplicate
          dupe = {filmId: path[screeningId], screeningId: screeningId};
          break;
        }
      }
      if (dupe) {
        let earlyDupe = currentPass.films[dupe.filmId];
        let alternativePass = {
          graphs: clonedeep(currentPass.graphs),
          schedule: [],
          films: {}
        };
        alternativePass.graphs[earlyDupe.day].removeVertex([earlyDupe.screeningId]);
        currentPass.graphs[day].removeVertex(dupe.screeningId);
        queue.push(alternativePass);
        continue;
      }
      Object.keys(path).forEach(screeningId => {
        let filmId = path[screeningId];
        currentPass.films[filmId] = {day: day, screeningId: screeningId};
        currentPass.schedule.push(screeningId);
      })
      day++;
    }
    schedules.push(currentPass.schedule);
  }

  let schedule = getBestSchedule(screenings, schedules);
  screenings = screenings.filter(screening => {
    return schedule.includes(screening.id);
  });
  return screenings;
};

const topDown = (screenings, innerAlgorithm) => {

  const filterMaximalSchedules = schedules => {
    let maxScore = 0;
    for (let schedule of schedules) {
      let score = getScore(schedule);
      if (score > maxScore) {
        maxScore = score;
      }
    }
    return schedules.filter(schedule => {
      return getScore(schedule) === maxScore;
    });
  };

  const makeGraph = screenings => {
    let g = new DiGraph();
    // add a source vertex
    g.addVertex('source', 'source');
    // add one node per screening
    for (let screening of screenings) {
      g.addVertex(screening.id, screening.film.id);
      // add a weighted edge from the start vertex to the screening vertex
      g.addEdge('source', screening.id, screening.priority);
    }
    for (let [u, v] of itertools.permutations(screenings, 2)) {
      if (u.canPrecede(v)) {
        g.addEdge(u.id, v.id, v.priority);
      }
    }
    return g;
  };

  const exhaustiveSearch = screenings => {
    let films = {};
    for (let screening of screenings) {
      if (films.hasOwnProperty(screening.film.id)) {
        films[screening.film.id].push(screening);
      } else {
        films[screening.film.id] = [screening];
      }
    }

    let schedules = [];
    for (let combination of itertools.product(...Object.values(films))) {
      let g = makeGraph(combination);
      let path = g.longestPath('source');
      let schedule = [];
      for (let screeningId of Object.keys(path)) {
        schedule.push(screeningId);
      }
      schedule = schedule.map(screeningId => {
        return screeningsMap[screeningId];
      })
      schedules.push(schedule);
    }
    return schedules; // arrays of screenings
  };

  let highPriority = 0;
  for (let screening of screenings) {
    if (screening.priority > highPriority) {
      highPriority = screening.priority;
    }
  }
  let highPriorityScreenings = screenings.filter(screening => {
    return screening.priority === highPriority;
  });

  const screeningsMap = {};
  for (let screening of highPriorityScreenings) {
    screeningsMap[screening.id] = screening;
  }

  let partialSchedules = filterMaximalSchedules(exhaustiveSearch(highPriorityScreenings));
  console.log(`${partialSchedules.length} candidate solutions`);

  let finalSchedules = [];
  for (let partialSchedule of partialSchedules) {
    let compatibleEvents = screenings.filter(screening => {
      return !partialSchedule.some(scheduledScreening => {
        return scheduledScreening.isIncompatibleWith(screening);
      });
    });
    let finalSchedule = innerAlgorithm(compatibleEvents);
    finalSchedules.push(finalSchedule);
  }
  let bestSchedule = 0;
  let bestScore = 0;
  for (let [i, schedule] of finalSchedules.entries()) {
    let score = getScore(schedule);
    if (score > bestScore) {
      bestScore = score;
      bestSchedule = i;
    }
  }
  return finalSchedules[bestSchedule];
};

module.exports = {
  getScore: getScore,
  printSchedule: printSchedule,
  minConflict: minConflict,
  recursiveLongestPath: recursiveLongestPath,
  topDown: topDown
};
