// Создаём константу TOP_API_KEY.
// TOP_API_KEY — это наш ключ доступа к API Кинопоиска.
const TOP_API_KEY = "9cf06b14-d32a-4048-877a-23727fb3f814";

// Находим на странице блок, куда будут выводиться карточки фильмов.
const list = document.querySelector(".top250__list");

// Находим все кнопки вкладок: Топ-10, Топ-50, Топ-250.
// querySelectorAll возвращает не один элемент, а список элементов.
const tabs = document.querySelectorAll(".top250__tab");

// Находим поле поиска по названию фильма.
const search = document.querySelector(".top250__search");

// Находим выпадающий список сортировки.
const sort = document.querySelector(".top250__sort");

// Находим весь блок пагинации.
const pagination = document.querySelector(".top250__pagination");

// Находим кнопку перехода на предыдущую страницу.
const prev = document.querySelector(".top250__pagination-prev");

// Находим кнопку перехода на следующую страницу.
const next = document.querySelector(".top250__pagination-next");

// Находим элемент, где будет написан номер страницы.
// Например: 1 / 4.
const pageText = document.querySelector(".top250__page");


// Создаём ключ для localStorage.
// localStorage — это хранилище в браузере.
// Сюда мы будем сохранять список фильмов, чтобы не делать запрос каждый раз.
const CACHE_KEY = "kinosite_top250";

// Создаём отдельный ключ для времени сохранения кэша.
// Нам нужно знать, когда фильмы были сохранены.
const CACHE_TIME_KEY = "kinosite_top250_time";

// Время жизни кэша.
// 24 * 60 * 60 * 1000 означает 24 часа в миллисекундах.
// 24 — количество часов.
// 60 — минут в одном часе.
// 60 — секунд в одной минуте.
// 1000 — миллисекунд в одной секунде.
const CACHE_LIFE = 24 * 60 * 60 * 1000;

// Создаём массив для хранения всех фильмов.
// Сначала он пустой.
// После загрузки из API сюда попадут 250 фильмов.
let movies = [];

// limit показывает, сколько фильмов мы хотим брать из общего списка.
// По умолчанию показываем Топ-10.
let limit = 10;

// page хранит номер текущей страницы пагинации.
let page = 1;

// perPage показывает, сколько фильмов показывать на одной странице.
// Например, если limit = 50, то фильмы будут разбиты по 15 на страницу.
const perPage = 15;

