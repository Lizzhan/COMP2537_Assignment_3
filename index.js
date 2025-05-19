var clicks = 0;
var cardCount = 1;
var gameWon;
var timeLeft = 60; 
var timerInterval;
const POKI_DEX = 'https://pokeapi.co/api/v2/pokemon';
const MAX = 1025;

const grid = document.getElementById('game_grid');
const navbar = document.getElementById('navbar-example2');
const clickDisplay = document.getElementById('clicks');
const messageDisplay = document.getElementById('message');

function setGridLayout(difficulty) {
  grid.className = ''; 
  if (difficulty === 'easy') grid.classList.add('easy-layout');
  if (difficulty === 'medium') grid.classList.add('medium-layout');
  if (difficulty === 'hard') grid.classList.add('hard-layout');
}


document.getElementById("light-button").addEventListener("click", () => {
  document.body.classList.add("light-mode");
  document.body.classList.remove("dark-mode");
});

document.getElementById("dark-button").addEventListener("click", () => {
  document.body.classList.add("dark-mode");
  document.body.classList.remove("light-mode");
});



function startTimer(duration) {
  timeLeft = duration;
  document.getElementById("timer").textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval); 
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
    startTimer(60);
});

document.getElementById("reset").addEventListener("click", () => {
  const grid = document.getElementById("game_grid");
  grid.innerHTML = "";

  clearInterval(timerInterval);

  document.getElementById("clicks").textContent = 0;
  document.getElementById("timer").textContent = "--";
  document.getElementById("message").textContent = "";

  grid.className = "";
});

document.getElementById("powerup").addEventListener("click", ()=>{
  const cards = document.querySelectorAll(".card:not(.matched)");
  cards.forEach(card => card.classList.add("flip"));

  setTimeout(() => {
    cards.forEach(card => card.classList.remove("flip"));
  }, 3000);
});


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

async function getPokemon(){
  let num = Math.floor(Math.random() * 1025) + 1;
  let res = await fetch(`${POKI_DEX}/${num}`)
  let mon = await res.json();
  let link = mon.sprites.other['official-artwork'].front_default;

  createCard(link);
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

function renderCards(pairNum) {
  const imageLinks = [];

  async function getValidPokemon() {
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

  getValidPokemon();
};

function setup(pairs) {
  renderCards(pairs);
  
  let clickedPairs = 0;

  let firstCard = undefined;
  let secondCard = undefined;
  let lockBoard = false; 

  $("#game_grid").on("click", ".card", function () {
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
  }
};

$(document).ready();