const contentSearch = document.getElementById('content-search');
const contentAdd = document.getElementById('content-add');
let menu;

const dropzoneFile = document.getElementById('dropzone-file');
const dropzoneLabel = document.getElementById('dropzone-label');
let file;

let searchFailure = document.getElementById('search-failure');
let searchSuccess = document.getElementById('search-success');

const dropzonesFile = document.getElementById('dropzones-file');
const dropzonesLabel = document.getElementById('dropzones-label');
let files = [];

let submitSuccess = document.getElementById('submit-success');
let submitFailure = document.getElementById('submit-failure');

document.addEventListener('DOMContentLoaded', () => {
    menu = 'menu-search';
    applyMenu();

    dropzoneFile.style.display = 'none';
    submitSuccess.style.display = 'none';
    submitFailure.style.display = 'none';

    searchSuccess.style.display = 'none';
    searchFailure.style.display = 'none';
})

function handleMenuClick(event) {
    menu = event.target.id;
    applyMenu();
}

function applyMenu() {
    if (menu === 'menu-search') {
        contentAdd.style.display = 'none';
        contentSearch.style.display = 'block';
    } else if (menu === 'menu-add') {
        contentSearch.style.display = 'none';
        contentAdd.style.display = 'block';
    }
}

function dragOverHandler(event) {
    event.preventDefault();
}

function dropHandler(event) {
    console.log('File(s) dropped');
    event.preventDefault();
    if (event.dataTransfer.items) {
        for (var i = 0; i < event.dataTransfer.items.length; i++) {
            if (event.dataTransfer.items[i].kind === 'file') {
                file = event.dataTransfer.items[i].getAsFile();
                loadFile();
            }
        }
    } else {
        for (var i = 0; i < event.dataTransfer.files.length; i++) {
            file = event.dataTransfer.files[i];
            loadFile();
        }
    }
}

function changeHandler(event) {
    event.preventDefault();
    if (event.target.files && event.target.files.length > 0) {
        file = event.target.files[0];
        if (file.type.split('/')[0] !== 'image') {
            console.error('Unsupported file type');
            return;
        }
        loadFile();
    }
}

function loadFile() {
    let reader = new FileReader();
    reader.onload = () => {
        dropzoneLabel.style.display = 'none';
        dropzoneFile.style.display = 'block';
        dropzoneFile.setAttribute('src', reader.result);
    };
    reader.readAsDataURL(file);
}