// Создаём асинхронную функцию загрузки фильмов.
// async нужен, потому что внутри будет await.
// await позволяет ждать ответ от сервера.
async function loadMovies() {

    // Сразу показываем пользователю сообщение о загрузке.
    list.innerHTML = "<p>Загрузка фильмов...</p>";

    // Пытаемся получить сохранённые фильмы из localStorage.
    // getItem получает данные по ключу.
    const cache = localStorage.getItem(CACHE_KEY);

    // Получаем время, когда кэш был сохранён.
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

    // Проверяем, можно ли использовать кэш.
    // cache — есть ли сохранённые фильмы.
    // cacheTime — есть ли сохранённое время.
    // Date.now() — текущее время в миллисекундах.
    // Number(cacheTime) — превращаем строку из localStorage в число.
    // Date.now() - Number(cacheTime) — сколько времени прошло с момента сохранения.
    // < CACHE_LIFE — прошло меньше 24 часов.
    if (cache && cacheTime && Date.now() - Number(cacheTime) < CACHE_LIFE) {

        // localStorage хранит данные только в виде строки.
        // JSON.parse превращает строку обратно в массив JavaScript.
        const cachedMovies = JSON.parse(cache);

        // Проверяем, что в кэше действительно есть 250 фильмов.
        // cachedMovies.length >= 250 — фильмов не меньше 250.
        // cachedMovies[0].topPosition — у первого фильма есть номер в рейтинге.
        if (cachedMovies.length >= 250 && cachedMovies[0].topPosition) {

            // записываем фильмы в главный массив movies.
            movies = cachedMovies;
            // Вызываем функцию render, чтобы показать фильмы на странице.
            render();
            // return завершает функцию.
            // То есть запрос к API уже не нужен.
            return;
        }
    }

    // try используется для кода, где может произойти ошибка.
    try {
        // Создаём пустой массив allItems.
        // В него будем постепенно добавлять фильмы со всех страниц API.
        let allItems = [];

        // Цикл for будет делать несколько запросов к API.
        // let apiPage = 1 — начинаем с первой страницы API.
        // apiPage <= 13 — делаем максимум 13 запросов.
        // apiPage++ — после каждого круга увеличиваем номер страницы на 1.
        // Почему 13? Обычно API отдаёт примерно 20 фильмов на страницу.
        // 250 фильмов / 20 ≈ 13 страниц.
        for (let apiPage = 1; apiPage <= 13; apiPage++) {
            // Делаем запрос к API.
            // fetch отправляет запрос на сервер.
            // await ждёт, пока сервер ответит.
            const response = await fetch(
                // Это адрес запроса.
                // type=TOP_250_MOVIES означает, что мы просим коллекцию ТОП-250 фильмов.
                // page=${apiPage} подставляет номер страницы API.
                `https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_250_MOVIES&page=${apiPage}`,
                // Второй аргумент fetch — это настройки запроса.
                {   // headers — это заголовки запроса.
                    // Через них мы передаём API-ключ и тип данных.
                    headers: {
                        // X-API-KEY — специальный заголовок для ключа Кинопоиска.
                        "X-API-KEY": TOP_API_KEY,
                        // Content-Type сообщает, что мы работаем с JSON.
                        "Content-Type": "application/json",
                    },
                }
            );

            // Проверяем, успешно ли пришёл ответ.
            if (!response.ok) {
                // Если ответ плохой, создаём ошибку.
                throw new Error("Ошибка загрузки фильмов");
            }

            // Преобразуем ответ из JSON в JavaScript-объект.
            const data = await response.json();

            
            // Мы добавляем фильмы с текущей страницы к общему массиву allItems.
            // data.items — это массив фильмов, который пришёл с одной страницы API.
            // concat соединяет массивы.
            allItems = allItems.concat(data.items);

            // Проверяем, набрали ли мы уже 250 фильмов.
            if (allItems.length >= 250) {
                // Если фильмов уже достаточно, останавливаем цикл.
                break;
            }
        }

        // Берём только первые 250 фильмов.
        // slice(0, 250) берёт элементы с индекса 0 до 249.
        // map перебирает каждый фильм и добавляет ему номер в рейтинге.
        movies = allItems.slice(0, 250).map(function (movie, index) {
            // index — это номер элемента в массиве.
            // В JavaScript индексация начинается с 0.
            // Поэтому index + 1 превращает 0 в 1, 1 в 2 и так далее.
            movie.topPosition = index + 1;
            // Возвращаем изменённый объект фильма обратно в массив.
            return movie;
        });

        // Сохраняем фильмы в localStorage.
        // JSON.stringify превращает массив в строку.
        // localStorage не умеет хранить массивы напрямую, только строки.
        localStorage.setItem(CACHE_KEY, JSON.stringify(movies));

        // Сохраняем текущее время.
        // Date.now() возвращает количество миллисекунд с 1 января 1970 года.
        localStorage.setItem(CACHE_TIME_KEY, Date.now());

        // После загрузки и сохранения фильмов выводим их на страницу.
        render();

    } catch (error) {

        // Если произошла ошибка, показываем пользователю сообщение.
        list.innerHTML = "<p>Не удалось загрузить фильмы.</p>";
        // Выводим ошибку в консоль.
        console.error(error);
    }
}


