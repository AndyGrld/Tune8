import React, { useState } from 'react'
import { songs } from '../../constants'
import './Home.css'

const Home = () => {

    return (
        <div className="home-window">
            <nav>
                <h1>Home</h1>
                <h1 onClick={showNowPlaying}
                style={{cursor: "pointer" }}
                id='now_playing456'>
                    Now Playing
                </h1>
            </nav>
            <div className="recent">
                <div className="nav_space"></div>
                <h1 id="first_home">Recently Added</h1>
                <div className="music-grid">
                    {
                        songs.map(song => (
                            <div className='music-cell' key={song.title}>
                                <img src={song.img}/>
                                <p>{song.album}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className="recent">
                <h1>Recently Played</h1>
                <div className="music-grid">
                    {
                        songs.map(song => (
                            <div className='music-cell' key={song.title}>
                                <img src={song.img}/>
                                <p>{song.title}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Home