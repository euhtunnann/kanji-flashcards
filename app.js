const fallbackChapterData = {
    "Lesson 1 (111-120)": [
        { kanji: "住む", furigana: "すむ", meaningEn: "to live", meaningMm: "နေထိုင်သည်" },
        { kanji: "住民", furigana: "じゅうみん", meaningEn: "inhabitants", meaningMm: "နေထိုင်သူများ / ပြည်သူများ" },
        { kanji: "所", furigana: "ところ", meaningEn: "place", meaningMm: "နေရာ" },
        { kanji: "住所", furigana: "じゅうしょ", meaningEn: "address", meaningMm: "လိပ်စာ" },
        { kanji: "台所", furigana: "だいどころ", meaningEn: "kitchen", meaningMm: "မီးဖိုချောင်" },
        { kanji: "場所", furigana: "ばしょ", meaningEn: "place", meaningMm: "နေရာ" },
        { kanji: "東京", furigana: "とうきょう", meaningEn: "Tokyo", meaningMm: "တိုကျို" },
        { kanji: "東京都", furigana: "とうきょうと", meaningEn: "metropolis of Tokyo", meaningMm: "တိုကျိုမြို့တော်ဒေသ" },
        { kanji: "都合", furigana: "つごう", meaningEn: "convenience", meaningMm: "အဆင်ပြေမှု" },
        { kanji: "首都", furigana: "しゅと", meaningEn: "capital", meaningMm: "မြို့တော်" },
        { kanji: "京都府", furigana: "きょうとふ", meaningEn: "Kyoto Prefecture", meaningMm: "ကျိုတိုဖု" },
        { kanji: "大阪府", furigana: "おおさかふ", meaningEn: "Osaka Prefecture", meaningMm: "အိုဆာကာဖု" },
        { kanji: "政府", furigana: "せいふ", meaningEn: "government", meaningMm: "အစိုးရ" },
        { kanji: "山口県", furigana: "やまぐちけん", meaningEn: "Yamaguchi Prefecture", meaningMm: "ယာမဂုချိခဲန်" },
        { kanji: "県知事", furigana: "けんちじ", meaningEn: "prefectural governor", meaningMm: "ခရိုင်အုပ်ချုပ်ရေးမှူး" },
        { kanji: "京都市", furigana: "きょうとし", meaningEn: "Kyoto City", meaningMm: "ကျိုတိုမြို့" },
        { kanji: "市長", furigana: "しちょう", meaningEn: "mayor", meaningMm: "မြို့တော်ဝန်" },
        { kanji: "市場", furigana: "いちば", meaningEn: "market", meaningMm: "စျေး" },
        { kanji: "北区", furigana: "きたく", meaningEn: "Kita Ward", meaningMm: "ကီတာခူ" },
        { kanji: "文京区", furigana: "ぶんきょうく", meaningEn: "Bunkyo Ward", meaningMm: "ဘွန်ကျိုခူ" },
        { kanji: "区長", furigana: "くちょう", meaningEn: "ward mayor", meaningMm: "ခရိုင်/ဝါ့ဒ် အုပ်ချုပ်ရေးမှူး" },
        { kanji: "町", furigana: "まち", meaningEn: "town", meaningMm: "မြို့ငယ်" },
        { kanji: "下町", furigana: "したまち", meaningEn: "downtown", meaningMm: "မြို့အောက်ပိုင်း / downtown" },
        { kanji: "町長", furigana: "ちょうちょう", meaningEn: "town mayor", meaningMm: "မြို့ငယ်အုပ်ချုပ်ရေးမှူး" },
        { kanji: "村", furigana: "むら", meaningEn: "village", meaningMm: "ရွာ" },
        { kanji: "村人", furigana: "むらびと", meaningEn: "villager", meaningMm: "ရွာသား" },
        { kanji: "村長", furigana: "そんちょう", meaningEn: "village leader", meaningMm: "ရွာသူကြီး" }
    ]
};

let chapterData = {};
let currentChapter = "";
let currentCardIndex = 0;
let isRandomOrder = false;
let cards = [];

const cardElement = document.getElementById("flashcard");
const frontKanji = document.getElementById("front-kanji");
const backKanji = document.getElementById("back-kanji");
const backFurigana = document.getElementById("back-furigana");
const backMeaning = document.getElementById("back-meaning");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const cardCounter = document.getElementById("card-counter");
const progressBar = document.getElementById("progress-bar");
const pronounceBtn = document.getElementById("pronounce-btn");
const chapterSelect = document.getElementById("chapter-select");
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const randomOrderToggle = document.getElementById("random-order-toggle");
const vocabularyList = document.getElementById("vocabulary-list");

function normalizeCards(rawCards) {
    return rawCards.map((item) => ({
        kanji: item.kanji || "",
        furigana: item.reading || item.furigana || "",
        meaningEn: item.meaning_en || item.meaningEn || "",
        meaningMm: item.meaning_mm || item.meaningMm || ""
    }));
}

