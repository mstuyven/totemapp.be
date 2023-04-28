const PROFILE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px"><g><rect fill="none" height="24" width="24"></rect></g><g><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"></path></g></svg>';
const STAR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px"><path d="M0 0h24v24H0z" fill="none"></path><path d="M0 0h24v24H0z" fill="none"></path><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>'
const TRAIT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px"><g><rect fill="none" height="24" width="24"></rect></g><g><g><path d="M13,8.57c-0.79,0-1.43,0.64-1.43,1.43s0.64,1.43,1.43,1.43s1.43-0.64,1.43-1.43S13.79,8.57,13,8.57z"></path><path d="M13,3C9.25,3,6.2,5.94,6.02,9.64L4.1,12.2C3.85,12.53,4.09,13,4.5,13H6v3c0,1.1,0.9,2,2,2h1v3h7v-4.68 c2.36-1.12,4-3.53,4-6.32C20,6.13,16.87,3,13,3z M16,10c0,0.13-0.01,0.26-0.02,0.39l0.83,0.66c0.08,0.06,0.1,0.16,0.05,0.25 l-0.8,1.39c-0.05,0.09-0.16,0.12-0.24,0.09l-0.99-0.4c-0.21,0.16-0.43,0.29-0.67,0.39L14,13.83c-0.01,0.1-0.1,0.17-0.2,0.17h-1.6 c-0.1,0-0.18-0.07-0.2-0.17l-0.15-1.06c-0.25-0.1-0.47-0.23-0.68-0.39l-0.99,0.4c-0.09,0.03-0.2,0-0.25-0.09l-0.8-1.39 c-0.05-0.08-0.03-0.19,0.05-0.25l0.84-0.66C10.01,10.26,10,10.13,10,10c0-0.13,0.02-0.27,0.04-0.39L9.19,8.95 c-0.08-0.06-0.1-0.16-0.05-0.26l0.8-1.38c0.05-0.09,0.15-0.12,0.24-0.09l1,0.4c0.2-0.15,0.43-0.29,0.67-0.39l0.15-1.06 C12.02,6.07,12.1,6,12.2,6h1.6c0.1,0,0.18,0.07,0.2,0.17l0.15,1.06c0.24,0.1,0.46,0.23,0.67,0.39l1-0.4c0.09-0.03,0.2,0,0.24,0.09 l0.8,1.38c0.05,0.09,0.03,0.2-0.05,0.26l-0.85,0.66C15.99,9.73,16,9.86,16,10z"></path></g></g></svg>';
const PROFILE_COLORS = [
    'E91E63',
    'F44336',
    'FF9800',
    'FFEB3B',
    'CDDC39',
    '4CAF50',
    '009688',
    '00BCD4',
    '2196F3',
    '3F51B5',
    '9C27B0',
    '795548',
];

