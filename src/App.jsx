import { useState } from 'react'
import './App.css'
import PropTypes from 'prop-types';
import Deck from './Deck';

function App() {
  const [menuShown, setMenuShown] = useState(true);
  const [difficulty, setDifficulty] = useState('easy');

  return (
    <>
      {menuShown && <Menu 
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />}
    </>
  )
}

function Menu({difficulty, setDifficulty}) {
  return (
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
        <button>Start game</button>
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
};

export default App
