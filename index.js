var clicks = 0;
var cardCount = 1;
const POKI_DEX = 'https://pokeapi.co/api/v2/pokemon';
const MAX = 1025;
const grid = document.getElementById('game_grid');

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function getPokemon(){
  let num = Math.floor(Math.random() * 1025) + 1;
  let res = await fetch(`${POKI_DEX}/${num}`)
  let mon = await res.json();
  let link = mon.sprites.other['official-artwork'].front_default;

  createCard(link);
}

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
}

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
}

function setup(pairs) {
  renderCards(pairs);
  let clickedPairs = 0;

  let firstCard = undefined;
  let secondCard = undefined;

  $("#game_grid").on("click", ".card", function () {

      if ($(this).hasClass("flip")) return; 
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
          winCheck(pairs, clickedPairs)
        } else {
          console.log("No match");

          setTimeout(() => {
            console.log(firstCard, secondCard);

            $(`#${firstCard.id}`).parent().toggleClass("flip");
            $(`#${secondCard.id}`).parent().toggleClass("flip");
            firstCard = undefined;
            secondCard = undefined;
          }, 1000);
        }
      }
  });

}

function winCheck(pairs, clickedPairs){
  if(clickedPairs === pairs){
    console.log("YOU WIN!")
  }
}

$(document).ready(setup(3))