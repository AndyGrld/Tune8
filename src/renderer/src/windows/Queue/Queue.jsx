import React, { useEffect } from 'react'
import './Queue.css'
import { BsPauseCircle, BsPlayCircle } from 'react-icons/bs'

const Queue = ({ PlayPause, currentSong, isPlaying, queueSongs }) => {

    function ShuffleAndPlay(){
        const newQueue = shuffleArray(queueSongs)
        PlayPause(newQueue[0], newQueue, true)
    }

    return (
        <div className="queue_window">
            <nav>
                <div className='nav'>
                    <h1>Queue</h1>
                    <div>
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
            <ul>
                {
                    queueSongs.length > 0
                    ?queueSongs.map(song => (
                        <li onClick={() => PlayPause(song, queueSongs, true)} key={song.index} className={song === currentSong ? 'highlight' : ""}>
                            <div className="img_div">
                                <img src={song.imageSrc}/>
                                <div>
                                    {
                                        (currentSong === song && isPlaying)
                                        ? <BsPauseCircle/>
                                        : <BsPlayCircle/>
                                    }
                                    
                                </div>
                            </div>
                            <h2 className='cell2'>{song.tag.tags.title}</h2>
                            <h2 className='cell3'>{song.tag.tags.artist}</h2>
                            <h2 className='cell4'>{song.tag.tags.album}</h2>
                            <h2 className='cell5'>{song.duration}</h2>
                        </li>
                    ))
                    : 
                    <div className='no_queue'>
                        <h1>No songs in queue</h1>
                    </div>
                }
            </ul>
        </div>
    )
}

export default Queue