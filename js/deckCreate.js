let app = document.getElementById('app')
let cardArr = []    //массив карт
let clickCounter = 0    //счетчик кликов
let currentArr = []     //массив достоинств и мастей нынешних карт
let currentCard = []    //массив нынешних карт
let haveChild = false   //есть ли карты после выбранной

// массив достоинств и мастей карт
let cardValue = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "0", "J", "Q", "K"]
let cardSuit = ["H", "D", "S", "C"]
// H - Hearts, D - Diamonds, S - Spades, C - Clubs

// создание колоды из 52 карт
function deckCreate() {
    let deck = cardSuit.map(suit => {
        let pre = cardValue.map(value => {
            let card = value + suit
            return card
        })
        return pre
    })
    return deck.flat()
}


// карта может быть открытой или закрытой
// активной и неактивной
class Card {
    constructor(param, className) {
        this.value = param[0],
            this.suit = param[1],
            this.position = this.createCardDiv(className),
            this.isOpen = false,
            this.active = false
    }

    createCardDiv(parentDiv) {
        let div = document.createElement('div');
        parentDiv.appendChild(div)
        div.classList.add('card')
        if (this.value == '0') {
            div.textContent = '10'
        } else {
            div.textContent = this.value
        }
        this.createCardFace(div)
        return div
    }

    // создаем картинку у карт
    createCardFace(div) {
        let pic = document.createElement('img')
        pic.src = `images/suit/${this.suit}.svg`
        div.appendChild(pic)
        pic.classList.add('pic')
    }

    // открытие и закрытие карты
    set isOpen(value) {
        if (value == true) {
            this.position.classList.add('isOpen')
            this._isOpen = true
        } else {
            this.position.classList.remove('isOpen')
            this._isOpen = false
        }
    }
    get isOpen() {
        return this._isOpen
    }

    // // включить и выключить карту
    set active(value) {
        if (value == true) {
            this.position.classList.add('active')
            this._active = true
        } else {
            this.position.classList.remove('active')
            this._active = false
        }
    }
    get active() {
        return this._active
    }
}

// поле может быть активным и неактивным
class Field {
    constructor(parentDiv, [...className]) {
        this.position = this.createField(parentDiv, className),
            this.active = false
    }

    createField(parentClass, fieldClass) {
        let div = document.createElement('div');
        parentClass.appendChild(div)
        fieldClass.forEach(clas => {
            div.classList.add(clas, "field")

        })
        return div
    }

    // включить и выключить поле
    set active(value) {
        if (value == true) {
            this.position.classList.add('active')
            this._active = true
        } else {
            this.position.classList.remove('active')
            this._active = false
        }
    }
    get active() {
        return this._active
    }
}

// массив полей
let placesArr = []
// создали поля для карт
createLayout(app, placesArr)


// создание мест для карт
function createLayout(container, allPlacesArr) {
    // создаем главное закрытое поле
    let mainDeck = new Field(container, ["mainDeck"])
    allPlacesArr.push(mainDeck)
    // создаем главное открытое поле
    let spareDeck = new Field(container, ["spareDeck"])
    allPlacesArr.push(spareDeck)
    // создаем игровое поле (7шт)
    for (let i = 0; i < 7; i++) {
        let tableDeck = new Field(app, ['tableDeck', `tableDeck__${i}`])
        allPlacesArr.push(tableDeck)
    }
    // создаем собираемое поле (4шт)
    for (let i = 0; i < 4; i++) {
        let collectDeck = new Field(app, ['collectDeck', `collectDeck__${i}`])
        collectDeck.active = true
        allPlacesArr.push(collectDeck)
    }
}


// перемешка колоды
function deckReshuffle(array) {
    array.sort(() => Math.random() - 0.5);
    return array
}

// расстановка карт по созданным местам
function spreadCards(cardArr, placesArr) {
    for (let i = 0, x = 1, y = 2; i < x, y < 9; i++) {
        placesArr[y].position.insertAdjacentElement('beforeend', cardArr[i].position)
        if (i + 1 == x) {
            cardArr[i].isOpen = true
            cardArr[i].active = true
            x += y
            y++
        }
    }
    cardArr[51].active = true
}

// делает карту или поле активным
function makeActive(card, field) {
    if (card != null) {
        cardArr.forEach(el => {
            if (el.position == card) {
                el.active = true
            }
        })
    } else {
        if (field.className.includes('spareDeck') != true) {
            placesArr.forEach(el => {
                if (el.position == field) {
                    el.active = true
                }
            })
        }

    }
}

// делает карту неактивной
function makeInactive(card) {
    if (card != null) {
        cardArr.forEach(el => {
            if (el.position == card) {
                el.active = false
            }
        })
    }
}

// создаем стандартную сортированную колоду (пока только список масти и достоинства карты)
let deck = deckCreate()
// перемешали их
deck = deckReshuffle(deck)
// создали карты
for (let i = 0; i < deck.length; i++) {
    let q = new Card(deck[i], placesArr[0].position)
    // кладем все карты в массив
    cardArr.push(q)
}

// разложили по столу
spreadCards(cardArr, placesArr)

// для переноса карты или пачки карт (первая переносимая карта, куда переносим)
function packCards(divStart, divPush) {
    let nextExist = divStart.nextSibling
    // если есть дети переносим и их
    divPush.insertAdjacentElement('beforeend', divStart)
    if (nextExist != null) {
        packCards(nextExist, divPush)
    }
}

