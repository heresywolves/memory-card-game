
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

export { fetchData, containsObject }