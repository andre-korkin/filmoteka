const $header = document.querySelector('header')
const $main = document.querySelector('main')

const $menu = $header.querySelector('#menu')  // открывашка фильтров
$menu.addEventListener('click', function() {
    if(this.textContent === 'Открыть') {
        this.textContent = 'Закрыть'
        $header.classList.remove('close')
        $header.classList.add('open')
    }
    else {
        this.textContent = 'Открыть'
        $header.classList.remove('open')
        $header.classList.add('close')
    }
})

$main.innerHTML = '<h1>Filmoteka</h1>'
//----------------------------------------------

class Filter {
    constructor(id, min, max) {
        this.id = id
        this.min = min
        this.max = max

        let $filter = $header.querySelector(`#${this.id}`)

        let $inp1 = $filter.querySelector(`#${this.id}_min`)
        $inp1.min = this.min
        $inp1.max = this.max

        let $inp2 = $header.querySelector(`#${this.id}_max`)
        $inp2.min = this.min
        $inp2.max = this.max
    }
}

const $filter_year = new Filter('filter_year', 1930, new Date().getFullYear())
const $filter_imdb = new Filter('filter_imdb', 0, 10)
const $filter_kp = new Filter('filter_kp', 0, 10)