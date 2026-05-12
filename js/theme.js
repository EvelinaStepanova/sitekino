// Находим кнопку темы
const themeButton = document.querySelector(".header__theme-button");

// // Создаём ключ для localStorage.
// По этому ключу мы будем сохранять выбранную тему.
const THEME_KEY = "kinosite_theme";

// Получаем сохранённую тему
// Если пользователь раньше включал тёмную тему, здесь будет значение "dark".
// Если пользователь раньше включал светлую тему, здесь будет значение "light".
// Если тема ещё ни разу не сохранялась, здесь будет null.
const savedTheme = localStorage.getItem(THEME_KEY);

// Если сохранена тёмная тема
if (savedTheme === "dark") {
    // добавляем тегу body класс dark-theme.
    // После этого начинают работать стили из CSS для тёмной темы.
    document.body.classList.add("dark-theme");
}

// Проверяем, существует ли кнопка смены темы на странице.
// Это защита от ошибки.
// Если кнопки нет, код внутри if не выполнится.
if (themeButton) {
    themeButton.addEventListener("click", function () {

        // Переключаем класс dark-theme у body.
        // Если класса нет — он добавится.
        // Если класс уже есть — он удалится.
        document.body.classList.toggle("dark-theme");

        // Проверяем, есть ли сейчас у body класс dark-theme.
        // contains("dark-theme") вернёт true, если класс есть.
        // Вернёт false, если класса нет.
        const isDarkTheme = document.body.classList.contains("dark-theme");

        // Если после клика тёмная тема включена
        if (isDarkTheme) {
            // Сохраняем в localStorage значение "dark".
            // Теперь браузер запомнит, что пользователь выбрал тёмную тему.
            localStorage.setItem(THEME_KEY, "dark");
        } else {
            // Иначе сохраняем значение "light".
            // Это значит, что пользователь вернулся к светлой теме.
            localStorage.setItem(THEME_KEY, "light");
        }
    });
}