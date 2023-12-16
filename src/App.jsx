import { useEffect, useState } from 'react'
import './App.css'
import PropTypes from 'prop-types';
import {fetchData, containsObject, capitalizeFirstLetter, shuffleDeck} from './utils'
import backgroundImg from './assets/wallpaper.jpg';

function App() {
  const [menuShown, setMenuShown] = useState(true);
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState([]);
  const [maxScore, setMaxScore] = useState(4);
  const [score, setScore] = useState(0);
  const [numberOfCards, setNumberOfCards] = useState(4);
  const [gameLost, setGameLost] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [pokemonApiData, setPokemonApiData] = useState(null);
  let devMode = false;
  

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
  }, [difficulty, numberOfCards])

  useEffect(() => {
    if (score === maxScore) {
      setGameWon(true);
    }
  }, [score, maxScore]);

  async function startGame() {

    setMenuShown(false);
    const pokemonsArr = await fetchPokemonData(numberOfCards, setLoading, pokemonApiData, setPokemonApiData);
    setLoading(false);
    setDeck(pokemonsArr);
  }

  function resetGame() {
    setMenuShown(true);
    setGameLost(false);
    setGameWon(false);
    setScore(0);
  }

  return (
    <>
      <img src={backgroundImg} className='background'></img>
      {gameWon && <WinScreen
        resetGame={resetGame}
      />} 
      {gameLost && <LoseScreen
        resetGame={resetGame}
      />}
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
        setGameLost={setGameLost}
        />}
      {loading && <Loading/>}
    </>
  )
}


function WinScreen({resetGame}) {
  return (
    <div onClick={resetGame} className='win-screen'>
      <p>You win!</p>
    </div>
  )
}

function LoseScreen({resetGame}) {
  return (
    <div onClick={resetGame} className='lose-screen'>
      <p>You lose!</p>
    </div>
  )
}

function Loading() {
  return (
    <div className='loading-screen'>
      <p>Loading...</p>
    </div>
  )
}

function Deck({deck, setDeck, devMode, setScore, score, setGameLost}) {

  function pickCard(e) {
    const cardId = +e.target.closest('.card').dataset.key;

    const updatedDeck = deck.map((card) => {
      if (card.id === cardId) {
        if (card.beenChosen) {
          setGameLost(true);
        }
        else {
          setScore(++score);
          return {...card, beenChosen: true};
        }
      }
      return card;
    });
    let updatedShuffledDeck = shuffleDeck(updatedDeck);
    setDeck(updatedShuffledDeck);
  }

  function rotateToMouse(e) {
    const card = e.target.closest('.card');
    const cardRect = card.getBoundingClientRect();
    const img = card.querySelector('img');

    // Calculate the position of the mouse relative to the card
    const mouseX = e.clientX - cardRect.left;
    const mouseY = e.clientY - cardRect.top;

    // Calculate the rotation angles based on the mouse position
    const rotateX = (mouseY / cardRect.height - 0.5) * 40; // Adjust the rotation factor as needed
    const rotateY = -(mouseX / cardRect.width - 0.5) * 40; 

    // Apply the rotation
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    img.style.transfrom = `scale(3);`

    // Create a box shadow to give the illusion of elevation
    const shadowX = (mouseX / cardRect.width - 0.5) * 10; // Adjust the shadow factor as needed
    const shadowY = (mouseY / cardRect.height - 0.5) * 10; // Adjust the shadow factor as needed
    const shadowSpread = 10; // Adjust the shadow spread as needed

    card.style.boxShadow = `${shadowX}px ${shadowY}px ${shadowSpread}px rgba(0, 0, 0, 0.3)`;
  }

  function resetCardRotation(e) {
    const card = e.target.closest('.card');
    card.style.transform = 'none';
  }

  return (
    <div className='deck-container'>
      {deck.map((card) => {
        return (
          <div 
            key={card.id} 
            data-key={card.id} 
            onClick={pickCard} 
            onMouseMove={rotateToMouse}
            onMouseLeave={resetCardRotation}
            className={`card`}
            >
            {/* <img src={cardBgImg} alt="Card Background"  className='card-bg'/> */}
            <img key={card.id} src={card.img}></img>
            <p>{card.name}</p>
            {devMode && (
              (card.beenChosen ? <p>been chosen</p> : <p>not chosen</p>)
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
  score: PropTypes.number.isRequired,
  setGameLost: PropTypes.func.isRequired,
};

function Score({maxScore, score}) {
  const progressContainerWidth = maxScore * 50;
  const height = '30px';
  const progressWidth = score * 50;

  return (
    <div className='score-container'>
      {/* <p>{`Score: ${score} / ${maxScore}`}</p> */}
      <div style={{
        width: progressContainerWidth,
        height: height
        }} className='progress-bar-container'>
        <div style={{
          width: progressWidth,
          height: height
        }} className="progress-bar"></div>
      </div>
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
