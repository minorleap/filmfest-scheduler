const parser = require('./parser.js');
const feedURL = 'http://localhost:3001/2019.json';
let screenings;
parser.getScreenings(feedURL).then(results => {
  screenings = results;
  });

const getScreeningById = id => {
  for (let screening of screenings) {
    if (screening.id == id) {
      return screening;
    }
  }
}
