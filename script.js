document.addEventListener("DOMContentLoaded", () => {
    loadHistory();
    loadDarkMode();
});

function handleKeyPress(event) {
    if (event.key === "Enter") {
        searchWord();
    }
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    let icon = document.getElementById("darkModeIcon");
    let isDarkMode = document.body.classList.contains("dark-mode");

    icon.classList.toggle("fa-moon", !isDarkMode);
    icon.classList.toggle("fa-sun", isDarkMode);
    
    localStorage.setItem("darkMode", isDarkMode);
}

function loadDarkMode() {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
        document.getElementById("darkModeIcon").classList.remove("fa-moon");
        document.getElementById("darkModeIcon").classList.add("fa-sun");
    }
}

function loadHistory() {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    document.getElementById("historyList").innerHTML = history.map(word => `
        <li class="list-group-item" onclick="searchWordFromHistory('${word}')">${word}</li>
    `).join("");
}

function searchWordFromHistory(word) {
    document.getElementById("wordInput").value = word;
    searchWord();
}

async function searchWord() {
    let word = document.getElementById("wordInput").value.trim();
    let resultDiv = document.getElementById("result");
    let loader = document.querySelector(".loader");

    if (!word) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Please enter a word!</div>`;
        return;
    }

    loader.style.display = "block";

    let apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    try {
        let response = await fetch(apiUrl);
        let data = await response.json();
        loader.style.display = "none";

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Invalid API response format");
        }

        let phonetic = data[0].phonetics?.[0]?.text || "No phonetics available.";
        let meanings = data[0].meanings.map(m => `
            <p><strong>Part of Speech:</strong> ${m.partOfSpeech}</p>
            <p><strong>Definition:</strong> ${m.definitions[0].definition}</p>
            <p><strong>Example:</strong> ${m.definitions[0].example || "No example available."}</p>
        `).join("<hr>");

        resultDiv.innerHTML = `
            <div class="card">
                <h4>${word} <i class="fas fa-volume-up" onclick="speak('${word}')"></i></h4>
                <p><strong>Phonetic:</strong> ${phonetic}</p>
                ${meanings}
            </div>
        `;

        saveToHistory(word);
    } catch (error) {
        loader.style.display = "none";
        resultDiv.innerHTML = `<div class="alert alert-danger">Error fetching data! ${error.message}</div>`;
        console.error("API Fetch Error:", error);
    }
}

function speak(word) {
    let speech = new SpeechSynthesisUtterance(word);
    speechSynthesis.speak(speech);
}

function saveToHistory(word) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    if (!history.includes(word)) {
        history.push(word);
        localStorage.setItem("history", JSON.stringify(history));
    }
    loadHistory();
}
