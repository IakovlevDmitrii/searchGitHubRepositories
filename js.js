const search = document.getElementById('search');
const responseList = document.getElementById('responseList');
const choiceList = document.getElementById('choiceList');
const choiceStorage = {};

const debounce = (fn, debounceTime) => {
    let inDebounce;

    return function (...args) {
        clearTimeout(inDebounce);
        inDebounce = setTimeout(() => fn.apply(this, args), debounceTime);
    }
};

const searchRepository = debounce( () => {
    if (search.value.length === 0) {
        clearRepoNamesList();
        return;
    }

    getRepositoriesList(search.value)
        .then((repositoriesList) => {
            clearRepoNamesList();
            clearChoiceStorage();
            createRepoNamesList(repositoriesList);
            showList(responseList);
        })
        .catch( err => console.log (err))
}, 1000);

search.addEventListener('input', () => {
    if (search.value.length === 0) {
        clearRepoNamesList();
    }
});

search.addEventListener('input', searchRepository);

responseList.addEventListener('click', function (event) {
    createChoiceItem(event.target);
    showList(choiceList);
    clearRepoNamesList();
    search.value = '';
});

choiceList.addEventListener('click', function (event) {
    const target = event.target;

    if (target.className === 'choice_close') {
        target.closest('.choice__item').remove();
    }
});

function clearChoiceStorage() {
    for (const repository in choiceStorage) delete choiceStorage[repository];                            // Очистим сохраненные результаты предыдущего запроса
}

function clearRepoNamesList() {
    let items = responseList.querySelectorAll('.response__item');
    items.forEach((item) => item.remove());
}

function createChoiceItem(target) {
    const item =
        `<li class="choice__item">
            <div class="choice__content">
                <div>Name: ${target.textContent}</div>
                <div>Owner: ${choiceStorage[target.textContent][0]}</div>
                <div>Stars: ${choiceStorage[target.textContent][1]}</div>
            </div>
            <div class="choice_close">
                <span class="close"></span>
            </div>
        </li>`;

    choiceList.insertAdjacentHTML('afterbegin', item)
}

function createResponseItem(content) {
    let responseItem = document.createElement('li');
    responseItem.classList.add('response__item');
    responseItem.textContent = content;
    return responseItem;
}

function createRepoNamesList(list) {
    if(!list.length) return;    // Если поиск не дал результата

    let responsesNumber = 5;
    if(list.length < 5) {       // Если поиск даст меньше пяти результатов
        responsesNumber = list.length;
    }

    for (let i = 0; i < responsesNumber; i++) {
        let repository = list[i];
        let repositoryName = repository.name;
        let responseItem = createResponseItem(repositoryName);
        responseList.append(responseItem);

        choiceStorage[repositoryName] = [
            repository.owner.login,
            repository.stargazers_count
        ]
    }
}

async function getRepositoriesList(content) {
    let url = 'https://api.github.com/search/repositories?q=' + content;
    let responseJson = await fetch(url);
    let response = await responseJson.json();
    return response.items;
}

function showList(list) {
    list.classList.remove('hidden');
}