// https://stackoverflow.com/a/22373061
function decodeUtf8(array) {
    let char2, char3;
    let out = '';
    let i = 0;
    while(i < array.length) {
        const c = array[i++];
        switch(c >> 4) { 
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                            ((char2 & 0x3F) << 6) |
                            ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
}

function isIos() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
}

/**
 * @param {string} code 
 */
async function loadProfile(code) {
    /** @type {{ name: string, color: number, animals: number[], traits: number[] }} */
    const profile = Object.create(null);
    const bytes = Uint8Array.from(atob(code), c => c.charCodeAt(0));

    let cursor = 0;
    const versionId = bytes[cursor++];
    switch (versionId) {
        case 1:
            const nameLength = bytes[cursor++];
            profile.name = decodeUtf8(bytes.slice(cursor, cursor + nameLength));
            cursor += nameLength;
            profile.color = bytes[cursor++];

            const animalLength = bytes[cursor++];
            const animalBytes = bytes.slice(cursor, cursor + animalLength);
            cursor += animalLength;
            profile.animals = [];
            for (let i = 0; i < animalBytes.length; i += 1) {
                let id = animalBytes[i];
                if (id == 255) {
                    i += 1;
                    id += animalBytes[i] - 1;
                }
                profile.animals.push(id);
            }

            const traitLength = 360 / 8;
            const traitBytes = bytes.slice(cursor, cursor + traitLength);
            cursor += traitLength;
            const traitBitset = [];
            for (let i = 0; i < traitLength; i += 1) {
                const n = traitBytes[i];
                traitBitset.push(n & (1 << 0) > 0);
                traitBitset.push(n & (1 << 1) > 0);
                traitBitset.push(n & (1 << 2) > 0);
                traitBitset.push(n & (1 << 3) > 0);
                traitBitset.push(n & (1 << 4) > 0);
                traitBitset.push(n & (1 << 5) > 0);
                traitBitset.push(n & (1 << 6) > 0);
                traitBitset.push(n & (1 << 7) > 0);
            }
            profile.traits = [];
            for (let i = 0; i < traitBitset.length; i += 1) {
                if (traitBitset[i]) {
                    profile.traits.push(i + 1);
                }
            }
            break;
        default:
            // TODO
    }

    if (profile.name) {
        const card = document.createElement('div');
        document.querySelector('main').prepend(card);
        card.classList.add('card');

        const head = document.createElement('div');
        card.append(head);
        head.classList.add('card-row');
        head.textContent = profile.name;
        head.style.fill = '#' + PROFILE_COLORS[profile.color];
        head.insertAdjacentHTML('afterbegin', PROFILE_ICON);

        if (profile.animals.length > 0) {
            const animals = document.createElement('div')
            card.append(animals);
            animals.classList.add('card-row');
            const animalList = document.createElement('span');
            animals.append(animalList);
            animalList.classList.add('animal-list');
            animalList.textContent = profile.animals.length + ' favorieten';
            animals.insertAdjacentHTML('afterbegin', STAR_ICON);
        }

        const traits = document.createElement('div')
        card.append(traits);
        traits.classList.add('card-row');
        traits.textContent = profile.traits.length + ' eigenschappen';
        traits.insertAdjacentHTML('afterbegin', TRAIT_ICON);

        document.querySelector('.app-link-text').textContent = 'Toevoegen in de app';
    }

    if (profile.animals && profile.animals.length > 0) {
        const totems = await fetch('https://raw.githubusercontent.com/ScoutsGidsenVL/totem-app-2023/main/assets/content/totems.json').then(r => r.json());

        const animalNames = profile.animals.map(id => totems.animals[id-1].name);
        document.querySelector('.animal-list').textContent = animalNames.join(', ');
    }
}

/**
 * @param {string} name
 */
async function loadTotem(name) {
    const totems = await fetch('https://raw.githubusercontent.com/ScoutsGidsenVL/totem-app-2023/main/assets/content/totems.json').then(r => r.json());

    const totem = totems.animals.find(t => t.name.toLowerCase() == name.toLowerCase());
    if (totem) {
        const card = document.createElement('div');
        document.querySelector('main').prepend(card);
        card.classList.add('card');

        const head = document.createElement('div');
        card.append(head);
        head.classList.add('card-row');
        head.textContent = `${totem.id}. ${totem.name}`;

        const synonyms = document.createElement('div');
        card.append(synonyms);
        synonyms.classList.add('card-row');
        synonyms.textContent = totem.synonyms.join(', ');

        const divider = document.createElement('hr');
        card.append(divider);
        divider.classList.add('card-divider');

        const description = document.createElement('div');
        card.append(description);
        description.classList.add('card-row', 'description');
        description.textContent = totem.description;

        const traits = document.createElement('div');
        card.append(traits);
        traits.classList.add('card-row');
        traits.textContent = totem.traits.join(', ');
        traits.insertAdjacentHTML('afterbegin', TRAIT_ICON);
    }
}

function main() {
    document.querySelector('.app-link').href = isIos()
        ? 'https://apps.apple.com/be/app/totemapp/id1108427127'
        : 'https://play.google.com/store/apps/details?id=be.scoutsengidsenvlaanderen.totemapp';

    const params = new URL(document.location).searchParams;
    if (params.has('p')) {
        loadProfile(params.get('p'));
    } else if (params.has('t')) {
        loadTotem(params.get('t'));
    }
}

main();
