version = '1.0'

//----------------------------------------------

const path = 'https://api.kinopoisk.dev/movie?'  // Основной URL запроса

let url_type = 'movie'  // по умолчанию это фильм

const url_filter = {  // расширение URL для фильтрации API, по умолчанию:
    'year': [1930, new Date().getFullYear()],  // год от 1930 до текущего
    'rating.imdb': [0, 10],  // рейтинг IMDB от 0 до 10
    'rating.kp': [0, 10]  // рейтинг Кинопоиска от 0  до 10
}

const url_sorter = {  // расширение URL для сортировки получаемых данных, по умолчанию:
    'year': 1,  // в порядке возрастания
    'rating.imdb': -1,  // в порядке убывания
    'rating.kp': 0  // если 0 - по данному параметру не будем фильтровать
}

let page = 1  // текущая страница в списке загружаемых данных, изначально = 1
let pages = 0  // общее количество страниц загружаемых данных, становится известной после первого сканирования
let limit = 9  // количество результатов на странице

const token = 'DQRKYHQ-SYFMEKN-H88JA7D-M8TMZRB'

//----------------------------------------------

const filters = [  // фильтры по умолчанию, нужны для создания элементов страницы
    {
        id: 'filter_year',
        title: 'Года:',
        min_label: 'с',
        min: url_filter.year[0],
        max_label: 'до',
        max: url_filter.year[1],
    },
    {
        id: 'filter_imdb',
        title: 'Рейтинг IMDB:',
        min_label: 'с',
        min: url_filter["rating.imdb"][0],
        max_label: 'до',
        max: url_filter["rating.imdb"][1],
    },
    {
        id: 'filter_kp',
        title: 'Рейтинг Кинопоиска:',
        min_label: 'с',
        min: url_filter["rating.kp"][0],
        max_label: 'до',
        max: url_filter["rating.kp"][1],
    }
]

const sorters = [  // сортировка по умолчанию, нужны для создания элементов страницы
    {
        id: 'sorter_year',
        title: 'По годам:',
        sort: url_sorter.year
    },
    {
        id: 'sorter_imdb',
        title: 'По рейтингу IMDB:',
        sort: url_sorter["rating.imdb"]
    },
    {
        id: 'sorter_kp',
        title: 'По рейтингу Кинопоиска:',
        sort: url_sorter["rating.kp"]
    }
]

//----------------------------------------------

let url_ext = () => {  // полное готовое расширение URL, зависит от фильтров и сортировки, создается при нажатии на кнопку Старт
    let url = path + 'field=type&search=' + url_type

    url += `&field=year&search=${filters[0].min}-${filters[0].max}`
    url += `&field=rating.imdb&search=${filters[1].min}-${filters[1].max}`
    url += `&field=rating.kp&search=${filters[2].min}-${filters[2].max}`

    sorters[0].sort != 0 ? url += `&sortField=year&sortType=${sorters[0].sort}` : false
    sorters[1].sort != 0 ? url += `&sortField=rating.imdb&sortType=${sorters[1].sort}` : false
    sorters[2].sort != 0 ? url += `&sortField=rating.kp&sortType=${sorters[2].sort}` : false

    url += '&page=' + page
    url += '&limit=' + limit
    url += '&token=' + token

    return url
}

//----------------------------------------------

function createArr() {  // создаем ключи в localStorage
    if(!localStorage.getItem('filmoteka')) {
        let filmoteka = {
            'favorites': {},
            'unviewed': {},
            'viewed': {}
        }
        localStorage.setItem('filmoteka', JSON.stringify(filmoteka))
    }
}

function isArr(x, id) {
    return id in JSON.parse(localStorage.getItem('filmoteka'))[x]
}

function checkArr(x, obj) {  // изменяем данные в localStorage
    let filmoteka = JSON.parse(localStorage.getItem('filmoteka'))
    
    if(obj.id in filmoteka[x]) {  // если id переданного фильма есть в localStorage в переданном модуле
        delete filmoteka[x][obj.id]  // удаляем фильм
    }
    else {  // иначе - добавляем фильм в нужный модуль
        let film = {
            h3: obj.name + ` (${obj.year})`,
            img: obj.poster.previewUrl,
            imdb: `IMDB: <span>${obj.rating.imdb} (${obj.votes.imdb})</span>`,
            kp: `Кинопоиск: <span>${obj.rating.kp} (${obj.votes.kp})</span>`
        }

        filmoteka[x][obj.id] = film
    }

    localStorage.setItem('filmoteka', JSON.stringify(filmoteka))
}

