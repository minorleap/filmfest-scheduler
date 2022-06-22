const rp = require('request-promise'),
  Screening = require('./screening.js'),
  Film = require('./film.js'),
  venues = require('./venues.js');

const getScreenings = async (feedURL) => {
  try {
    let feedData = await rp({url: feedURL, json: true});
    let screeningData = feedData.feed.Events.Event;
    let screenings = [];
    screeningData.forEach(screening => {
      //filter out sold out screenings
      //if (screening['SoldOut'].includes('true')) return;

      //create film objects
      let filmId = screening['Show']['Code'];
      let title = screening['Show']['Name'];
      let category = screening['Show']['ShowTypeName'];
      let description = screening['Show']['DetailText'];
      let imageURL = screening['Show']['SmallImageUrl'];
      let film = new Film(filmId, title, category, description, imageURL);

      //create film objects
      let screeningId = screening['EventLocalId']
      let start = new Date(screening['EventDate']['#text']);
      let duration = parseInt(screening['Show']['LongMinutes']);
      let venue = screening['VenueName'];
      let travel_times = venues[venue];
      let screeningObj = new Screening(screeningId, film, start, duration, venue, travel_times);
      screenings.push(screeningObj);
    });
    return screenings;
  } catch(error) {
    console.log('error fetching screenings');
    console.log(error.message);
    throw error;
  }
};

module.exports = {
  getScreenings: getScreenings,
}
