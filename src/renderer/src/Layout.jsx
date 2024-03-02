import React from 'react'
import { Outlet } from "react-router-dom";

import Sidebar from './components/Sidebar/Sidebar'
import Now_Playing from './components/Now_Playing/Now_Playing'

const Layout = ({isPlaying, PlayPause, audioElem, nextSong, prevSong,
    musicProgress, setMusicProgress, currentSong, theme, queueSongs,
    currentIndex, favoriteSongs, setFavoriteSongs, allSongs}) => {
    return (
        <main className={`main ${theme}`}>
            {
                allSongs.length === 0 &&
                <div className='indexing'>
                    <h2>Indexing songs, please wait</h2>
                </div>
            }
            <div className="left">
                <Sidebar/>
            </div>
            <div className='right'>
                <Outlet/>
                <Now_Playing isPlaying={isPlaying} PlayPause={PlayPause}
                    audioElem={audioElem} musicProgress={musicProgress}
                    setMusicProgress={setMusicProgress} currentSong={currentSong}
                    nextSong={nextSong} prevSong={prevSong}
                    queueSongs={queueSongs} currentIndex={currentIndex}
                    favoriteSongs={favoriteSongs} setFavoriteSongs={setFavoriteSongs}/>
            </div>
        </main>
    )
}

export default Layout