function otherCheckArr(x, id, obj) {  // изменяем данные в localStorage
    let filmoteka = JSON.parse(localStorage.getItem('filmoteka'))
    
    if(id in filmoteka[x]) {  // если id переданного фильма есть в localStorage в переданном модуле
        delete filmoteka[x][id]  // удаляем фильм
    }
    else {  // иначе - добавляем фильм в нужный модуль
        let film = {
            h3: obj.h3,
            img: obj.img,
            imdb: obj.imdb,
            kp: obj.kp
        }

        filmoteka[x][id] = film
    }

    localStorage.setItem('filmoteka', JSON.stringify(filmoteka))
}

//----------------------------------------------

const $body = document.querySelector('body')

const $main = document.querySelector('#container')

const $header = document.querySelector('header')  // отрисовка меню

    const $header_searh = $header.querySelector('#search')
    $header_searh.addEventListener('click', () => createSearchPage())

    const $favorites = $header.querySelector('#favorites')
    $favorites.addEventListener('click', () => createFavoritesPage())

    const $unviewed = $header.querySelector('#unviewed')
    $unviewed.addEventListener('click', () => createUnviewedPage())

    const $viewed = $header.querySelector('#viewed')
    $viewed.addEventListener('click', () => createViewedPage())

//----------------------------------------------

let main_html = `<h1>Filmoteka <span>${version}</span></h1>`
$main.innerHTML = main_html

//----------------------------------------------

let s = 0  // счетчик нажатий на пункт Поиск

function createSearchPage() {  // создание страницы поиска: блоков фильтрации и сортировки и кнопки Старт
    if(s == 0) {  // если первый раз нажимаем, то отрисовывается этот модуль
        main_html = $main.innerHTML
        $main.innerHTML = ''
        createFilters(filters)
        createSorters(sorters)
        createButtonStart()
        s = 1
    }
    else {  // если второй раз нажимаем, отрисовывается предыдущая инфа со страницы
        $main.innerHTML = main_html
        s = 0
    }
    return s
}

//----------------------------------------------

function createFilters(filters) {  // отрисовка блока фильтрации
    const $filters = document.createElement('div')
    $filters.id = 'filter'
        const $h2 = document.createElement('h2')
        $h2.textContent = 'Фильтрация'
    
        const $type = document.createElement('div')
        $type.id = 'typecontent'
            const $type_movie = document.createElement('input')
            $type_movie.type = 'radio'
            $type_movie.value = 'movie'
            $type_movie.checked = true
            $type_movie.name = 'typecontent'
            $type_movie.addEventListener('click', () => url_type = 'movie')

            const $span_movie = document.createElement('span')
            $span_movie.textContent = 'Фильмы'

            const $type_season = document.createElement('input')
            $type_season.type = 'radio'
            $type_season.value = 'season'
            $type_season.name = 'typecontent'
            $type_season.addEventListener('click', () => url_type = 'tv-series')

            const $span_season = document.createElement('span')
            $span_season.textContent = 'Сериалы'

        $type.append($type_movie, $span_movie, $type_season, $span_season)

    $filters.append($h2, $type)

    filters.forEach(obj => {
        let $filter = document.createElement('div')
        $filter.id = obj.id
        
            let $h3 = document.createElement('h3')
            $h3.textContent = obj.title

            let $span_min = document.createElement('span')
            $span_min.textContent = obj.min_label

            let $inp_min = document.createElement('input')
            $inp_min.id = `${obj.id}_min`
            $inp_min.type = 'number'
            $inp_min.min = obj.min
            $inp_min.max = obj.max
            $inp_min.value = obj.min
            $inp_min.addEventListener('change', () => obj.min = $inp_min.value)

            let $span_max = document.createElement('span')
            $span_max.textContent = obj.max_label

            let $inp_max = document.createElement('input')
            $inp_max.id = `${obj.id}_max`
            $inp_max.type = 'number'
            $inp_max.min = obj.min
            $inp_max.max = obj.max
            $inp_max.value = obj.max
            $inp_max.addEventListener('change', () => obj.max = $inp_max.value)

        $filter.append($h3, $span_min, $inp_min, $span_max, $inp_max)
    $filters.append($filter)})

    $main.append($filters)
}

