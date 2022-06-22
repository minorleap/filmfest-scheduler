class Film {
  constructor(id, title, category, description, imageURL) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.description = description;
    this.imageURL = imageURL;
  }

  equals(aFilm) {
    return this.id === aFilm.id;
  }
}

module.exports = Film;
