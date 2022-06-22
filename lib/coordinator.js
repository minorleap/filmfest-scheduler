const parser = require('./parser.js'),
  feedURL = 'http://localhost:3001/2019.json',
  scheduler = require('./scheduler.js');
let screenings;

parser.getScreenings(feedURL)
  .then(results => {
    console.log('Screenings loaded\n');
    screenings = results;
  });

const getFormattedDates = () => {
  let dates = [];
  screenings.forEach(screening => {
    if (!dates.includes(screening.getFormattedDate())) {
      dates.push(screening.getFormattedDate());
    }
  });
  return dates;
};

const getCategories = (dates) => {
  let filteredScreenings = filterByDate(screenings, dates);
  let categories = [];
  filteredScreenings.forEach(screening => {
    if (!categories.includes(screening.film.category)) {
      categories.push(screening.film.category);
    }
  });
  return categories.sort();
};

const getFilms = (dates, categories) => {
  let filteredScreenings = filterByCategory(filterByDate(screenings, dates), categories);
  let films = [];
  filteredScreenings.forEach(screening => {
    if (!films.some(film => film.id == screening.film.id)) {
      films.push(screening.film);
    }
  });
  return films.sort(sortFilms);
};

const getSelectedFilms = (dates, categories, filmIds) => {
  let filteredScreenings = filterByFilmId(filterByCategory(filterByDate(screenings, dates), categories), filmIds);
  let selectedFilms = [];
  filteredScreenings.forEach(screening => {
    if (!selectedFilms.some(film => film.id == screening.film.id)) {
      selectedFilms.push(screening.film);
    }
  });
  return selectedFilms.sort(sortFilms);
};

const getPrioritisedScreenings = (dates, filmIds, priorities) => {
  let filteredScreenings = filterByDate(filterByFilmId(screenings, filmIds), dates);
  filteredScreenings.forEach(screening => {
    screening.priority = priorityMap(priorities[screening.film.id]);
  });
  return filteredScreenings;
};

const getSchedule = (dates, categories, priorities) => {

  const countTopPriorityCombinations = screenings => {
    // find highest priority value among screenings
    let topPriority = -1;
    for (let screening of prioritisedScreenings) {
      if (screening.priority > topPriority) {
        topPriority = screening.priority;
      }
    }

    // filter top-priority screenings
    let topPriorityScreenings = screenings.filter(screening => {
      return screening.priority == topPriority;
    })

    // map top priority films to their quantity of screenings
    let topPriorityFilms = {}
    for (let screening of topPriorityScreenings) {
      if (topPriorityFilms.hasOwnProperty(screening.film.id)) {
        topPriorityFilms[screening.film.id]++;
      } else {
        topPriorityFilms[screening.film.id] = 1;
      }
    }

    // find number of combinations of top-priority screenings
    let topPriorityCombinations = Object.values(topPriorityFilms).reduce((a,b) => a * b, 1);
    console.log(`Top priority combinations: ${topPriorityCombinations}`);
    return topPriorityCombinations;
  }
  // check that some priorities have been set before scheduling
  if (!Object.keys(priorities).length) {
    return [];
  }

  let prioritisedScreenings = getPrioritisedScreenings(dates, categories, priorities);
  // don't schedule if there are no screenings
  if (!prioritisedScreenings.length) {
    return [];
  }
  // if all screenings have the same priority, use RLP
  if (prioritisedScreenings.every(screening => {
    return screening.priority == prioritisedScreenings[0].priority;
  })) {
    console.log('Generating schedule via Recursive Longest Path algorithm');
    let schedule = scheduler.recursiveLongestPath(prioritisedScreenings);
    console.log(`Score: ${scheduler.getScore(schedule)}`);
    return schedule;
  }
  // if the number of top-priority films is below the threshold, use topDown
  if (countTopPriorityCombinations(prioritisedScreenings) < 3000) {
    console.log('Generating schedule via Top Down algorithm');
    let schedule = scheduler.topDown(prioritisedScreenings, scheduler.recursiveLongestPath);
    console.log(`Score: ${scheduler.getScore(schedule)}`);
    return schedule;
  }
  // if the number of top-priority films is above the threshold, use minConflict
  else {
    console.log('Generating schedule via Minimum Conflict algorithm');
    let schedule = scheduler.minConflict(prioritisedScreenings);
    console.log(`Score: ${scheduler.getScore(schedule)}`);
    return schedule;
  }
};

const getScreeningsById = (screeningIds) => {
  let filteredScreenings = filterByScreeningId(screenings, screeningIds);
  return filteredScreenings;
};

const filterByDate = (screenings, dates) => {
  return screenings.filter(screening => {
    return dates.some(date => isSameDate(date, screening.start))
  })
};

const filterByCategory = (screenings, categories) => {
  return screenings.filter(screening => {
    return categories.includes(screening.film.category);
  })
};

const filterByFilmId = (screenings, filmIds) => {
  return screenings.filter(screening => {
    return filmIds.includes(screening.film.id);
  })
};

const filterByScreeningId = (screenings, screeningIds) => {
  return screenings.filter(screening => {
    return screeningIds.includes(screening.id);
  })
};

const isSameDate = (date1, date2) => {
  if (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getYear() === date2.getYear()
  ) {
    return true;
  } else {
    return false;
  }
};

const sortFilms = (film1, film2) => {
    if (film1.title < film2.title) return -1;
    if (film1.title > film2.title) return 1;
    else return 0;
};

const priorityMap = priority => {
  if (priority === 'high') return 100;
  if (priority === 'medium') return 10;
  if (priority === 'low') return 1;
  else {
    console.log(`Invalid priority: ${priority}`);
    return -1;
  }
};

module.exports = {
  getFormattedDates: getFormattedDates,
  getCategories: getCategories,
  getFilms: getFilms,
  getSelectedFilms: getSelectedFilms,
  getPrioritisedScreenings: getPrioritisedScreenings,
  getSchedule: getSchedule,
  getScreeningsById: getScreeningsById
};