//----------------------------------------------

function createSorters(sorters) {  // отрисовка блока сортировки
    const $sorters = document.createElement('div')
    $sorters.id = 'sorter'
        const $h2 = document.createElement('h2')
        $h2.textContent = 'Сортировка'
    $sorters.append($h2)

    sorters.forEach(obj => {
        let $sorter = document.createElement('div')
        $sorter.id = obj.id
            let $h3 = document.createElement('h3')
            $h3.textContent = obj.title

            let $block_up = document.createElement('div')
                let $inp_up = document.createElement('input')
                $inp_up.name = obj.id
                $inp_up.type = 'radio'
                $inp_up.value = 1
                obj.sort == 1 ? $inp_up.checked = true : $inp_up.checked = false
                $inp_up.addEventListener('change', () => obj.sort = 1)

                let $span_up = document.createElement('span')
                $span_up.textContent = 'По возрастанию'
            $block_up.append($inp_up, $span_up)

            let $block_down = document.createElement('div')
                let $inp_down = document.createElement('input')
                $inp_down.name = obj.id
                $inp_down.type = 'radio'
                $inp_down.value = -1
                obj.sort == -1 ? $inp_down.checked = true : $inp_down.checked = false
                $inp_down.addEventListener('change', () => obj.sort = -1)

                let $span_down = document.createElement('span')
                $span_down.textContent = 'По убыванию'
            $block_down.append($inp_down, $span_down)

            let $block_zero = document.createElement('div')
                let $inp_zero = document.createElement('input')
                $inp_zero.name = obj.id
                $inp_zero.type = 'radio'
                $inp_zero.value = 0
                obj.sort == 0 ? $inp_zero.checked = true : $inp_zero.checked = false
                $inp_zero.addEventListener('change', () => obj.sort = 0)

                let $span_zero = document.createElement('span')
                $span_zero.textContent = 'Не сортировать'
            $block_zero.append($inp_zero, $span_zero)

        $sorter.append($h3, $block_up, $block_down, $block_zero)
    $sorters.append($sorter)})

    $main.append($sorters)
}

//----------------------------------------------

function createButtonStart() {  // отрисока кнопки Старт
    const $start_block = document.createElement('div')
    $start_block.id = 'start_block'

        const $start_button = document.createElement('div')
        $start_button.id = 'start_button'
        $start_button.innerHTML = '<h2>Start</h2>'
        $start_button.addEventListener('click', () => getMovieList())

    $start_block.append($start_button)
    $main.append($start_block)
}

//----------------------------------------------

async function getMovieList() {  // получаем список фильмов
    s = 0  // сбрасываем счетчик нажатий на пункт меню
    $main.innerHTML = 'Идет загрузка данных...'

    let req = await fetch(url_ext())
    let res = await req.json()

    page = res.page  // получаем текущую страницу
    pages = res.pages  // получаем количество общее страниц по данным фильтрам, будем использовать для пагинации

    renderMovieList(res.docs)
}

//----------------------------------------------

