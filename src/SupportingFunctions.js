// Synchronously fetch the RatingList Markdown file and return its content
function fetchMarkDownFromRepoSync(fileName, elementName) {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}.md?timestamp=${Date.now()}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false); // false for synchronous request
    xhr.setRequestHeader('Authorization', `token ${githubToken}`);
    xhr.setRequestHeader('Content-Type', 'text/markdown');
    xhr.send(null);

    if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.content) {
            const fileContent = decodeURIComponent(escape(window.atob(data.content)));
            const element = document.getElementById(elementName);
            if (element) {
                element.innerHTML = marked.parse(highlightYourNameInTable(fileContent));
            }
            return fileContent;
        }
    }
    console.log(`Failed to fetch file ${fileName}.md!`);
    return '';
}

// Fetch a Markdown file from the repository
function fetchMarkDownFromRepo(fileName, elementName) {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}.md?timestamp=${Date.now()}`;

    const options = {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'text/markdown',
        }
    };

    fetch(url, options)
    .then(response => response.json())
    .then(data => {
        if (data.content) {
            const fileContent = decodeURIComponent(escape(window.atob( data.content )));
            const element = document.getElementById(elementName);
            if (element) {
                element.innerHTML = marked.parse(fileContent);
            }
            return fileContent;
        } else {
            console.log(`Failed to fetch file ${fileName}.md!`);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Refresh the Backgammon Club Title
function refreshWebPageTitle () {
    const sel = document.getElementById('clubSelection');
    document.getElementById('webPageTitle').innerText = sel.options[sel.selectedIndex].text;
    document.title = sel.options[sel.selectedIndex].text;
}


//* Theme Handling

// Theme Selection Changed
function themeSelectionChanged() {
    let theme = document.getElementById('themeSelection').value;

    if (theme === 'system-theme') { // Check the system theme
        const isLightMode = window.matchMedia('(prefers-color-scheme: light)').matches;
        if (isLightMode) theme = 'light-theme';
        else theme = 'dark-theme';
    }
    document.body.classList.toggle('light-theme', theme === 'light-theme');
}

// Linear Congruential Generator (LCG) for pseudo-random number generation
class LCG {
    constructor(seed) {
        this.seed = seed;
        // Optimal parameters for a 32-bit LCG (from Numerical Recipes)
        this.m = Math.pow(2, 31); // Modulus
        this.a = 1103515245;      // Multiplier
        this.c = 12345;           // Increment
    }

    // Generates the next pseudo-random integer
    next() {
        this.seed = (this.a * this.seed + this.c) % this.m;
        return this.seed;
    }

    // Generates a pseudo-random float between 0 (inclusive) and 1 (exclusive)
    random() {
        return this.next() / this.m;
    }
}

const generator = new LCG(Date.now()); // Initialize with current time as seed

// Fisher-Yates Shuffle using the LCG
function fisherYatesShuffle(arr) {
    let n = arr.length;
    for (let i = n - 1; i > 0; i--) {
        let j = Math.floor(generator.random() * (i + 1)); // Random index from 0 to i
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
    return arr;
}

function scrollToElement(element) {
    const targetElement = document.getElementById(element);

    targetElement.scrollIntoView({
        behavior: 'smooth', // Optional: for smooth scrolling animation
        block: 'start'      // Optional: aligns the element to the top of the viewport
    });
}

// Format the UTC time stamp in a nicer way
const formatTimestamp = (timestamp)=> {
    const datetime = new Date(timestamp)
    const dateString = datetime.toISOString().split('T')[0];
    const timeString = datetime.toTimeString().split(' ')[0];
    return `${dateString} ${timeString}`;
}

// Convert a string to Title Case
function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}