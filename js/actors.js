// Получаем параметры из адресной строки браузера.
// Например, если адрес такой:
// actors.html?filmId=301&actorId=12345
// то с помощью URLSearchParams мы сможем достать filmId и actorId.
const params = new URLSearchParams(window.location.search);

// Получаем id фильма из адресной строки.
// filmId нужен, чтобы загрузить актеров конкретного фильма.
const filmId = params.get("filmId");

// Получаем id актера из адресной строки.
// actorId нужен, если мы хотим сразу открыть модальное окно конкретного актера.
const actorId = params.get("actorId");

// Находим на странице контейнер, куда будут добавляться карточки актеров.
const actorsList = document.querySelector(".actors__list");

// Находим шаблон карточки актера и сразу копируем его.
// cloneNode(true) означает: скопировать элемент полностью вместе со всем содержимым внутри.
const actorCardTemplate = document.querySelector(".actor-card--template").cloneNode(true);

// Находим поле поиска актеров.
const searchInput = document.querySelector(".actors__search-input");

// Находим модальное окно.
const modal = document.querySelector(".actor-modal");

// Находим внутренний блок модального окна.
const modalContent = document.querySelector(".actor-modal__content");

// Находим шаблон информации об актере внутри модального окна и копируем его.
const modalTemplate = document.querySelector(".actor-modal__template").cloneNode(true);

// Находим кнопку закрытия модального окна.
const modalClose = document.querySelector(".actor-modal__close");

// Находим блок, куда будет выводиться история просмотренных актеров.
const historyList = document.querySelector(".actors__history-list");

// Находим кнопку перехода на предыдущую страницу актеров.
const actorsPrevButton = document.querySelector(".actors__pagination-prev");

// Находим кнопку перехода на следующую страницу актеров.
const actorsNextButton = document.querySelector(".actors__pagination-next");

// Находим элемент, где отображается номер текущей страницы.
const actorsPageText = document.querySelector(".actors__pagination-page");

// Создаем ключ для localStorage.
// По этому ключу браузер будет сохранять историю просмотренных актеров.
const HISTORY_KEY = "kinosite_actors_history";

// Массив всех актеров фильма.
let actors = [];

// Массив актеров, которые подходят под поиск.
let filteredActors = [];

// Текущая страница списка актеров.
let actorsPage = 1;

// Количество актеров на одной странице.
const actorsPerPage = 12;


// Асинхронная функция загрузки актеров фильма.
async function loadActors() {

    // Проверяем, есть ли filmId в адресной строке.
    // Если filmId нет, мы не знаем, для какого фильма загружать актеров.
    if (!filmId) {
        actorsList.innerHTML = "<p>Фильм не выбран.</p>";
        return;
    }

    // Показываем пользователю сообщение о загрузке.
    actorsList.innerHTML = "<p>Загрузка актеров...</p>";

    try {
        // Отправляем запрос к API Кинопоиска.
        // В адрес запроса подставляем filmId.
        const response = await fetch(
            `https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=${filmId}`,
            {
                // Метод GET означает, что мы получаем данные.
                method: "GET",

                // Заголовки запроса.
                headers: {
                    // API_KEY — ключ доступа к API.
                    "X-API-KEY": API_KEY,

                    // Говорим серверу, что работаем с JSON.
                    "Content-Type": "application/json",
                },
            }
        );

        // Проверяем, успешно ли пришел ответ от сервера.
        if (!response.ok) {
            throw new Error("Ошибка API: " + response.status);
        }

        // Преобразуем ответ сервера в обычный JavaScript-объект.
        const data = await response.json();

        // В ответе API приходят не только актеры.
        // Там могут быть режиссеры, сценаристы, операторы и другие участники.
        // Поэтому оставляем только тех, у кого professionKey равен "ACTOR".
        actors = data.filter(function (person) {
            return person.professionKey === "ACTOR";
        });

        // Очищаем массив отфильтрованных актеров.
        filteredActors = [];

        // Возвращаем пользователя на первую страницу.
        actorsPage = 1;

        // Показываем актеров на странице.
        showActors();

        // Если в адресной строке есть actorId,
        // сразу открываем информацию об этом актере.
        if (actorId) {
            showActorInfo(actorId);
        }

    } catch (error) {
        // Если произошла ошибка, показываем сообщение пользователю.
        actorsList.innerHTML = "<p>Не удалось загрузить актеров.</p>";

        // Выводим ошибку в консоль для разработчика.
        console.error(error);
    }
}