function renderMovieList(movie_list) {  // отрисовка списка фильмов
    $main.innerHTML = ''
    createArr()

    const $movies_list = document.createElement('div')
    $movies_list.id = 'movies_list'
        movie_list.forEach(obj => {
            let $movie_block = document.createElement('div')
            $movie_block.className = 'movie_block'

                let $h3 = document.createElement('h3')
                $h3.textContent = obj.name + ` (${obj.year})`
                $h3.addEventListener('mouseover', () => $h3.style.color = 'aqua')
                $h3.addEventListener('mouseout', () => $h3.style.color = '#fff')
                $h3.addEventListener('click', () => getMovie(obj.id))

                let $img = document.createElement('img')
                $img.src = obj.poster.previewUrl
                $img.addEventListener('mouseover', () => $h3.style.color = 'aqua')
                $img.addEventListener('mouseout', () => $h3.style.color = '#fff')
                $img.addEventListener('click', () => getMovie(obj.id))

                let $imdb = document.createElement('p')
                $imdb.innerHTML = `IMDB: <span>${obj.rating.imdb} (${obj.votes.imdb})</span>`

                let $kp = document.createElement('p')
                $kp.innerHTML = `Кинопоиск: <span>${obj.rating.kp} (${obj.votes.kp})</span>`

                let $check_block = document.createElement('div')
                $check_block.className = 'check_block'
                    let $fav_point = document.createElement('span')
                    $fav_point.className = 'fav_point'
                    $fav_point.title = 'Добавить в избранное'
                    isArr('favorites', obj.id) ? $fav_point.classList.add('fav_fill') : false
                    $fav_point.addEventListener('click', () => {
                        $fav_point.classList.toggle('fav_fill')
                        checkArr('favorites', obj)
                    })

                    let $unview_point = document.createElement('span')
                    $unview_point.className = 'unview_point'
                    $unview_point.title = 'Добавить в непросмотренное'
                    isArr('unviewed', obj.id) ? $unview_point.classList.add('unview_fill') : false
                    $unview_point.addEventListener('click', () => {
                        $unview_point.classList.add('unview_fill')
                        checkArr('unviewed', obj)
                        if($view_point.classList.contains('view_fill')) {
                            $view_point.classList.remove('view_fill')
                            checkArr('viewed', obj)
                        }
                    })

                    let $view_point = document.createElement('span')
                    $view_point.className = 'view_point'
                    $view_point.title = 'Добавить в просмотренное'
                    isArr('viewed', obj.id) ? $view_point.classList.add('view_fill') : false
                    $view_point.addEventListener('click', () => {
                        $view_point.classList.add('view_fill')
                        checkArr('viewed', obj)
                        if($unview_point.classList.contains('unview_fill')) {
                            $unview_point.classList.remove('unview_fill')
                            checkArr('unviewed', obj)
                        }
                    })

                    $check_block.append($fav_point, $unview_point, $view_point)
                $movie_block.append($h3, $img, $imdb, $kp, $check_block)

            $movies_list.append($movie_block)
        })

        $movies_list.append(Pagination())
    $main.append($movies_list)
}

//----------------------------------------------

function Pagination() {  // отрисовка блока пагинации
    if(pages <= 10) {
        return MiniPagination()
    }
    else {
        return MaxiPagination()
    }
}

function MiniPagination() {  // простая пагинация, показывает все страницы
    const $pagination = document.createElement('div')
    $pagination.id = 'pagination'

        for(let i=1; i<=pages; i++) {
            let $pag = document.createElement('div')
            $pag.textContent = i
            if(i == page) {
                $pag.classList.add('active')
            }
            else {
                $pag.addEventListener('click', () => {
                    page = i
                    getMovieList()
                })
            }
            $pagination.append($pag)
        }
    
    return $pagination
}

function MaxiPagination() {  // полная пагинация, показывает текущую страницу и общее количество страниц
    const $pagination = document.createElement('div')
    $pagination.id = 'pagination'

    if(page == 1) {
        const $first = document.createElement('div')
        $first.textContent = 1
        $first.classList.add('active')

        const $right = document.createElement('div')
        $right.textContent = '>'
        $right.addEventListener('click', () => {
            page++
            getMovieList()
        })

        const $last = document.createElement('div')
        $last.textContent = pages
        $last.addEventListener('click', () => {
            page = pages
            getMovieList()
        })

        $pagination.append($first, $right, $last)
    }
    else if(page == pages) {
        const $first = document.createElement('div')
        $first.textContent = 1
        $first.addEventListener('click', () => {
            page = 1
            getMovieList()
        })

        const $left = document.createElement('div')
        $left.textContent = '<'
        $left.addEventListener('click', () => {
            page--
            getMovieList()
        })

        const $last = document.createElement('div')
        $last.textContent = pages
        $last.classList.add('active')

        $pagination.append($first, $left, $last)
    }
    else {
        const $first = document.createElement('div')
        $first.textContent = 1
        $first.addEventListener('click', () => {
            page = 1
            getMovieList()
        })

        const $left = document.createElement('div')
        $left.textContent = '<'
        $left.addEventListener('click', () => {
            page--
            getMovieList()
        })

        const $current = document.createElement('div')
        $current.textContent = page
        $current.classList.add('active')

        const $right = document.createElement('div')
        $right.textContent = '>'
        $right.addEventListener('click', () => {
            page++
            getMovieList()
        })

        const $last = document.createElement('div')
        $last.textContent = pages
        $last.addEventListener('click', () => {
            page = pages
            getMovieList()
        })

        $pagination.append($first, $left, $current, $right, $last)
    }

    return $pagination
}

