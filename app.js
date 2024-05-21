// информация по api https://kinopoiskapiunofficial.tech/documentation/api/#/

const form = document.querySelector(".form");
const search = document.querySelector(".header__search");
const modalEle = document.querySelector(".modal")
const paginationList = document.querySelector(".pagination__list")
const API_KEY = "8c8e1a50-6322-4135-8875-5d40a5420d86";
const API_URL_POPULAR =
    "https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=";
const API_URL_SEARCH =
    "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
const API_URL_FILM_DETAILS = "https://kinopoiskapiunofficial.tech/api/v2.2/films/"
const filterListener = document.getElementById("genre")
const totalFilmItems = document.getElementById("itemsCount")

totalFilmItems.addEventListener("change",async (e) => {
    e.preventDefault()
    const movies = await getMovies(API_URL_POPULAR);
    showMovies(movies)
})

getMovies(API_URL_POPULAR);

function closeModal() {
    modalEle.classList.remove("modal--show")
    document.body.classList.remove("stop-scrolling")
}

async function getMovies(url, page = 1) {
    if (typeof url !== 'string' || typeof page !== 'number') {
        throw new Error("Неверно введенные параметры");
    }

    const apiUrlWithPage = `${url}${page !== 1 ? `?page=${page}` : ''}`;


    try {
        const resp = await fetch(apiUrlWithPage, {
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": API_KEY,
            },
        });

        if (!resp.ok) {
            throw new Error(`Ошибка APi: ${resp.status}`);
        }

        return await resp.json();
    } catch (error) {
        console.error('Произошла ошибка при запросе к API:', error);
        throw error;
    }
}
function getClassByRate(vote) {
    switch(true) {
        case vote >= 7:
            return "green";
        case vote > 5:
            return "orange";
        default:
            return "red";
    }

}
// API не всегда корректно предоставляет рейтинг и иногда он равен 97% или что-то подобное
function getRateAndFix(rate) {
    if (rate.includes("%") || null ){
        return "~"
    } else {
        return rate;
    }
}


async function showMovies(movies) {

    const moviesEl = document.querySelector(".movies");
    moviesEl.textContent = "";

    let itemsAdded = 0;
    movies.films.forEach((movie) => {
        if(itemsAdded < totalFilmItems.value ){

            const movieEl = document.createElement("div");
            movieEl.classList.add("movie");

            if(filterListener.value ?
                movie.genres.some(genre => genre.genre.toLowerCase() === filterListener.value.toLowerCase())
                : movie.genres) {
                movieEl.innerHTML = `
        <div class="movie__cover-inner">
        <img
          src="${movie.posterUrlPreview}"
          class="movie__cover"
          alt="${movie.nameRu}"
        />  
        <div class="movie__cover--darkened"></div>
      </div>
      <div class="movie__info">
        <div class="movie__title">${movie.nameRu}</div>
        <div class="movie__category">${movie.genres.map (
                    (genre) => `${genre.genre}`
                )}</div>
        ${movie.rating &&
                `<div class="movie__average movie__average--${getClassByRate(
                    movie.rating)}"
                    >${getRateAndFix(movie.rating)}</div>`
                }
      </div> 
            `;
                movieEl.addEventListener("click", () => openModal(movie.filmId))
                moviesEl.appendChild(movieEl);
                itemsAdded++;
            } else {
                `<h1>Ничего не найдено<h1>`
            }
        }

    });

}



// изначальная загрузка страницы
async function start() {
    const movies = await getMovies(API_URL_POPULAR);
    showMovies(movies)
}
start()
// поиск
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const apiSearchUrl = `${API_URL_SEARCH}${search.value}&genre=${filterListener.value}`;
    if (search.value) {
        try {
            const searchData = await getMovies(apiSearchUrl)
            showMovies(searchData);
        } catch (error) {
            console.log("Произошла ошбика при поиске",error)
        }

        search.value = "";
    }
});
// слушатель события при смене жанра
filterListener.addEventListener("change", async function (e) {
    const movies = await getMovies(API_URL_POPULAR);
    showMovies(movies)
})
// модальное окно
async function openModal(id) {
    const resp = await fetch(API_URL_FILM_DETAILS + id, {
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
        },
    });
    const respData = await resp.json();

    modalEle.classList.add("modal--show");
    document.body.classList.add("stop-scrolling")

    modalEle.innerHTML = `
    <div class="modal__card">
    <img class="modal__movie-backdrop" src="${respData.posterUrlPreview}" alt="${respData.nameRu}">
    <h2>
        <span class="modal__movie-title"${respData.nameRu}></span>
        <span class="modal__movie-release-year">${respData.year}</span>
    </h2>
    <ul class="modal__movie-info">
        <div class="loader"></div>
        <li class="modal__movie-genre">${respData.genres.map((genres) => `${genres.genre ? genres.genre : "Точный жанр отсутствует"}`)}</li>
        ${respData.filmLength ? `<li class="modal__movie-runtime">Время: ${respData.filmLength} минут</li>`
        : 
        ""}
        <li> Сайт: <a class="modal__movie-site" href="${respData.webUrl}">${respData.webUrl}</a></li>
        <li class="modal__film-review">Описание: ${respData.description ?  respData.description : "Описание отсутствует"}</li>
    </ul>
    <button type="button" class="modal__button--close">Закрыть</button>
</div>
`
    const buttonClose = document.querySelector(".modal__button--close")

    buttonClose.addEventListener("click", () => closeModal())

}

// закрытие модального окна при клике вне его
window.addEventListener("click", (event) => {
    if (event.target === modalEle) {
        closeModal();
    }
})
// закрытие на esc
window.addEventListener("keydown", (event) => {
    if (event.keyCode === 27) {
        closeModal();
    }
})

// да, это говеная пагинация, и что?
// с апи не приходит инофрмация о количестве страниц и итемов, как реализовать пагинацию что бы



function createPaginationList() {
    for (let i = 0; i < 9; i++) {
        paginationList.innerHTML += `
            <li class="pagination__list-item" value="${i+1}" onclick="switchPage(${i+1})">
            ${i+1}
             </li> `
    }

}
async function switchPage(page) {

    const movies = await getMovies(API_URL_POPULAR,page);
    showMovies(movies)
    console.log("switch")
}

createPaginationList()