// Функция отображения актеров на странице.
function showActors() {

    // Очищаем список актеров перед новой отрисовкой.
    actorsList.innerHTML = "";

    // Получаем текст из поля поиска.
    // trim() убирает лишние пробелы в начале и в конце.
    const searchValue = searchInput.value.trim();

    // Если поле поиска не пустое — берем filteredActors.
    // Если поле поиска пустое — берем всех актеров.
    const list = searchValue ? filteredActors : actors;

    // Если в списке нет актеров, показываем сообщение.
    if (list.length === 0) {
        actorsList.innerHTML = "<p>Актеры не найдены.</p>";

        // Показываем номер страницы 1.
        actorsPageText.textContent = "1";

        // Отключаем кнопки пагинации.
        actorsPrevButton.disabled = true;
        actorsNextButton.disabled = true;

        return;
    }

    // Считаем, с какого элемента начинать показ на текущей странице.
    // Например, если страница 1: (1 - 1) * 12 = 0.
    // Если страница 2: (2 - 1) * 12 = 12.
    const start = (actorsPage - 1) * actorsPerPage;

    // Считаем, на каком элементе заканчивать показ.
    const end = start + actorsPerPage;

    // Берем только актеров для текущей страницы.
    const actorsPageItems = list.slice(start, end);

    // Перебираем актеров текущей страницы.
    actorsPageItems.forEach(function (actor) {

        // Копируем шаблон карточки.
        const card = actorCardTemplate.cloneNode(true);

        // Убираем класс шаблона, потому что настоящую карточку нужно показывать.
        card.classList.remove("actor-card--template");

        // Получаем имя актера.
        // Сначала пробуем русское имя, потом английское.
        // Если имени нет — показываем "Имя неизвестно".
        const name = actor.nameRu || actor.nameEn || "Имя неизвестно";

        // Получаем фото актера.
        // Если фото нет — будет пустая строка.
        const photo = actor.posterUrl || "";

        // Находим img внутри карточки.
        const img = card.querySelector(".actor-card__photo");

        // Если фото есть, вставляем его в карточку.
        if (photo) {
            img.src = photo;
            img.alt = name;
            img.style.display = "block";
        } else {
            // Если фото нет, скрываем картинку.
            img.src = "";
            img.alt = "";
            img.style.display = "none";
        }

        // Вставляем имя актера в карточку.
        card.querySelector(".actor-card__name").textContent = name;

        // Записываем id актера в кнопку.
        // dataset.id создаст атрибут data-id.
        // Он понадобится при клике на кнопку "Подробнее".
        card.querySelector(".actor-card__button").dataset.id = actor.staffId;

        // Добавляем готовую карточку в список актеров.
        actorsList.append(card);
    });

    // Показываем номер текущей страницы.
    actorsPageText.textContent = actorsPage;

    // Если мы на первой странице — отключаем кнопку "назад".
    actorsPrevButton.disabled = actorsPage === 1;

    // Если конец текущей страницы дошел до конца списка,
    // отключаем кнопку "вперед".
    actorsNextButton.disabled = end >= list.length;
}


