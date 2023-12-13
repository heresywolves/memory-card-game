import { useEffect, useState } from 'react'
import './App.css'
import PropTypes from 'prop-types';
import {fetchData, containsObject, capitalizeFirstLetter} from './utils'

function App() {
  const [menuShown, setMenuShown] = useState(true);
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState([]);
  let numberOfCards = 4;

  useEffect(() => {
    if (difficulty === 'easy') numberOfCards = 4;
    else if (difficulty === 'medium') numberOfCards = 8;
    else if (difficulty === 'hard') numberOfCards = 12;
    console.log('new card number: ' + numberOfCards);
  }, [difficulty])

  async function startGame() {
    setMenuShown(false);
    const pokemonsArr = await fetchPokemonData(numberOfCards, setLoading);
    setLoading(false);
    console.log(pokemonsArr);
    setDeck(pokemonsArr);
  }

  return (
    <>
      {menuShown && <Menu 
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        menuShown={menuShown}
        startGame={startGame}
        />}
      {deck && <Deck
        deck={deck} 
        />}
      {loading && <Loading/>}
    </>
  )
}

function Loading() {
  return (
    <div className='loading-screen'>
      <p>Loading...</p>
    </div>
  )
}

function Deck({deck}) {
  return (
    <div className='deck-container'>
      {deck.map((card) => {
        return (
          <div key={card.id} className='card'>
            <img key={card.id} src={card.img}></img>
            <p>{card.name}</p>
          </div>
        )
      })}
    </div>
  )
}

Deck.propTypes = {
  deck: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      img: PropTypes.string.isRequired
    })
  )
};

async function fetchPokemonData(numberOfCards, setLoading) {
  setLoading(true);
  const data = await fetchData('https://pokeapi.co/api/v2/pokemon/?limit=1000');
  const pokemonArr = [];
  for (let i = 0; i < numberOfCards; i++) {
    const randInt = Math.floor(Math.random() * data.results.length);
    if (!containsObject(data.results[randInt], pokemonArr)){
      pokemonArr.push(data.results[randInt]);
    } else {
      i--;
    }
  }

  const newPokemonArr = [];
  for (let i = 0; i < pokemonArr.length; i++) {
    const pokemonObj = await fetchData(pokemonArr[i].url);
    newPokemonArr.push(pokemonObj);
  }

  console.log(newPokemonArr);  

  return newPokemonArr.map((item) => {
    return {
            name: capitalizeFirstLetter(item.name), 
            img: item.sprites.front_default,
            id: item.id,
            beenChosen: false,
          }; 
  });
}



function Menu({difficulty, setDifficulty, menuShown, startGame}) {


  return (
    menuShown && 
    <div className="menu-container-background">
      <div className='main-menu'>
        <div className='difficulty-container'>
          <button
            className={difficulty === 'easy' ? 'active' : ''}
            onClick={() => {setDifficulty('easy')}}
            >Easy</button>
          <button
            className={difficulty === 'medium' ? 'active' : ''}
            onClick={() => {setDifficulty('medium')}}
            >Medium</button>
          <button
            className={difficulty === 'hard' ? 'active' : ''}
            onClick={() => {setDifficulty('hard')}}
            >Hard</button>
        </div>
        <button
          onClick={startGame}
        >Start game</button>
        <button
          onClick={() => {window.open('https://github.com/heresywolves/memory-card-game', '_blank')}}
        >Github repo</button>
      </div>
    </div>
  )
}


Menu.propTypes = {
  difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']).isRequired,
  setDifficulty: PropTypes.func.isRequired,
  menuShown: PropTypes.bool.isRequired,
  startGame: PropTypes.func.isRequired,
};

export default App
