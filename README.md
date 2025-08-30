# Bokportalen

## Api-endpoints

### GET /books

Hämtar alla böcker. Kan filtreras med hjälp av parameterar. Svaret är dock alltid en array. Följande filtreringar är tillåtna:

* title
* authorFirstName
* authorLastName
* yearWritten
* language
* originalLanguage
* genre
* format
* isbn
* status
* rating

T.ex.:
`http://localhost:3000/books?authorFirstName=Helene&authorLastName=Gullberg`

### GET /books/{id}

Hämtar bok baserat på ID. Returnerar ett objekt.

### POST /books

Lägger till bok. Kräver body i följande format:

```json
{
   "title": "Hemvandrarna",
   "authors": [7034],
   "yearWritten": 2003,
   "isbn": 873874287438,
   "language": "Svenska",
   "originalLanguage": "Svenska",
   "genre": "Roman",
   "format": "Pocket"
}
```

### GET /authors

Hämtar alla författare. Kan filtreras utifrån för- och efternamn med firstName och lastName som query-parameterar. Returnerar dock alltid en array. T.ex.: 
```
http://localhost:3000/authors?lastName=Andersson
http://localhost:3000/authors?firstName=Vilhelm&lastName=Moberg
```

### GET /authors/{id}

Hämtar en författare baserat på ID. Returnerar ett objekt med författaren.

### GET /countries

Hämtar alla länder.

### GET /languages

Hämtar alla språk.

### GET /languages/{id}

Hämtar språk baserat på ID.

### GET /genres

Hämtar alla genrer.