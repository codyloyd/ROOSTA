const spellsDiv = document.getElementById("spells");
const levelDiv = document.getElementById("level");
const coinDiv = document.getElementById("coins");

const renderSpells = (spells) => {
  let renderedHTML = "";
  spells.forEach((spell, i) => {
    renderedHTML += `<div ${spell.used ? "class=used" : ""}>${i + 1} - ${
      spell.name
    }</div>`;
  });
  spellsDiv.innerHTML = renderedHTML;
};

const renderMessage = (message) => {
  spellsDiv.innerHTML = message;
};

const renderDom = (level, coins) => {
  levelDiv.innerHTML = level;
  coinDiv.innerHTML = coins;
};

export { renderSpells, renderDom, renderMessage };
