
async function fetchData(url) {
  try {
      const responce = await fetch(url);
      if (!responce.ok) {
        throw new Error('Network responce was not ok');
      }
      const data = await responce.json();
      return data;
    } catch (error) {
      console.error('Error fetching Pokemon data:', error.message);
    }
} 

function containsObject(obj, list) {
  let i;
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true;
    }
  }
  return false;
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function shuffleDeck(deck) {
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    //Generate a random index
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements ar i and j
    const temp = shuffledDeck[i];
    shuffledDeck[i] = shuffledDeck[j];
    shuffledDeck[j] = temp;
  }
  return shuffledDeck;
}

export { fetchData, containsObject, capitalizeFirstLetter, shuffleDeck }