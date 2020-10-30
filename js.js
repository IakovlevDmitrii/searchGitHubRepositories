// Поле для ввода запроса
const requestField = document.getElementById('requestField')

// Список имен репозиториев
const responseList = document.getElementById('responseList')

// Список выбранных пользователем репозиториев
const choiceList = document.getElementById('choiceList')

// Для временного хранения результатов поиска
let choice = {}

// Функция для задержки отправки запроса
const debounce = (fn, debounceTime) => {
    let inDebounce
    return function (...args) {
        clearTimeout(inDebounce)
        inDebounce = setTimeout(() => fn.apply(this, args), debounceTime)
    }
}

// Когда пользователь начинает заполнять поле запроса
requestField.addEventListener('input', () => {

    /* Если пользователь очистил поле запроса,
     закроем список результотов запроса */
    if (requestField.value.length === 0) {
        responseList.classList.add('hidden')
    }
    // Через 2 секунды после окончания ввода запроса
    debounce(() => {

        // Если поле для ввода пустое, не будем делать запрос
        if (requestField.value.length === 0) return

        // Иначе, сделаем запрос, получим результат
        getResponse()
            .then((response) => {
                // Из результата запроса составим список имен репозиториев
                createRepoNameList(response)
                // И покажем этот список
                responseList.classList.remove('hidden')
            })
    }, 2000)()
})

// Когда пользователь выберет репозиторий из списка результатов запроса
responseList.addEventListener('click', function (event) {

    // Определим выбранный репозиторий
    let targetRepository = event.target
    // Создадим элемент с информацией о выбранном репозитории
    let choiceItem = createChoiceItem(targetRepository)

    // Удалим репозиторий из списка результотов поиска
    targetRepository.remove()

    // Добавим созданный элемент в список выбранных репозиториев
    choiceList.append(choiceItem)
    // Покажем список выбранных репозиториев
    choiceList.classList.remove('hidden')
})

// Если пользователь захочет удалить репозиторий из списка ранее выбранных
choiceList.addEventListener('click', function (event) {
    // Определим репозиторий
    let target = event.target
    // Убедимся, что пользователь хочет удалить репозиторий
    if (target.className === 'close') {
        // Удалим элемент из списка сохраненных репозиториев
        target.closest('.choice__item').remove()
    }
})

// Функция для поиска репозиториев
async function getResponse() {
    // Будем искать то, что ввел пользователь
    let requestText = requestField.value
    let url = 'https://api.github.com/search/repositories?q=' + requestText
    // Ответ придет в формате JSON
    let responseJson = await fetch(url)
    // Функция вернет объект
    return responseJson.json()
}

// Функция для создания списка имен репозиториев полученных в результате запроса
function createRepoNameList(object) {

    // Очистим список результатов предыдущего запроса
    let oldSearch = responseList.querySelectorAll('.response__item')
    oldSearch.forEach((item) => item.remove())

    // Очистим сохраненные результаты предыдущего запроса
    for (let repo in choice) delete choice[repo]

    // Возьмем пять первых репозиториев из результата запроса
    for (let i = 0; i < 5; i++) {

        // Данные о репозитории
        let repositoryData = object.items[i]
        // Имя репозитория
        let repositoryName = repositoryData.name

        // Создадим элемент для списка результов запроса
        let responseItem = document.createElement('li')
        responseItem.classList.add('response__item')
        responseItem.textContent = repositoryName
        // Добавим элемент в список результатов запроса
        responseList.append(responseItem)

        // Сохраним в объект choice имя автора и количесво звезд репозитория
        choice[repositoryName] = [
            repositoryData.owner.login,
            repositoryData.stargazers_count
        ]
    }
}

// Функция для создания элемента выбранного репозитория
function createChoiceItem(target) {

    let choiceItem = document.createElement('li');
    choiceItem.classList.add('choice__item');

    let choiceContent = document.createElement('div');
    choiceContent.classList.add('choice__content');

    let choiceName = document.createElement('div');
    choiceName.textContent = `Name: ${target.textContent}`
    choiceContent.append(choiceName)

    // Информацию о выбранном репозитории будем брать из объекта choice
    let choiceOwner = document.createElement('div')
    choiceOwner.textContent = `Owner: ${choice[target.textContent][0]}`
    choiceContent.append(choiceOwner)

    let choiceStars = document.createElement('div')
    choiceStars.textContent = `Stars: ${choice[target.textContent][1]}`
    choiceContent.append(choiceStars)

    choiceItem.append(choiceContent)

    let close = document.createElement('span')
    close.classList.add('close')
    choiceItem.append(close);

    return choiceItem
}