// Функция render отвечает за отображение фильмов на странице.
// Она не загружает данные с сервера.
// Она только берёт массив movies и показывает нужные карточки.
function render() {

    // Берём из общего массива только нужное количество фильмов.
    // Если limit = 10, берём первые 10.
    // Если limit = 50, берём первые 50.
    // Если limit = 250, берём все 250.
    let result = movies.slice(0, limit);


    // ***ПОСЛЕ ПОЛНОЙ РЕАЛИЗАЦИИ ОТРИСОВКИ

    // Получаем текст из поля поиска.
    // search.value — то, что ввёл пользователь.
    // toLowerCase() переводит текст в нижний регистр.
    // Это нужно, чтобы поиск не зависел от больших и маленьких букв.
    // trim() убирает лишние пробелы в начале и в конце.
    const searchValue = search.value.toLowerCase().trim();
    // Проверяем, ввёл ли пользователь что-то в поиск.
    if (searchValue) {
        // filter создаёт новый массив только из тех фильмов, которые подходят условию.
        result = result.filter(function (movie) {
            // Берём название фильма.
            // movie.nameRu — русское название.
            // movie.nameEn — английское название.
            // "" — пустая строка, если названия нет вообще.
            return (movie.nameRu || movie.nameEn || "")
                // Переводим название в нижний регистр.
                .toLowerCase()
                // Проверяем, содержит ли название введённый текст.
                .includes(searchValue);
        });
    }
    // Проверяем, выбрана ли сортировка "Сначала новые".
    if (sort.value === "year-new") {
        // sort сортирует массив.
        // a и b — два фильма, которые сравниваются между собой.
        result.sort(function (a, b) {
            // Number превращает год из строки в число.
            // b.year - a.year сортирует от большего года к меньшему.
            // Например: 2024, 2020, 2015.
            return Number(b.year) - Number(a.year);
        });
    }
    // Проверяем, выбрана ли сортировка "Сначала старые".
    if (sort.value === "year-old") {
        // Сортируем фильмы по году от старых к новым.
        result.sort(function (a, b) {
            // a.year - b.year сортирует от меньшего года к большему.
            // Например: 1975, 1990, 2020.
            return Number(a.year) - Number(b.year);
        });
    }
    // *** КОНЕЦ

    // Считаем, сколько всего страниц получится.
    // result.length — сколько фильмов осталось после фильтрации.
    // perPage — сколько фильмов на одной странице.
    // Math.ceil округляет вверх.
    // Например, 31 фильм / 15 = 2.06, Math.ceil сделает 3 страницы.
    const totalPages = Math.ceil(result.length / perPage);

    // Считаем индекс первого фильма на текущей странице.
    // Если page = 1, start = 0.
    // Если page = 2, start = 15.
    // Если page = 3, start = 30.
    const start = (page - 1) * perPage;

    // Берём фильмы только для текущей страницы.
    // slice(start, start + perPage) берёт часть массива.
    const currentMovies = result.slice(start, start + perPage);

    // Очищаем список перед новой отрисовкой.
    // Это нужно, чтобы старые карточки не смешивались с новыми.
    list.innerHTML = "";

    // Проверяем, есть ли фильмы для показа.
    // !currentMovies.length означает: если длина массива равна 0.
    if (!currentMovies.length) {
        // Показываем сообщение, если ничего не найдено.
        list.innerHTML = "<p>Фильмы не найдены.</p>";
        // Скрываем пагинацию, потому что листать нечего.
        pagination.classList.add("hidden");
        // Завершаем функцию.
        return;
    }

    // Перебираем фильмы текущей страницы.
    currentMovies.forEach(function (movie) {
        // Создаём новый HTML-элемент article.
        // article подходит для отдельной карточки фильма.
        const card = document.createElement("article");

        // Задаём классы карточке.
        // Если фильм находится в топ-3, добавляем дополнительный класс top250-card--winner.
        // Этот класс нужен, чтобы красиво выделить первые три места.
        card.className = movie.topPosition <= 3
            ? "top250-card top250-card--winner"
            : "top250-card";

        // Заполняем карточку HTML-разметкой.
        // Используем шаблонную строку через обратные кавычки.
        // Внутри ${} можно вставлять значения из JavaScript.
        card.innerHTML = `

            <!-- Номер фильма в рейтинге -->
            <div class="top250-card__number">${movie.topPosition}</div>

            <!-- Постер фильма -->
            <img 
                class="top250-card__poster" 
                src="${movie.posterUrlPreview || ""}" 
                alt="${movie.nameRu || movie.nameEn || "Постер фильма"}"
            >

            <!-- Текстовая часть карточки -->
            <div class="top250-card__content">

                <!-- Название фильма -->
                <h2 class="top250-card__title">
                    ${movie.nameRu || movie.nameEn || "Название неизвестно"}
                </h2>

                <!-- Жанр фильма -->
                <p class="top250-card__genre">
                    ${movie.genres && movie.genres.length ? movie.genres[0].genre : "Жанр неизвестен"}
                </p>

                <!-- Год фильма -->
                <p class="top250-card__duration">
                    ${movie.year || "Год неизвестен"}
                </p>
            </div>

            <!-- Рейтинг фильма -->
            <div class="top250-card__rating">
                ${movie.ratingKinopoisk || "—"}
            </div>
        `;

        // Добавляем готовую карточку в список на странице.
        list.append(card);
    });

    // Проверяем, нужна ли пагинация.
    // Если страниц 1 или меньше, значит листать нечего.
    if (totalPages <= 1) {
        // Скрываем пагинацию.
        pagination.classList.add("hidden");

    } else {
        // Показываем пагинацию.
        pagination.classList.remove("hidden");


        // Обновляем текст страницы.
        // Например: 1 / 4.
        pageText.textContent = `${page} / ${totalPages}`;

        // Отключаем кнопку "назад", если мы на первой странице.
        prev.disabled = page === 1;

        // Отключаем кнопку "вперёд", если мы на последней странице.
        next.disabled = page === totalPages;
    }
}


