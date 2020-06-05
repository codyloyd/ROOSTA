const spellsDiv = document.getElementById("spells");

const renderSpells = (spells) => {
  let renderedHTML = "";
  spells.forEach((spell, i) => {
    renderedHTML += `<div>${i + 1} - ${spell.name}</div>`;
  });
  spellsDiv.innerHTML = renderedHTML;
};

export { renderSpells };
