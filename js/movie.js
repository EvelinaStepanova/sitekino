const API_KEY = "9cf06b14-d32a-4048-877a-23727fb3f814";

const params = new URLSearchParams(window.location.search);

const similarMoviesCards = document.querySelector(".similar-movies__cards");
let similarPage = 1;
let similarYear = null;
let isSimilarLoading = false;
let similarCount = 0;
const MAX_SIMILAR = 8;
let hasMoreSimilarMovies = true;

// Функция загрузки фильма
async function get_movie() {
    const movieId = params.get("id");

    if (!movieId) {
        console.error("ID фильма не найден");
        return;
    }
    try {
        const res = await fetch(
            `https://kinopoiskapiunofficial.tech/api/v2.2/films/${movieId}`,
            {
                method: "GET",
                headers: {
                    "X-API-KEY": API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!res.ok) {
            throw new Error("Ошибка! " + res.status);
        }
        const data = await res.json();
        renderMovie(data);
        getActors(movieId);

    } catch (error) {
        console.error(error);
    }
}


function renderMovie(data) {
    document.querySelector(".movie-detail__title").textContent =
        data.nameRu || data.nameEn || "Название неизвестно";

    const poster = document.querySelector(".movie-detail__poster");
    poster.src = data.posterUrl || data.posterUrlPreview || "";
    poster.alt = data.nameRu || data.nameEn || "Постер фильма";

    document.querySelector(".movie__desc").textContent =
        data.description || "Описание отсутствует";


    document.querySelector(".movie__genres").textContent =
        data.genres && data.genres.length
            ? data.genres
                .map(function (element) {
                    return element.genre;
                })
                .join(", ")
            : "Жанры не указаны";

    document.querySelector(".movie_fact-text.year").textContent =
        data.year || "—";

    document.querySelector(".movie_fact-text.age").textContent =
        data.ratingAgeLimits
            ? data.ratingAgeLimits.replace("age", "") + "+"
            : "—";

    document.querySelector(".movie_fact-text.timing").textContent =
        data.filmLength
            ? data.filmLength + " мин"
            : "—";
    document.querySelector(".movie_fact-text.raiting").textContent =
        data.ratingKinopoisk || "—";

    similarYear = data.year;

    renderStars(data.ratingKinopoisk);
}



function renderStars(ratingValue) {
    const movieRating = document.querySelectorAll(".movie__rating svg");
    const rating = parseFloat(ratingValue) || 0;
    const fullStars = Math.floor(rating);
    const fraction = rating - fullStars;

    movieRating.forEach(function (star, index) {
        const starFill = star.querySelector(".star-fill");

        if (index < fullStars) {
            starFill.style.fill = "var(--color-accent)";
            starFill.style.opacity = "1";
        }

        else if (index === fullStars && fraction > 0) {
            const percent = fraction * 100;
            const gradientId = `star-gradient-${index}`;
            starFill.style.fill = `url(#${gradientId})`;
            starFill.style.opacity = "1";
            star.insertAdjacentHTML("afterbegin", `
                <defs>
                    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="${percent}%" stop-color="var(--color-accent)"></stop>
                        <stop offset="${percent}%" stop-color="transparent"></stop>
                    </linearGradient>
                </defs>
            `);
        }
        else {
            starFill.style.fill = "transparent";
            starFill.style.opacity = "1";
        }
    });
}


function renderActors(actors) {
    const actorsList = document.querySelector(".movie__actors-list");

    actorsList.innerHTML = "";
    //Эта строка получает id фильма из адресной строки
    const movieId = params.get("id"); // 👈 добавили ОДНУ строку

    const onlyActors = actors.filter(function (person) {
        return person.professionKey === "ACTOR";
    });

    const topActors = onlyActors.slice(0, 5);

    topActors.forEach(function (actor) {
        const li = document.createElement("li");
        li.classList.add("movie__actors-name");
        const link = document.createElement("a");
        link.textContent = actor.nameRu || actor.nameEn || "Без имени";
        // Эта строка создаёт ссылку для перехода на страницу актеров.
        link.href = `actors.html?filmId=${movieId}&actorId=${actor.staffId}`;
        li.append(link);
        actorsList.append(li);
    });
}


async function getActors(movieId) {
    try {
        const res = await fetch(
            `https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=${movieId}`,
            {
                method: "GET",
                headers: {
                    "X-API-KEY": API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            throw new Error("Ошибка загрузки актёров");
        }

        const data = await res.json();
        renderActors(data);

    } catch (error) {
        console.error(error);
    }
}


async function getSimilarMovies() {
    if (
        !similarYear ||
        isSimilarLoading ||
        similarCount >= MAX_SIMILAR ||
        !hasMoreSimilarMovies
    ) {
        return;
    }

    isSimilarLoading = true;


    try {
        const res = await fetch(
            `https://kinopoiskapiunofficial.tech/api/v2.2/films?yearFrom=${similarYear}&yearTo=${similarYear}&page=${similarPage}`,
            {
                method: "GET",
                headers: {
                    "X-API-KEY": API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!res.ok) {
            throw new Error("Ошибка загрузки похожих фильмов");
        }
        const data = await res.json();
        if (!data.items || data.items.length === 0) {
            hasMoreSimilarMovies = false;
            return;
        }
        const remaining = MAX_SIMILAR - similarCount;
        const movies = data.items.slice(0, remaining);
        renderSimilarMovies(movies);
        similarCount += movies.length;
        similarPage++;
        if (movies.length < remaining) {
            hasMoreSimilarMovies = false;
        }
    } catch (error) {
        console.error(error);
    } finally {
        isSimilarLoading = false;
    }
}

function renderSimilarMovies(movies) {
    movies.forEach(function (movie) {
        const movieCard = document.createElement("article");
        movieCard.classList.add("movie-card", "movie-card--fade");
        movieCard.innerHTML = `
            <img 
                class="movie-card__poster" 
                src="${movie.posterUrlPreview || movie.posterUrl || ""}" 
                alt="${movie.nameRu || movie.nameEn || "Постер фильма"}"
            >

            <div class="movie-card__content">
                <h3 class="movie-card__title">
                    ${movie.nameRu || movie.nameEn || "Название неизвестно"}
                </h3>

                <div class="movie-card__bottom">
                    <span class="movie-card__year">
                        ${movie.year || "—"}
                    </span>

                    <span class="movie-card__rating">
                        ${movie.ratingKinopoisk || "—"}
                    </span>
                </div>

                <a class="movie-card__button" href="movies.html?id=${movie.kinopoiskId}">
                    Подробнее
                </a>
            </div>
        `;

        similarMoviesCards.append(movieCard);
        setTimeout(function () {
            movieCard.classList.add("movie-card--show");
        }, 100);
    });
}


window.addEventListener("scroll", function () {
    if (
        !similarMoviesCards ||
        similarCount >= MAX_SIMILAR ||
        !hasMoreSimilarMovies
    ) {
        return;
    }

    const blockPosition = similarMoviesCards.getBoundingClientRect().top;

    const screenHeight = window.innerHeight;
    if (blockPosition < screenHeight - 100) {
        getSimilarMovies();
    }
});



window.addEventListener("load", function () {
    get_movie();
});