//----------------------------------------------

function createFavoritesPage() {  // получение списка избранного
    $main.innerHTML = ''
    const storageList = JSON.parse(localStorage.getItem('filmoteka'))['favorites']

    renderOtherList(storageList)
}

function createUnviewedPage() {  // получение списка непросмотренного
    $main.innerHTML = ''
    const storageList = JSON.parse(localStorage.getItem('filmoteka'))['unviewed']

    renderOtherList(storageList)
}

function createViewedPage() {  // получение списка просмотренного
    $main.innerHTML = ''
    const storageList = JSON.parse(localStorage.getItem('filmoteka'))['viewed']

    renderOtherList(storageList)
}

//----------------------------------------------

function renderOtherList(movie_obj) {
    const $movies_list = document.createElement('div')
    $movies_list.id = 'movies_list'
        Object.keys(movie_obj).forEach(id => {
            let $movie_block = document.createElement('div')
            $movie_block.className = 'movie_block'

                let $h3 = document.createElement('h3')
                $h3.textContent = movie_obj[id].h3
                $h3.addEventListener('mouseover', () => $h3.style.color = 'aqua')
                $h3.addEventListener('mouseout', () => $h3.style.color = '#fff')
                $h3.addEventListener('click', () => getMovie(id))

                let $img = document.createElement('img')
                $img.src = movie_obj[id].img
                $img.addEventListener('mouseover', () => $h3.style.color = 'aqua')
                $img.addEventListener('mouseout', () => $h3.style.color = '#fff')
                $img.addEventListener('click', () => getMovie(id))

                let $imdb = document.createElement('p')
                $imdb.innerHTML = movie_obj[id].imdb

                let $kp = document.createElement('p')
                $kp.innerHTML = movie_obj[id].kp

                let $check_block = document.createElement('div')
                $check_block.className = 'check_block'
                    let $fav_point = document.createElement('span')
                    $fav_point.className = 'fav_point'
                    $fav_point.title = 'Добавить в избранное'
                    isArr('favorites', id) ? $fav_point.classList.add('fav_fill') : false
                    $fav_point.addEventListener('click', () => {
                        $fav_point.classList.toggle('fav_fill')
                        otherCheckArr('favorites', id, movie_obj[id])
                    })

                    let $unview_point = document.createElement('span')
                    $unview_point.className = 'unview_point'
                    $unview_point.title = 'Добавить в непросмотренное'
                    isArr('unviewed', id) ? $unview_point.classList.add('unview_fill') : false
                    $unview_point.addEventListener('click', () => {
                        $unview_point.classList.add('unview_fill')
                        otherCheckArr('unviewed', id, movie_obj[id])
                        if($view_point.classList.contains('view_fill')) {
                            $view_point.classList.remove('view_fill')
                            otherCheckArr('viewed', id, movie_obj[id])
                        }
                    })

                    let $view_point = document.createElement('span')
                    $view_point.className = 'view_point'
                    $view_point.title = 'Добавить в просмотренное'
                    isArr('viewed', id) ? $view_point.classList.add('view_fill') : false
                    $view_point.addEventListener('click', () => {
                        $view_point.classList.add('view_fill')
                        otherCheckArr('viewed', id, movie_obj[id])
                        if($unview_point.classList.contains('unview_fill')) {
                            $unview_point.classList.remove('unview_fill')
                            otherCheckArr('unviewed', id, movie_obj[id])
                        }
                    })

                    $check_block.append($fav_point, $unview_point, $view_point)
                $movie_block.append($h3, $img, $imdb, $kp, $check_block)
                
            $movies_list.append($movie_block)
        })

    $main.append($movies_list)
}

