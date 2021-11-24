const path = 'https://api.kinopoisk.dev/'  // Основной URL запроса

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

const token = 'DQRKYHQ-SYFMEKN-H88JA7D-M8TMZRB'

let url_ext = () => {  // полное готовое расширение URL, зависит от фильтров и сортировки, создается при нажатии на кнопку Старт
    let url = path + url_type + '?' + 'field=type&search=' + url_type

    url += '&field=year&search=' + url_filter["year"].join('-')
    url += '&field=rating.imdb&search=' + url_filter["rating.imdb"].join('-')
    url += '&field=rating.kp&search=' + url_filter["rating.kp"].join('-')

    url_sorter["year"] != 0 ? url += '&sortField=year&sortType=' + url_sorter["year"] : false
    url_sorter["rating.imdb"] != 0 ? url += '&sortField=rating.imdb&sortType=' + url_sorter["rating.imdb"] : false
    url_sorter["rating.kp"] != 0 ? url += '&sortField=rating.kp&sortType=' + url_sorter["rating.kp"] : false

    url += '&page=' + page
    url += '&token=' + token

    return url
}

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

let main_html = '<h1>Filmoteka</h1>'

const $main = document.querySelector('#container')
$main.innerHTML = main_html

//----------------------------------------------

function createSearchPage() {  // создание страницы поиска: блоков фильтрации и сортировки и кнопки Старт
    main_html = $main.innerHTML
    $main.innerHTML = ''
    createFilters(filters)
    createSorters(sorters)
}

//----------------------------------------------

function createFilters(filters) {
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

            const $span_movie = document.createElement('span')
            $span_movie.textContent = 'Фильмы'

            const $type_season = document.createElement('input')
            $type_season.type = 'radio'
            $type_season.value = 'season'
            $type_season.name = 'typecontent'

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

            let $span_max = document.createElement('span')
            $span_max.textContent = obj.max_label

            let $inp_max = document.createElement('input')
            $inp_max.id = `${obj.id}_max`
            $inp_max.type = 'number'
            $inp_max.min = obj.min
            $inp_max.max = obj.max
            $inp_max.value = obj.max
        $filter.append($h3, $span_min, $inp_min, $span_max, $inp_max)
    $filters.append($filter)})

    $main.append($filters)
}

//----------------------------------------------

function createSorters(sorters) {
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

                let $span_up = document.createElement('span')
                $span_up.textContent = 'По возрастанию'
            $block_up.append($inp_up, $span_up)

            let $block_down = document.createElement('div')
                let $inp_down = document.createElement('input')
                $inp_down.name = obj.id
                $inp_down.type = 'radio'
                $inp_down.value = -1
                obj.sort == -1 ? $inp_down.checked = true : $inp_down.checked = false

                let $span_down = document.createElement('span')
                $span_down.textContent = 'По убыванию'
            $block_down.append($inp_down, $span_down)

            let $block_zero = document.createElement('div')
                let $inp_zero = document.createElement('input')
                $inp_zero.name = obj.id
                $inp_zero.type = 'radio'
                $inp_zero.value = 0
                obj.sort == 0 ? $inp_zero.checked = true : $inp_zero.checked = false

                let $span_zero = document.createElement('span')
                $span_zero.textContent = 'Не сортировать'
            $block_zero.append($inp_zero, $span_zero)

        $sorter.append($h3, $block_up, $block_down, $block_zero)
    $sorters.append($sorter)})

    $main.append($sorters)
}