function chapterMenuLabel(json) {
    const sh = json.source_headwords;
    const range = sh && sh.from != null && sh.to != null ? ` (${sh.from}-${sh.to})` : "";
    return `Lesson ${json.chapter}: ${json.title}${range}`;
}

async function loadChapterData() {
    const maxChapter = 20;
    const results = await Promise.all(
        Array.from({ length: maxChapter }, (_, i) => i + 1).map(async (n) => {
            try {
                const res = await fetch(`data/chapter${n}.json`, { cache: "no-store" });
                if (!res.ok) return null;
                const json = await res.json();
                return { label: chapterMenuLabel(json), cards: normalizeCards(json.cards || []) };
            } catch {
                return null;
            }
        })
    );
    chapterData = {};
    results.forEach((entry) => {
        if (entry) chapterData[entry.label] = entry.cards;
    });
    if (Object.keys(chapterData).length === 0) {
        chapterData = fallbackChapterData;
    }
}

function getMeaningLine(card) {
    const en = card.meaningEn?.trim();
    const mm = card.meaningMm?.trim();
    if (en && mm) return `${en} | ${mm}`;
    return en || mm || "";
}

function populateChapters() {
    chapterSelect.innerHTML = "";
    Object.keys(chapterData).forEach((chapterName) => {
        const option = document.createElement("option");
        option.value = chapterName;
        option.textContent = chapterName;
        chapterSelect.appendChild(option);
    });
}

function setTexts(card) {
    frontKanji.textContent = card.kanji;
    backKanji.textContent = card.kanji;
    backFurigana.textContent = card.furigana;
    backMeaning.textContent = getMeaningLine(card);
}

function updateCounterAndProgress() {
    cardCounter.textContent = cards.length > 0 ? `Card ${currentCardIndex + 1} of ${cards.length}` : "Empty Deck";
    const progressPercentage = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0;
    progressBar.style.width = `${progressPercentage}%`;
}

function updateCard() {
    if (cards.length === 0) {
        frontKanji.textContent = "Empty";
        backKanji.textContent = "Empty";
        backFurigana.textContent = "";
        backMeaning.textContent = "No cards in this chapter.";
        updateCounterAndProgress();
        return;
    }
    const card = cards[currentCardIndex];
    if (cardElement.classList.contains("is-flipped")) {
        cardElement.classList.remove("is-flipped");
        setTimeout(() => setTexts(card), 300);
    } else {
        setTexts(card);
    }
    updateCounterAndProgress();
}

function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
}

function populateVocabularyList() {
    vocabularyList.innerHTML = "";
    const deck = chapterData[currentChapter] || [];
    deck.forEach((card) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="vocab-info">
                <div class="vocab-kanji">${escapeHtml(card.kanji)}</div>
                <div class="vocab-details">
                    <span class="vocab-furi">${escapeHtml(card.furigana)}</span>
                    <span class="vocab-meaning">${escapeHtml(getMeaningLine(card))}</span>
                </div>
            </div>
        `;
        vocabularyList.appendChild(li);
    });
}

function nextCard() {
    if (cards.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    updateCard();
}

function prevCard() {
    if (cards.length === 0) return;
    currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
    updateCard();
}

function shuffleDeckBehavior(updateUI) {
    for (let i = cards.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    currentCardIndex = 0;
    if (updateUI) updateCard();
}

function pronounceWord() {
    if (cards.length === 0) return;
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(cards[currentCardIndex].kanji);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

function setupEventListeners() {
    cardElement.addEventListener("click", () => cardElement.classList.toggle("is-flipped"));
    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        nextCard();
    });
    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        prevCard();
    });
    shuffleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        isRandomOrder = true;
        randomOrderToggle.checked = true;
        shuffleDeckBehavior(true);
    });
    pronounceBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        pronounceWord();
    });
    chapterSelect.addEventListener("change", (e) => {
        currentChapter = e.target.value;
        cards = [...(chapterData[currentChapter] || [])];
        currentCardIndex = 0;
        if (isRandomOrder) shuffleDeckBehavior(false);
        updateCard();
    });
    randomOrderToggle.addEventListener("change", (e) => {
        isRandomOrder = e.target.checked;
        cards = [...(chapterData[currentChapter] || [])];
        currentCardIndex = 0;
        if (isRandomOrder) shuffleDeckBehavior(false);
        updateCard();
    });
    settingsBtn.addEventListener("click", () => {
        populateVocabularyList();
        settingsModal.classList.remove("hidden");
    });
    closeModalBtn.addEventListener("click", () => settingsModal.classList.add("hidden"));
    settingsModal.addEventListener("click", (e) => {
        if (e.target === settingsModal) settingsModal.classList.add("hidden");
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") nextCard();
        if (e.key === "ArrowLeft") prevCard();
        if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            cardElement.classList.toggle("is-flipped");
        }
    });
}

async function init() {
    await loadChapterData();
    populateChapters();
    currentChapter = Object.keys(chapterData)[0] || "";
    cards = currentChapter ? [...chapterData[currentChapter]] : [];
    updateCard();
    setupEventListeners();
}

init();