//----------------------------------------------

async function getMovie(id) {  // получаем фильм
    $main.innerHTML = 'Идет загрузка данных...'

    let req = await fetch(`https://api.kinopoisk.dev/movie?search=${id}&field=id&token=${token}`)
    let res = await req.json()

    renderMovie(res)
}

//----------------------------------------------

function renderMovie(data) {  // отрисовка фильма
    $main.innerHTML = ''

    const $movies_list = document.createElement('div')
    $movies_list.id = 'movies_list'

    let $movie_block = document.createElement('div')
    $movie_block.className = 'movie_block'

        let $h3 = document.createElement('h3')
        $h3.textContent = `${data.name} (${data.year})`
        $h3.style.cursor = 'default'

        let $img = document.createElement('img')
        $img.src = data.poster.previewUrl
        $img.style.cursor = 'default'

        let $imdb = document.createElement('p')
        $imdb.innerHTML = `IMDB: <span>${data.rating.imdb} (${data.votes.imdb})</span>`

        let $kp = document.createElement('p')
        $kp.innerHTML = `Кинопоиск: <span>${data.rating.kp} (${data.votes.kp})</span>`

        let $check_block = document.createElement('div')
        $check_block.className = 'check_block'
            let $fav_point = document.createElement('span')
            $fav_point.className = 'fav_point'
            $fav_point.title = 'Добавить в избранное'
            isArr('favorites', data.id) ? $fav_point.classList.add('fav_fill') : false
            $fav_point.addEventListener('click', () => {
                $fav_point.classList.toggle('fav_fill')
                checkArr('favorites', data)
            })

            let $unview_point = document.createElement('span')
            $unview_point.className = 'unview_point'
            $unview_point.title = 'Добавить в непросмотренное'
            isArr('unviewed', data.id) ? $unview_point.classList.add('unview_fill') : false
            $unview_point.addEventListener('click', () => {
                $unview_point.classList.add('unview_fill')
                checkArr('unviewed', data)
                if($view_point.classList.contains('view_fill')) {
                    $view_point.classList.remove('view_fill')
                    checkArr('viewed', data)
                }
            })

            let $view_point = document.createElement('span')
            $view_point.className = 'view_point'
            $view_point.title = 'Добавить в просмотренное'
            isArr('viewed', data.id) ? $view_point.classList.add('view_fill') : false
            $view_point.addEventListener('click', () => {
                $view_point.classList.add('view_fill')
                checkArr('viewed', data)
                if($unview_point.classList.contains('unview_fill')) {
                    $unview_point.classList.remove('unview_fill')
                    checkArr('unviewed', data)
                }
            })

        $check_block.append($fav_point, $unview_point, $view_point)
    $movie_block.append($h3, $img, $imdb, $kp, $check_block)

    let $movie_info = document.createElement('div')
    $movie_info.className = 'movie_info'

        $slogan = document.createElement('blockquote')
        $slogan.innerHTML = `&laquo;${data.slogan}&raquo;`
        $slogan ? $movie_info.append($slogan) : false

        $desc = document.createElement('div')
        $desc.className = 'desc'
        $desc.textContent = data.description
        $desc ? $movie_info.append($desc) : false

        $genres = document.createElement('div')
        $genres.className = 'genres'
        data.genres.forEach(genre => {
            let $genre = document.createElement('span')
            $genre.textContent = genre.name
            $genres.append($genre)
        })
        $movie_info.append($genres)

        $countries = document.createElement('div')
        $countries.className = 'countries'
        data.countries.forEach(country => {
            let $country = document.createElement('span')
            $country.textContent = country.name
            $countries.append($country)
        })
        $movie_info.append($countries)

        $trailers = document.createElement('div')
        $trailers.className = 'trailers'
        data.videos.trailers.forEach(trailer => {
            let $trailer = document.createElement('a')
            $trailer.textContent = trailer.name
            $trailer.href = trailer.url
            $trailer.target = '_blank'
            $trailers.append($trailer)
        })
        $movie_info.append($trailers)

    $movies_list.append($movie_block, $movie_info)
    $main.append($movies_list)
}