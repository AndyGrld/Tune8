import React from 'react'
import './Favorites.css'

const Favorites = ({ PlayPause, currentSong, isPlaying, queueSongs }) => {

    function ShuffleAndPlay(){
        const newQueue = shuffleArray(allSongs)
        PlayPause(newQueue[0], newQueue, true)
    }

    return (
        <div className="favorites_window">
            <nav>
                <div className='nav'>
                    <h1>Favorites</h1>
                    <div>
                        <button type='button' onClick={() => PlayPause(allSongs[0], allSongs, true)}>
                            Play All
                        </button>
                        <button type='button' onClick={() => ShuffleAndPlay()}>
                            Shuffle
                        </button>
                    </div>
                </div>
                <h1 onClick={showNowPlaying}
                style={{cursor: "pointer" }}
                id='now_playing456'>
                    Now Playing
                </h1>
            </nav>
        </div>
    )
}

export default Favorites