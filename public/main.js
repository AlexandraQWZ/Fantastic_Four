"use strict";

/*  
  FANTASTIC FOUR – Neon Blue Edition
  Modernized modal handling, cleaner event listeners,
  safer "More!" button binding, and updated UI text.
*/


/******************************
 *  DOM ELEMENTS
 ******************************/
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const btnCloseModal = document.querySelector(".close-modal");
const btnCategoryButtons = document.querySelectorAll(".show-modal button");
const moreBtn = document.querySelector(".more-modal");
const tipParagraph = document.querySelector("#tipParagraph");
const surpriseImage = document.querySelector(".surprise-image");

/******************************
 *  MODAL CONTROL FUNCTIONS
 ******************************/
const openModal = () => {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");

  // Neon glow effect on open
  modal.style.boxShadow = "0 0 35px rgba(0, 229, 255, 0.5)";
};

const closeModal = () => {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");

  // Reset effect
  modal.style.boxShadow = "none";
};

/******************************
 *  RANDOM QUESTION HANDLING
 ******************************/
function randomTipsGen(tips) {
  tipParagraph.textContent =
    tips[Math.floor(Math.random() * tips.length)];
}

/******************************
 *  SAFE "MORE" BUTTON HANDLER
 ******************************/
let currentMoreHandler = null;

function setMoreButton(handler) {
  // Remove old listener if exists
  if (currentMoreHandler) {
    moreBtn.removeEventListener("click", currentMoreHandler);
  }

  // Set new handler
  currentMoreHandler = handler;
  moreBtn.addEventListener("click", currentMoreHandler);
}

/******************************
 *  RANDOM DOG IMAGE FETCH
 ******************************/
function fetchRandomAnimalPicture() {
  fetch("https://dog.ceo/api/breeds/image/random")
    .then((res) => res.json())
    .then((data) => {
      surpriseImage.src = data.message;
    })
    .catch((err) => {
      console.log(`Random image error: ${err}`);
    });
}

/******************************
 *  MODAL TRIGGERS
 ******************************/
// Open modal when ANY category icon is clicked
document.querySelector(".show-modal").addEventListener("click", () => {
  openModal();
  fetchRandomAnimalPicture();
});

/******************************
 *  CATEGORY CLICK HANDLERS
 ******************************/
document.querySelector(".my-question").addEventListener("click", () => {
  randomTipsGen(myTips);
  setMoreButton(() => randomTipsGen(myTips));
});

document.querySelector(".behavorial").addEventListener("click", () => {
  randomTipsGen(behavorTips);
  setMoreButton(() => randomTipsGen(behavorTips));
});

document.querySelector(".html").addEventListener("click", () => {
  randomTipsGen(htmlTips);
  setMoreButton(() => randomTipsGen(htmlTips));
});

document.querySelector(".css").addEventListener("click", () => {
  randomTipsGen(cssTips);
  setMoreButton(() => randomTipsGen(cssTips));
});

document.querySelector(".js").addEventListener("click", () => {
  randomTipsGen(jsTips);
  setMoreButton(() => randomTipsGen(jsTips));
});

document.querySelector(".node").addEventListener("click", () => {
  randomTipsGen(nodeTips);
  setMoreButton(() => randomTipsGen(nodeTips));
});

/******************************
 *  CLOSE MODAL EVENTS
 ******************************/
btnCloseModal.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});
