import { useEffect, useState } from 'react'
import './App.css'
import PropTypes from 'prop-types';
import {fetchData, containsObject, capitalizeFirstLetter, shuffleDeck} from './utils'
import backgroundImg from './assets/wallpaper.jpg';
import backgroundMusicSrc from './assets/background-music.wav';
import winSoundSrc from './assets/win-sound.wav';
import loseSoundSrc from './assets/lose-sound.wav';
import soundOnImg from './assets/soundon.svg'
import soundOffImg from './assets/soundoff.svg'

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
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
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
  
  
  async function startGame(isMusicPlaying, setIsMusicPlaying) {
    if (!isMusicPlaying) {
      const music = document.querySelector('#background-audio');
      music.play();
      setIsMusicPlaying(true);
      music.volume = 0.2;
      music.loop = true;
    }
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
        startGame={() => {startGame(isMusicPlaying, setIsMusicPlaying)} }
        />}
      {maxScore && <Score
        maxScore={maxScore}
        score={score}
      />}
      <SoundControl
        soundOn={soundOn}
        setSoundOn={setSoundOn}
        soundOffImg={soundOffImg}
        soundOnImg={soundOnImg}
      />
      {deck && <Deck
        deck={deck} 
        setDeck={setDeck}
        devMode={devMode}
        setScore={setScore}
        score={score}
        setGameLost={setGameLost}
        />}
      {loading && <Loading/>}
      <audio id="background-audio" src={backgroundMusicSrc} autoPlay/>
      <audio id="win-audio" src={winSoundSrc}/>
      <audio id="lose-audio" src={loseSoundSrc}/>
    </>
  )
}

function SoundControl({soundOn, setSoundOn, soundOffImg, soundOnImg}) {
  function toggleSound() {
    const audio = document.querySelectorAll('audio');
    audio.forEach((el) => {
      if (soundOn) {
        el.muted = true;
      } else {
        el.muted = false;
      }
    })

    setSoundOn(!soundOn)
  }
  return (
    <div className='sound-control-container'>
      <img 
        src={(soundOn) ? soundOnImg : soundOffImg} 
        onClick={toggleSound}
        width={50}
        alt="Sound Control Icon" />
    </div>
  )
}


function WinScreen({resetGame}) {
  // const winSound = new Audio(winSoundSrc);
  // winSound.preload = 'auto';
  const winSound = document.querySelector('#win-audio');
  winSound.play();
  winSound.volume = 0.2;
  return (
    <div onClick={resetGame} className='win-screen'>
      <p>You win!</p>
    </div>
  )
}

function LoseScreen({resetGame}) {
  // const loseSound = new Audio(loseSoundSrc);
  // loseSound.preload = 'auto';
  const loseSound = document.querySelector('#lose-audio');
  loseSound.play();
  loseSound.volume = 0.2;
  return (
    <div onClick={resetGame} className='lose-screen'>
      <p>You lose!</p>
    </div>
  )
}

function Loading() {
  return (
    <div className='loading-screen'>
      {/* <img src={loadingImg} alt="Loading icon" /> */}
    <svg version="1.1" id="L9" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      viewBox="0 0 100 100" enableBackground="new 0 0 0 0" xmlSpace="preserve">
        <rect x="20" y="50" width="4" height="10" fill="#fff">
          <animateTransform attributeType="xml"
            attributeName="transform" type="translate"
            values="0 0; 0 20; 0 0"
            begin="0" dur="0.6s" repeatCount="indefinite" />
        </rect>
        <rect x="30" y="50" width="4" height="10" fill="#fff">
          <animateTransform attributeType="xml"
            attributeName="transform" type="translate"
            values="0 0; 0 20; 0 0"
            begin="0.2s" dur="0.6s" repeatCount="indefinite" />
        </rect>
        <rect x="40" y="50" width="4" height="10" fill="#fff">
          <animateTransform attributeType="xml"
            attributeName="transform" type="translate"
            values="0 0; 0 20; 0 0"
            begin="0.4s" dur="0.6s" repeatCount="indefinite" />
        </rect>
    </svg>
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
