import { useEffect, useState } from 'react'
import './App.css'
import PropTypes from 'prop-types';
import {fetchData, containsObject, capitalizeFirstLetter, shuffleDeck} from './utils'

function App() {
  const [menuShown, setMenuShown] = useState(true);
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState([]);
  const [devMode, setDevMode] = useState(true);
  const [maxScore, setMaxScore] = useState(4);
  const [score, setScore] = useState(0);
  const [numberOfCards, setNumberOfCards] = useState(4);
  const [gameLost, setGameLost] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    if (difficulty === 'easy') {
      setNumberOfCards(4);
      setMaxScore(4);
    }
    else if (difficulty === 'medium') {
      setNumberOfCards(8);
      setMaxScore(8);
    }
    else if (difficulty === 'hard') {
      setNumberOfCards(12);
      setMaxScore(12);
    }
    console.log('new card number: ' + numberOfCards);
  }, [difficulty, numberOfCards])

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
      {maxScore && <Score
        maxScore={maxScore}
        score={score}
      />}
      {deck && <Deck
        deck={deck} 
        setDeck={setDeck}
        devMode={devMode}
        setScore={setScore}
        score={score}
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

function Deck({deck, setDeck, devMode, setScore, score}) {

  function pickCard(e) {
    const cardId = +e.target.closest('.card').dataset.key;

    const updatedDeck = deck.map((card) => {
      if (card.id === cardId) {
        if (card.beenChosen) {
          setScore(0);
        }
        else {
          setScore(++score)
          return {...card, beenChosen: true};
        }
      }
      return card;
    });
    let updatedShuffledDeck = shuffleDeck(updatedDeck);
    setDeck(updatedShuffledDeck);
  }

  return (
    <div className='deck-container'>
      {deck.map((card) => {
        return (
          <div key={card.id} data-key={card.id} onClick={pickCard} className={`card`}>
            <img key={card.id} src={card.img}></img>
            <p>{card.name}</p>
            {devMode && (
              (card.beenChosen ? 'been chosen' : 'not chosen')
            )}
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
  ),
  setDeck: PropTypes.func.isRequired,
  devMode: PropTypes.bool.isRequired,
  setScore: PropTypes.func.isRequired,
  score: PropTypes.number.isRequired
};

function Score({maxScore, score}) {
  return (
    <div className='score-container'>
      <p>{`Score: ${score} / ${maxScore}`}</p>
    </div>
  )
}

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