// Перебираем все кнопки вкладок.
tabs.forEach(function (tab) {
    // На каждую вкладку вешаем обработчик клика.
    tab.addEventListener("click", function () {
        // Сначала у всех вкладок убираем класс active.
        tabs.forEach(function (item) {
            // remove удаляет класс.
            item.classList.remove("active");
        });


        // Добавляем active только той вкладке, на которую нажали.
        tab.classList.add("active");

        // Берём значение data-limit из HTML.
        // Например: data-limit="10".
        // dataset.limit получает значение 10.
        // Number превращает строку "10" в число 10.
        limit = Number(tab.dataset.limit);

        // После смены вкладки возвращаемся на первую страницу.
        page = 1;

        // Перерисовываем список фильмов.
        render();
    });
});


// Вешаем обработчик на поле поиска.
// input срабатывает каждый раз, когда пользователь вводит или удаляет символ.
search.addEventListener("input", function () {
    // После поиска возвращаемся на первую страницу.
    page = 1;
    // Перерисовываем список с учётом поиска.
    render();
});


// Вешаем обработчик на выпадающий список сортировки.
// change срабатывает, когда пользователь выбирает другой вариант.
sort.addEventListener("change", function () {
    // После смены сортировки возвращаемся на первую страницу.
    page = 1;
    // Перерисовываем список с новой сортировкой.
    render();
});

// Вешаем обработчик на кнопку "назад".
prev.addEventListener("click", function () {
    // Уменьшаем номер текущей страницы на 1.
    page--;
    // Перерисовываем список фильмов для новой страницы.
    render();
});


// Вешаем обработчик на кнопку "вперёд".
next.addEventListener("click", function () {
    // Увеличиваем номер текущей страницы на 1.
    page++;
    // Перерисовываем список фильмов для новой страницы.
    render();
});


// Запускаем загрузку фильмов.
// Именно с этой строки начинает работать вся логика страницы.
loadMovies();