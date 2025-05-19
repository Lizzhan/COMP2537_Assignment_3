var clicks = 0;
var cardCount = 1;
var canPlay = false;
var timeLeft = 60; 
var timerInterval;
var clickedPairs = 0;

const POKI_DEX = 'https://pokeapi.co/api/v2/pokemon';
const MAX = 1025;

const body = document.body;
const grid = document.getElementById('game_grid');
const navbar = document.getElementById('navbar-example2');
const toggleBtn = document.getElementById("theme-toggle");
const clickDisplay = document.getElementById('clicks');
const messageDisplay = document.getElementById('message');
const tpDisplay = document.getElementById('tp');
const pcDisplay = document.getElementById('pc');
const plDisplay = document.getElementById('pl');

function setTheme(isDark) {
  if (isDark) {
    body.classList.add("dark-mode");
    body.classList.remove("light-mode");
    toggleBtn.textContent = "☀️ Light Mode";
    toggleBtn.className = "btn btn-outline-light";
  } else {
    body.classList.add("light-mode");
    body.classList.remove("dark-mode");
    toggleBtn.textContent = "🌙 Dark Mode";
    toggleBtn.className = "btn btn-outline-dark";
  }
}

toggleBtn.addEventListener("click", () => {
  const isCurrentlyDark = body.classList.contains("dark-mode");
  setTheme(!isCurrentlyDark);
});

window.addEventListener("DOMContentLoaded", () => {
  setTheme(true); 
});

function setGridLayout(difficulty) {
  grid.className = ''; 
  if (difficulty === 'easy') grid.classList.add('easy-layout');
  if (difficulty === 'medium') grid.classList.add('medium-layout');
  if (difficulty === 'hard') grid.classList.add('hard-layout');
}

function startTimer(duration) {
  timeLeft = duration;
  document.getElementById("timer").textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval); 
      
      canPlay = false;
      messageDisplay.innerHTML="TIMES UP! YOU LOST!";
    }
  }, 1000);
};

function stopTimer() {
  clearInterval(timerInterval); 
};


document.getElementById("easy").addEventListener("click", () => {
  setGridLayout("easy");
  grid.innerHTML = "";
  setup(3); 
});

document.getElementById("medium").addEventListener("click", () => {
  setGridLayout("medium");
  grid.innerHTML = "";
  setup(6);
});

document.getElementById("hard").addEventListener("click", () => {
  setGridLayout("hard");
  grid.innerHTML = "";
  setup(10); 
});

document.getElementById("start").addEventListener("click", ()=>{
  canPlay = true;
  if(grid.classList.contains('hard-layout')){
    const cards = document.querySelectorAll(".card:not(.matched)");
    cards.forEach(card => card.classList.add("flip"));

    setTimeout(() => {
      cards.forEach(card => card.classList.remove("flip"));
    }, 2000);
    startTimer(40);
  }else{
    startTimer(30);
  }
  
});

document.getElementById("reset").addEventListener("click", () => {
  canPlay = true;
  const grid = document.getElementById("game_grid");
  grid.innerHTML = "";

  clearInterval(timerInterval);

  document.getElementById("clicks").textContent = "--";
  document.getElementById("timer").textContent = "--";
  document.getElementById("message").textContent = "";
  tpDisplay.textContent = "--"
  pcDisplay.textContent = "--"
  plDisplay.textContent = "--"
  clickedPairs = 0;
  grid.className = "";
});

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function createCard(link){
    const card = document.createElement("div");
    card.className = "card";

    const frontImg = document.createElement("img");
    frontImg.id = `img${cardCount}`;
    cardCount++;

    frontImg.className = "front_face";
    frontImg.src = link;
    frontImg.alt = "";

    const backImg = document.createElement("img");
    backImg.className = "back_face";
    backImg.src = "back.webp";
    backImg.alt = "";

    card.appendChild(frontImg);
    card.appendChild(backImg);
    grid.appendChild(card);
};

async function getValidPokemon(pairNum) {
    let imageLinks = [];
    while (imageLinks.length < pairNum) {
      let num = Math.floor(Math.random() * MAX) + 1;
      let res = await fetch(`${POKI_DEX}/${num}`);
      let mon = await res.json();
      let link = mon.sprites.other['official-artwork'].front_default;

      if (link && !imageLinks.includes(link)) {
        imageLinks.push(link);
      }
    }

    const doubled = [...imageLinks, ...imageLinks];
    const shuffled = shuffle(doubled);

    shuffled.forEach(link => createCard(link));
}

function setup(pairs) {
  getValidPokemon(pairs);
  tpDisplay.innerHTML = pairs;

  let firstCard = undefined;
  let secondCard = undefined;
  let lockBoard = false; 

  $("#game_grid").on("click", ".card", function () {
    if (!canPlay) return;
    if (lockBoard) return;         
    if ($(this).hasClass("flip")) return;

    clicks++;
    clickDisplay.innerHTML = clicks;
    console.log(clicks);
    $(this).toggleClass("flip");

    if (!firstCard) {
      firstCard = $(this).find(".front_face")[0];
    } else {
      secondCard = $(this).find(".front_face")[0];

      if (secondCard === firstCard) {
        console.log("Cannot click the same card twice");
        secondCard = undefined;
        return;
      }

      console.log(firstCard, secondCard);

      if (firstCard.src === secondCard.src) {
        console.log("Match!");
        $(`#${firstCard.id}`).parent().off("click");
        $(`#${secondCard.id}`).parent().off("click");

        firstCard = undefined;
        secondCard = undefined;
        clickedPairs++;
        pcDisplay.innerHTML = clickedPairs;
        plDisplay.innerHTML = pairs - clickedPairs;
        winCheck(pairs, clickedPairs);
      } else {
        console.log("No match");
        lockBoard = true; 

        setTimeout(() => {
          $(`#${firstCard.id}`).parent().toggleClass("flip");
          $(`#${secondCard.id}`).parent().toggleClass("flip");

          firstCard = undefined;
          secondCard = undefined;
          lockBoard = false; 
        }, 1000);
      }
    }
  });
};


function winCheck(pairs, clickedPairs){
  if(clickedPairs === pairs){
    messageDisplay.innerHTML = "YOU WIN!"
    stopTimer()
    clickedPairs = 0;
  }
};

$(document).ready();