// для сбора данных о кликнутой карте и последующих проверок (карта, статус карты [нужно, чтобы видеть кликнутую карту])
function cardCollector(card, classStatus) {
    currentCard.push(card)
    currentArr.push(card.value)
    currentArr.push(card.suit)
    if (classStatus == true) {
        card.position.classList.add('current')
    }
}

function gameCheck(item) {
    // ПЕРВЫЙ КЛИК
    if (clickCounter == 1) {
        haveChild = false
        // если клик по карте
        // карта обязана быть активной
        if (item.isOpen != undefined && item.active == true) {
            // карта(ы) лежит на одном из игровых полей
            if (item.isOpen == true && item.position.parentElement.className.includes('tableDeck') == true) {
                // после карты есть карты
                if (item.position.nextSibling != null) {
                    haveChild = true
                    // после карты нет карт
                } else haveChild = false
                cardCollector(item, true)
                // карта открыта и не имеет следующих карт на главном открытом поле или на собираемом
            } else if ((item.isOpen == true && item.position.nextSibling == null) && (item.position.parentElement.className.includes('spareDeck') == true || item.position.parentElement.className.includes('collectDeck') == true)) {
                haveChild = false
                cardCollector(item, true)
                // карта закрыта на игровом поле
            } else if (item.isOpen == false && item.position.parentElement.className.includes('tableDeck') == true && item.position.nextSibling == null) {
                item.isOpen = true
                clickCounter = 0
                // карта закрыта на главном поле
            } else if (item.isOpen == false && item.position.parentElement.className.includes('mainDeck') == true && item.position.nextSibling == null) {
                makeActive(item.position.previousSibling, item.position.parentElement)
                // выключаем последнюю открытую карту главной колоды
                makeInactive(placesArr[1].position.lastChild)
                packCards(item.position, placesArr[1].position)
                item.isOpen = true
                clickCounter = 0
            }
            // если клик по полю
        } else if (item.isOpen == undefined) {
            // клик по главному полю
            if (item.active == true && item.position.className.includes('mainDeck') == true && item.position.childNodes.length == 0) {
                cardArr.forEach(card => {
                    if (card.position.parentElement == placesArr[1].position) {
                        packCards(card.position, placesArr[0].position)
                        card.isOpen = false
                        card.active = false
                    }
                })
                makeActive(placesArr[0].position.lastChild)
                item.active = false
            }
            clickCounter = 0
        } else {
            clickCounter = 0
        }
    }
    // ВТОРОЙ КЛИК
    if (clickCounter == 2) {
        // если клик по карте
        // которая активна, открыта и после нее ничего нет
        if (item.isOpen != undefined && item.active == true && item.isOpen == true && item.position.nextSibling == null ) {
            cardCollector(item, false)
            // ищет индекс масти в массиве значений мастей
            let firstValue = cardValue.indexOf(currentArr[0])
            let secondValue = cardValue.indexOf(currentArr[2])
            // ищет индекс достоинство в массиве значений достоинств
            let firstSuit = cardSuit.indexOf(currentArr[1])
            let secondSuit = cardSuit.indexOf(currentArr[3])

            let suitGood = false
            // карта(ы) лежит на одном из игровых полей
            if (item.position.parentElement.className.includes('tableDeck') == true) {
                // проверка доступности масти
                if ((firstSuit == 0 || firstSuit == 1) && (secondSuit == 2 || secondSuit == 3)) {
                    suitGood = true
                } else if ((firstSuit == 2 || firstSuit == 3) && (secondSuit == 0 || secondSuit == 1)) {
                    suitGood = true
                } else suitGood = false 
                if (firstValue + 1 == secondValue && suitGood == true) {
                    makeActive(currentCard[0].position.previousSibling, currentCard[0].position.parentElement)
                    packCards(currentCard[0].position, item.position.parentElement)
                }
                // карта лежит на собираемом игровом поле
            } else if (haveChild == false && item.position.parentElement.className.includes('collectDeck') == true ) {
                // проверка доступности масти
                if (firstSuit == secondSuit) {
                    suitGood = true
                } else suitGood = false
                if (firstValue - 1 == secondValue && suitGood == true) {
                    makeActive(currentCard[0].position.previousSibling, currentCard[0].position.parentElement)
                    packCards(currentCard[0].position, currentCard[1].position.parentElement)
                    item.active = false
                }
            }
        }
        // если клик по полю
        if (item.isOpen == undefined && item.active == true) {
            let firstValue = cardValue.indexOf(currentArr[0])
            // если это собираемое поле и карта туз
            // или это игровое поле и карта король
            if ((firstValue == 0 && item.position.className.includes('collectDeck') == true) || (firstValue == 12 && item.position.className.includes('tableDeck') == true)) {
                item.active = false
                let cardNeedActivate = currentCard[0].position.previousSibling
                let fieldNeedActivate = currentCard[0].position.parentElement
                makeActive(cardNeedActivate, fieldNeedActivate)
                packCards(currentCard[0].position, item.position)
            }
        }
        // сброс данных
        clickCounter = 0
        currentArr = []
        currentCard[0].position.classList.remove('current')
        currentCard = []
    }
}


// запуск слушателей событий на картах и позициях
let commonArr = placesArr.concat(cardArr)
commonArr.forEach(item => {
    item.position.addEventListener('click', (e) => {
        if (e.target == item.position) {
            clickCounter++
            gameCheck(item)
        }
    })
})

