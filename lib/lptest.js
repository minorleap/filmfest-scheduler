const scheduler = require('./scheduler.js');

let prioritisedScreenings = [];

let films = {
  "Edinburgh & Lothians Schools Film Competition - Primary": 10,
  "McLaren Animation 2": 1,
  "Volcano ": 10,
  "Bunuel in the Labyrinth of the Turtles (Buñuel en el laberinto de las tortugas)": 10,
  "God Exists, Her Name Is Petrunya (Gospod postoi, imeto i' e Petrunija)": 1,
  "The Mystery of Henri Pick (Le mystère Henri Pick)": 100,
  "Her Job (I Doulia tis)": 10,
  "Marshland (La isla mínima)": 10,
  "Body at Brighton Rock": 100
};

for (let screening of screenings) {
  if (films.hasOwnProperty(screening.film.title)
  && screening.start.getDate() == 29) {
    screening.priority = films[screening.film.title];
    prioritisedScreenings.push(screening);
  }
}
