const moment = require('moment');

class Screening {
  constructor(id, film, start, duration, venue, travel_times) {
    this.id = id;
    this.film = film;
    this.start = start;
    this.duration = duration;
    this.end = new Date(start.getTime() + duration*60000);
    this.venue = venue;
    this.travel_times = travel_times;
  }

  canPrecede(screening) {
    let travel_mins = this.travel_times[screening.venue];
    let arrive = new Date(this.end.getTime() + travel_mins*60000);
    return (arrive <= screening.start);
  }

  getFormattedDate() {
    return moment(this.start).format('dddd Do MMMM YYYY');
  }

  getFormattedDatetime() {
    return moment(this.start).format('dddd Do MMMM kk:mm');
  }

  overlapsWith(screening) {
    return !(this.canPrecede(screening) || screening.canPrecede(this));
  }

  isIncompatibleWith(screening) {
    if (this === screening) {
      return false; // so that topDown passes screenings in the partial schedule down to the inner algorithm
    }
    return this.film.id === screening.film.id || this.overlapsWith(screening);
  }


}

module.exports = Screening;
