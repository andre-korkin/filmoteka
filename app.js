const $header = document.querySelector('header')
    const $header_searh = $header.querySelector('#search')
    $header_searh.addEventListener('click', () => {
        $h1.style.display = 'none'
        $filter.style.display = 'block'
        $sorter.style.display = 'block'
    })

    const $favorites = $header.querySelector('#favorites')
    const $unviewed = $header.querySelector('#unviewed')
    const $viewed = $header.querySelector('#viewed')

const $main = document.querySelector('main')
    const $h1 = $main.querySelector('h1')
    const $filter = $main.querySelector('#filter')
    const $sorter = $main.querySelector('#sorter')

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