// For file search
function clickHandler(event) {
    if (event.target.id === 'search') {
        if (file) {
            document.querySelector('#search').classList.add('loading');
            let reader = new FileReader();
            reader.onload = () => {
                let request = new XMLHttpRequest();
                request.onreadystatechange = (event) => {
                    if (request.readyState === XMLHttpRequest.DONE) {
                        document.querySelector('#search').classList.remove('loading');
                        if (request.status === 200) {
                            let faces = JSON.parse(request.responseText);
                            if (faces && faces.length > 0) {
                                let faceId = faces[0].faceId;

                                //For persons
                                let personsRequest = new XMLHttpRequest();
                                personsRequest.onreadystatechange = () => {
                                    if (personsRequest.readyState === XMLHttpRequest.DONE) {
                                        if (personsRequest.status === 200) {
                                            let persons = JSON.parse(personsRequest.responseText);
                                            if (persons && persons.length > 0) {
                                                let person;
                                                for (let i = 0; i < persons.length; i++) {
                                                    setTimeout(() => {
                                                        let req = new XMLHttpRequest();

                                                        req.onreadystatechange = () => {
                                                            if (req.readyState === XMLHttpRequest.DONE) {
                                                                if (req.status === 200) {
                                                                    let data = JSON.parse(req.responseText);
                                                                    if (data.isIdentical) {
                                                                        person = persons[i];
                                                                        searchSuccess.style.display = 'block';
                                                                        document.querySelector('#response-name').innerText = person.name;
                                                                        document.querySelector('#response-id').innerText = person.personId;
                                                                        document.querySelector('#response-description').innerText = person.userData;
                                                                        document.querySelector('#response-images').innerText = person.persistedFaceIds.length + ' pictures saved';
                                                                        this.break;
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        req.open('POST', 'https://francecentral.api.cognitive.microsoft.com/face/v1.0/verify', true);
                                                        req.setRequestHeader('Content-type', 'application/json');
                                                        req.setRequestHeader('Ocp-Apim-Subscription-Key', '9d36ab9dbc24441a9d22e268c1f08b0b');
                                                        req.send(JSON.stringify({ "faceId": faceId, "personId": persons[i].personId, "personGroupId": "zone-group" }))
                                                    }, 200);
                                                }
                                            } else {
                                                searchFailure.style.display = 'block';
                                            }
                                        }
                                    }
                                }

                                personsRequest.open('GET', 'https://francecentral.api.cognitive.microsoft.com/face/v1.0/persongroups/zone-group/persons', true);
                                personsRequest.setRequestHeader('Ocp-Apim-Subscription-Key', '9d36ab9dbc24441a9d22e268c1f08b0b');
                                personsRequest.send();
                                
                            } else {
                                searchFailure.style.display = 'block';
                            }
                        } else {
                            console.log(request.response);
                        }
                    }
                }
                request.open('POST', 'https://francecentral.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceAttributes=age,glasses,emotion', true);
                request.setRequestHeader('Content-type', 'application/octet-stream');
                request.setRequestHeader('Ocp-Apim-Subscription-Key', '9d36ab9dbc24441a9d22e268c1f08b0b');
                request.send(reader.result);
            }
            reader.readAsArrayBuffer(file);
        }
    } 
}


// For Add
function dropsHandler(event) {
    console.log('File(s) dropped');
    event.preventDefault();
    files = [];
    if (event.dataTransfer.items) {
        for (var i = 0; i < event.dataTransfer.items.length; i++) {
            if (event.dataTransfer.items[i].kind === 'file') {
                files.push(event.dataTransfer.items[i].getAsFile());
            }
        }
    } else {
        for (var i = 0; i < event.dataTransfer.files.length; i++) {
            files.push(event.dataTransfer.files[i]);
        }
    }
    loadFiles();
}

function changesHandler(event) {
    event.preventDefault();
    files = [];
    if (event.target.files && event.target.files.length > 0) {
        for (var i = 0; i < event.target.files.length; i++) {
            files.push(event.target.files[i]);
        }
        loadFiles();
    }
}

function loadFiles() {
    if (files.length > 0) {
        dropzonesLabel.style.display = 'none';
        dropzonesFile.style.display = 'block';
        for (let i = 0; i < files.length; i++) {
            let f = files[i];
            createFile(f, i);
        }
    }
}

function createFile(f, i) {
    let img = document.createElement('img');
    let reader = new FileReader();
    reader.onload = () => {
        img.setAttribute('alt', 'index ' + i);
        img.setAttribute('src', reader.result);
        img.classList.add('dropzone-file');
        dropzonesFile.appendChild(img);
    };
    reader.readAsDataURL(f);
}

function submitHandler(event) {
    event.preventDefault();

    let personRequest = new XMLHttpRequest(); //For create person

    let name = document.querySelector("#name").value;
    let description = document.querySelector("#description").value;

    let faces = [];

    if (name && description && files.length >= 1) {
        document.querySelector("#submit").classList.add('loading');

        personRequest.onreadystatechange = (event) => {
            if (personRequest.readyState === XMLHttpRequest.DONE) {
                if (personRequest.status === 200) {
                    const personId = JSON.parse(personRequest.responseText).personId;
                    for (let i = 0; i < files.length; i++) {
                        let current = files[i];
                        let reader = new FileReader();
                        reader.onload = () => {
                            let fileRequest = new XMLHttpRequest();
                            fileRequest.onreadystatechange = (event) => {
                                if (fileRequest.readyState = XMLHttpRequest.DONE) {
                                    if (fileRequest.status === 200) {
                                        if (i === files.length - 1) {
                                            document.querySelector("#submit").classList.remove('loading');
                                            submitSuccess.style.display = 'block';
                                            setTimeout(() => {
                                                submitSuccess.style.display = 'none';
                                            }, 4000);
                                        }
                                    } else {
                                      
                                    }
                                }
                            }
                            fileRequest.open('POST', 'https://francecentral.api.cognitive.microsoft.com/face/v1.0/persongroups/zone-group/persons/' + personId + '/persistedFaces', true);
                            fileRequest.setRequestHeader('Content-type', 'application/octet-stream');
                            fileRequest.setRequestHeader('Ocp-Apim-Subscription-Key', '9d36ab9dbc24441a9d22e268c1f08b0b');
                            fileRequest.send(reader.result);
                        };
                        reader.readAsArrayBuffer(current);
                    }
                } else {
                    document.querySelector("#submit").classList.remove('loading');
                    submitFailure.style.display = 'block';
                    submitFailure.innerText = personRequest.responseText;
                    setTimeout(() => {
                        submitFailure.style.display = 'none';
                    }, 4000);
                }
            }
        }

        personRequest.open('POST', 'https://francecentral.api.cognitive.microsoft.com/face/v1.0/persongroups/zone-group/persons', true);
        personRequest.setRequestHeader('Content-type', 'application/json');
        personRequest.setRequestHeader('Ocp-Apim-Subscription-Key', '9d36ab9dbc24441a9d22e268c1f08b0b');
        personRequest.send(JSON.stringify({ "name": name, "userData": description }))

    } else {
        document.querySelector("#submit").classList.remove('loading');
        submitFailure.style.display = 'block';
        submitFailure.innerText = 'Please, fill all the form';
        setTimeout(() => {
            submitFailure.style.display = 'none';
        }, 4000);
    }
}