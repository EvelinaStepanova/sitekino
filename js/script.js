const burgerButton = document.querySelector('.header__burger');
const mobileMenu = document.querySelector('.header__mobile-menu');


if (burgerButton && mobileMenu) {
    burgerButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('active');

    });
}
//изменяем
var API_KEY = "9cf06b14-d32a-4048-877a-23727fb3f814";
const moviesList = document.querySelector(".movies__list");
const prevButton = document.querySelector(".movies__pagination-prev");
const nextButton = document.querySelector(".movies__pagination-next");


let currentPage = 1;
let totalPages = 1;


async function getPopularMovies(page) {
    if (!moviesList || !prevButton || !nextButton) {
        return;
    }
    try {
        moviesList.innerHTML = "<p>Загрузка фильмов...</p>";

        prevButton.disabled = true;
        nextButton.disabled = true;


        const response = await fetch(
            `https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_ALL&page=${page}`,
            {
                method: "GET",
                headers: {
                    "X-API-KEY": API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Ошибка при загрузке фильмов");
        }

        const data = await response.json();

        totalPages = data.totalPages || totalPages;

        const movies = data.items.slice(0, 12);

        if (movies.length === 0) {
               moviesList.innerHTML = "<p>Фильмы не найдены.</p>";
            return;
        }

        renderMovies(movies);
        updatePaginationButtons();

    } catch (error) {
        moviesList.innerHTML = "<p>Не удалось загрузить фильмы. Попробуйте позже.</p>";
        console.error(error);
        updatePaginationButtons();
    }
}

function updatePaginationButtons() {
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;
}

function renderMovies(movies) {
    moviesList.innerHTML = "";

    movies.forEach(function (movie) {
        const movieCard = document.createElement("article");
        movieCard.classList.add("movie-card");

        movieCard.innerHTML = `
            <img 
                class="movie-card__poster" 
                src="${movie.posterUrlPreview || ""}" 
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
                <a class="movie-card__button" href="movies.html?id=${movie.kinopoiskId}"> Подробнее </a>
            </div>
            
        `;

        moviesList.append(movieCard);
    });
}

if (nextButton) {
    nextButton.addEventListener("click", function () {
        if (currentPage < totalPages) {
            currentPage++;

            getPopularMovies(currentPage);

            // Плавно прокручиваем страницу к блоку с фильмами
            // window — это окно браузера.
            // scrollTo() — это команда браузеру: “прокрути страницу в нужное место”.
            window.scrollTo({
                // top отвечает за то, на какую высоту сверху страницы нужно прокрутиться
                // moviesList — это наш контейнер с фильмами:
                // offsetTop — положение элемента по вертикали
                // А offsetTop показывает, на каком расстоянии от верхнего края страницы находится этот блок.
                top: moviesList.offsetTop - 100,
                // behavior отвечает за поведение прокрутки
                // smooth — плавная прокрутка
                behavior: "smooth",
            });
        }
    });
}

// Проверяем, что кнопка назад существует
if (prevButton) {
    // Добавляем обработчик клика на кнопку назад
    prevButton.addEventListener("click", function () {
        // Проверяем, что мы не на первой странице
        if (currentPage > 1) {
            // Уменьшаем номер текущей страницы
            currentPage--;

            // Загружаем фильмы для новой страницы
            getPopularMovies(currentPage);

            // Плавно прокручиваем страницу к блоку с фильмами
            window.scrollTo({
                top: moviesList.offsetTop - 100,
                behavior: "smooth",
            });
        }
    });
}

// Проверяем, что все элементы блока фильмов существуют
if (moviesList && prevButton && nextButton) {
    // Загружаем первую страницу фильмов
    getPopularMovies(currentPage);
}


// ================= ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ =================

// Находим все ссылки с классом js-scroll
const scrollLinks = document.querySelectorAll(".js-scroll");

// Перебираем каждую ссылку
scrollLinks.forEach(function (link) {
    // Вешаем обработчик клика
    link.addEventListener("click", function (event) {
        // Отменяем стандартный резкий переход
        event.preventDefault();

        // Получаем значение href (например "#about")
        const targetId = link.getAttribute("href");

        // Находим блок, к которому нужно прокрутить
        const targetBlock = document.querySelector(targetId);

        // Проверяем, что блок существует
        if (targetBlock) {
            // Плавно прокручиваем страницу
            window.scrollTo({
                // offsetTop — положение блока на странице
                // -100 чтобы не уехал под header
                top: targetBlock.offsetTop - 100,
                // Включаем плавность
                behavior: "smooth",
            });
        }
    });
});