// Асинхронная функция показа подробной информации об актере.
async function showActorInfo(id) {

    // Показываем модальное окно.
    modal.classList.add("active");

    try {
        // Отправляем запрос к API для получения информации об актере.
        const response = await fetch(
            `https://kinopoiskapiunofficial.tech/api/v1/staff/${id}`,
            {
                method: "GET",
                headers: {
                    "X-API-KEY": API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        // Проверяем ответ сервера.
        if (!response.ok) {
            throw new Error("Ошибка API: " + response.status);
        }

        // Преобразуем ответ в объект актера.
        const actor = await response.json();

        // Ищем старую информацию об актере в модальном окне.
        // :not(.actor-modal__template) означает:
        // найти блок actor-modal__info, но не шаблон.
        const oldInfo = modalContent.querySelector(".actor-modal__info:not(.actor-modal__template)");

        // Если старая информация есть, удаляем ее.
        // Это нужно, чтобы при открытии нового актера данные не дублировались.
        if (oldInfo) {
            oldInfo.remove();
        }

        // Копируем шаблон модального окна.
        const info = modalTemplate.cloneNode(true);

        // Убираем класс шаблона, чтобы блок стал видимым.
        info.classList.remove("actor-modal__template");

        // Получаем имя актера.
        const name = actor.nameRu || actor.nameEn || "Имя неизвестно";

        // Получаем фото актера.
        const photo = actor.posterUrl || "";

        // Получаем дату рождения.
        const birthday = actor.birthday || "Нет данных";

        // Получаем место рождения.
        const birthplace = actor.birthplace || "Нет данных";

        // Получаем факты или биографию.
        // Если facts есть и массив не пустой — объединяем факты в одну строку.
        // Если данных нет — выводим стандартный текст.
        const facts = actor.facts && actor.facts.length > 0
            ? actor.facts.join(" ")
            : "Биография отсутствует";

        // Находим фото в модальном окне.
        const img = info.querySelector(".actor-modal__photo");

        // Если фото есть, показываем его.
        if (photo) {
            img.src = photo;
            img.alt = name;
            img.style.display = "block";
        } else {
            // Если фото нет, скрываем изображение.
            img.src = "";
            img.alt = "";
            img.style.display = "none";
        }

        // Заполняем имя актера.
        info.querySelector(".actor-modal__name").textContent = name;

        // Заполняем дату рождения.
        info.querySelector(".actor-modal__birthday").textContent = birthday;

        // Заполняем место рождения.
        info.querySelector(".actor-modal__birthplace").textContent = birthplace;

        // Заполняем биографию или факты.
        info.querySelector(".actor-modal__facts").textContent = facts;

        // Находим список фильмографии.
        const filmsList = info.querySelector(".actor-modal__films");

        // Очищаем список фильмов.
        filmsList.innerHTML = "";

        // Проверяем, есть ли фильмы у актера.
        if (actor.films && actor.films.length > 0) {

            // Берем только первые 10 фильмов.
            actor.films.slice(0, 10).forEach(function (film) {

                // Создаем элемент списка li.
                const li = document.createElement("li");

                // Вставляем название фильма.
                li.textContent = film.nameRu || film.nameEn || "Название неизвестно";

                // Добавляем фильм в список.
                filmsList.append(li);
            });

        } else {
            // Если фильмографии нет, показываем сообщение.
            filmsList.innerHTML = "<li>Фильмография отсутствует</li>";
        }

        // Добавляем заполненный блок в модальное окно.
        modalContent.append(info);

        // Получаем историю из localStorage.
        // JSON.parse превращает строку обратно в массив.
        // Если истории нет, используем пустой массив.
        let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

        // Создаем объект актера для истории.
        const historyActor = {
            id: actor.personId,
            name: name,
            photo: photo,
        };

        // Удаляем этого актера из истории, если он уже там был.
        // Это нужно, чтобы не было дублей.
        history = history.filter(function (item) {
            return item.id !== historyActor.id;
        });

        // Добавляем актера в начало истории.
        history.unshift(historyActor);

        // Оставляем только последние 10 актеров.
        history = history.slice(0, 10);

        // Сохраняем историю в localStorage.
        // JSON.stringify превращает массив в строку.
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

        // Обновляем блок истории на странице.
        showHistory();

    } catch (error) {
        // Если произошла ошибка, выводим ее в консоль.
        console.error(error);
    }
}


// Функция показа истории просмотренных актеров.
function showHistory() {

    // Получаем историю из localStorage.
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    // Очищаем блок истории.
    historyList.innerHTML = "";

    // Если история пустая, показываем сообщение.
    if (history.length === 0) {
        historyList.innerHTML = "<p>История пока пустая.</p>";
        return;
    }

    // Перебираем всех актеров из истории.
    history.forEach(function (actor) {

        // Добавляем кнопку-карточку в историю.
        // data-id хранит id актера.
        historyList.innerHTML += `
            <button class="actors__history-card" type="button" data-id="${actor.id}">
                ${actor.photo ? `<img src="${actor.photo}" alt="${actor.name}">` : ""}
                <span>${actor.name}</span>
            </button>
        `;
    });
}


// Событие input срабатывает каждый раз,
// когда пользователь вводит или удаляет символ в поле поиска.
searchInput.addEventListener("input", function () {

    // Получаем значение поиска.
    // toLowerCase() переводит текст в нижний регистр,
    // чтобы поиск не зависел от больших и маленьких букв.
    const value = searchInput.value.toLowerCase().trim();

    // Если поле поиска пустое,
    // очищаем массив найденных актеров.
    if (value === "") {
        filteredActors = [];
    } else {
        // Если в поле есть текст, фильтруем актеров.
        filteredActors = actors.filter(function (actor) {

            // Получаем имя актера и переводим в нижний регистр.
            const name = (actor.nameRu || actor.nameEn || "").toLowerCase();

            // Проверяем, содержит ли имя введенный текст.
            return name.includes(value);
        });
    }

    // После поиска всегда возвращаемся на первую страницу.
    actorsPage = 1;

    // Перерисовываем список актеров.
    showActors();
});


// Вешаем обработчик клика на весь список актеров.
actorsList.addEventListener("click", function (event) {

    // Проверяем, кликнули ли именно по кнопке "Подробнее".
    if (event.target.classList.contains("actor-card__button")) {

        // Берем id актера из data-id и открываем модальное окно.
        showActorInfo(event.target.dataset.id);
    }
});


// Вешаем обработчик клика на блок истории.
historyList.addEventListener("click", function (event) {

    // closest ищет ближайшего родителя с классом actors__history-card.
    // Это удобно, потому что пользователь может кликнуть по img или span внутри кнопки.
    const card = event.target.closest(".actors__history-card");

    // Если карточка найдена, открываем информацию об актере.
    if (card) {
        showActorInfo(card.dataset.id);
    }
});


// Клик по кнопке "назад".
actorsPrevButton.addEventListener("click", function () {

    // Проверяем, что мы не на первой странице.
    if (actorsPage > 1) {

        // Уменьшаем номер страницы.
        actorsPage--;

        // Перерисовываем список актеров.
        showActors();
    }
});


// Клик по кнопке "вперед".
actorsNextButton.addEventListener("click", function () {

    // Определяем, с каким списком работаем:
    // если есть поиск — с filteredActors,
    // если поиска нет — со всеми actors.
    const list = searchInput.value.trim() ? filteredActors : actors;

    // Проверяем, есть ли еще актеры на следующей странице.
    if (actorsPage * actorsPerPage < list.length) {

        // Увеличиваем номер страницы.
        actorsPage++;

        // Перерисовываем список актеров.
        showActors();
    }
});


// Клик по крестику закрывает модальное окно.
modalClose.addEventListener("click", function () {
    modal.classList.remove("active");
});


// Клик по темному фону вокруг модального окна тоже закрывает окно.
modal.addEventListener("click", function (event) {

    // event.target === modal означает:
    // пользователь кликнул именно по внешнему темному фону,
    // а не по белому блоку с информацией.
    if (event.target === modal) {
        modal.classList.remove("active");
    }
});


// Запускаем загрузку актеров при открытии страницы.
loadActors();

// Показываем историю просмотренных актеров при открытии страницы.
showHistory();