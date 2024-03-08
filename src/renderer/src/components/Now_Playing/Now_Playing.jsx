import React, { useState, useRef, useEffect } from 'react'
import './Now_Playing.css'
import {FaRotate, FaCirclePause, FaCirclePlay, FaShuffle, FaForward, FaBackward, FaXmark, FaAngleLeft, FaAngleRight} from 'react-icons/fa6'
import {ImEnlarge} from 'react-icons/im'
import {HiMiniWindow} from 'react-icons/hi2'
import {MdOutlineFavorite, MdFavoriteBorder} from 'react-icons/md'

const Now_Playing = ({isPlaying, PlayPause, audioElem, nextSong, prevSong,
    musicProgress, setMusicProgress, currentSong, queueSongs, currentIndex,
    favoriteSongs, setFavoriteSongs}) => {
    const [viewLyrics, setViewLyrics] = useState(false)
    const [songLyrics, setSongLyrics] = useState("some lyrics")

    function ShuffleAndPlay(){
        const newQueue = shuffleArray(queueSongs)
        PlayPause(newQueue[0], newQueue, true)
    }

    function displayLyrics(){
        showLyrics()
        setViewLyrics(true)
    }

    useEffect(() => {
        const fetchLyrics = async () => {
            const newLyrics = await window.electron.getLyrics(currentSong);
            setSongLyrics(newLyrics);
            console.log("new lyrics: ", newLyrics);
        };
        fetchLyrics();
    }, [currentSong]);

    function HideNowPlaying(){
        setViewLyrics(false)
        hideNowPlaying()
    }

    function HideLyrics(){
        hideLyrics()
        setViewLyrics(false)
    }

    const clickRef = useRef()
    const checkWidth = (e) => {
        let width = clickRef.current.clientWidth;
        const offset = e.nativeEvent.offsetX;

        const divprogress = offset/width * 100;
        audioElem.current.currentTime = divprogress/100 * audioElem.current.duration;
    }

    return (
    <>
    <div className="overlay" onClick={HideNowPlaying}></div>
        <div className='now-playing'>
            <div>
                <nav>
                    <h1></h1>
                    <div className='x_mark'>
                        {
                            currentSong &&
                            <div>
                                {
                                    viewLyrics
                                    ?<FaAngleRight size={25} onClick={HideLyrics}/>
                                    :<FaAngleLeft size={25} onClick={displayLyrics}/>
                                }
                            </div>
                        }
                        <div className='XMark'>
                            <FaXmark onClick={HideNowPlaying} size={30}/>
                        </div>
                    </div>
                </nav>
                {
                    currentSong ?
                    <div className="upper">
                        <div className="img">
                            <img src={currentSong.imageSrc}/>
                        </div>
                        <div className="song-title">
                            <h3 style={{textAlign: "center"}}>
                                {currentSong.tag.tags.title}
                            </h3>
                        </div>
                        <div className='artist_album'>
                            <h3 className='s_title'>{currentSong.tag.tags.artist}</h3>
                            <h3 className='s_album'>{currentSong.tag.tags.album}</h3>
                        </div>
                        <div className="time">
                            <p id='start'>
                                {`${writeTime(Math.floor(musicProgress / 60))}:${writeTime(Math.floor(musicProgress % 60))}`}
                            </p>
                            <div className="custom_progress" onClick={checkWidth} ref={clickRef}>
                                <div className="progress_bar" style={{width: `${(musicProgress/audioElem.current.duration) * 100}%`}}>
                                    <div className="progress_thumb"></div>
                                </div>
                            </div>
                            <p id='end'>
                                {currentSong.duration}
                            </p>
                        </div>
                        <audio src={currentSong.url} ref={audioElem}></audio>
                        <div className="time-icons">
                            <div className='sides'>
                                <FaShuffle size={20} style={{cursor: "pointer"}} onClick={ShuffleAndPlay}/>
                                <HiMiniWindow size={22} style={{cursor: "pointer"}}/>
                            </div>
                            <div className='bpf'>
                                <FaBackward size={20} style={{cursor: "pointer"}} onClick={prevSong}/>
                                {
                                    isPlaying
                                        ? <FaCirclePause id="plause" onClick={() => PlayPause(currentSong, [], false)} style={{cursor: "pointer"}}/>
                                        : <FaCirclePlay id="plause" onClick={() => PlayPause(currentSong, [], false)} style={{cursor: "pointer"}}/>
                                }
                                <FaForward size={20} style={{cursor: "pointer"}} onClick={nextSong}/>
                            </div>
                            <div className='sides'>
                                <MdFavoriteBorder size={25} style={{cursor: "pointer"}}/>
                                <FaRotate size={20} style={{cursor: "pointer"}}/>
                            </div>
                        </div>
                    </div>
                    :
                    <>
                        <h3>No Song Playing, please load a song</h3>
                        <audio src="" ref={audioElem}></audio>
                    </>
                }
            <div className='lower'>
                <h2>Queue</h2>
                <div className="queue-list">
                    {
                        currentIndex === -1 
                        ? queueSongs.slice(0, 5).map(song => (
                            <div  className={song === currentSong ? 'highlight queue-cell' : "queue-cell"} key={song.tag.tags.title} onClick={() => PlayPause(song, [], false)}>
                                <div className='image_name'>
                                    <img src={song.imageSrc}/>
                                    <div>
                                        <h4 className='title'>{sliceText(song.tag.tags.title, 20)}</h4>
                                        <h4 className='artist'>{song.tag.tags.artist}</h4>
                                    </div>
                                </div>
                                <div className='time'>
                                    <h4>{song.duration}</h4>
                                </div>
                            </div>
                        ))
                        : currentIndex + 5 > queueSongs.length -1 
                        ? queueSongs.slice(queueSongs.length - 5).map(song => (
                            <div  className={song === currentSong ? 'highlight queue-cell' : "queue-cell"} key={song.tag.tags.title} onClick={() => PlayPause(song, [], false)}>
                                <div className='image_name'>
                                    <img src={song.imageSrc}/>
                                    <div>
                                        <h4 className='title'>{sliceText(song.tag.tags.title, 20)}</h4>
                                        <h4 className='artist'>{song.tag.tags.artist}</h4>
                                    </div>
                                </div>
                                <div className='time'>
                                    <h4>{song.duration}</h4>
                                </div>
                            </div>
                        ))
                        : queueSongs.slice(currentIndex, currentIndex + 5).map(song => (
                            <div  className={song === currentSong ? 'highlight queue-cell' : "queue-cell"} key={song.index} onClick={() => PlayPause(song, [], false)}>
                                <div className='image_name'>
                                    <img src={song.imageSrc}/>
                                    <div>
                                        <h4 className='title'>{sliceText(song.tag.tags.title, 20)}</h4>
                                        <h4 className='artist'>{song.tag.tags.artist}</h4>
                                    </div>
                                </div>
                                <div className='time'>
                                    <h4>{song.duration}</h4>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
        {
            currentSong
            ?<div className="lyrics_container">
                <div className="title">
                    <h1>{currentSong.tag.tags.title}</h1>
                </div>
                <div className="lyrics">
                    <p>
                        {songLyrics}
                    </p>
                </div>
            </div>
            :<div className="lyrics_container">
                <div className="title">
                    <h1>Replace condition with lyrics later</h1>
                </div>
                <div className="lyrics">
                    <p>No lyrics found for song</p> 
                </div>
            </div>
        }
    </div>
    </>
    )
}

export default Now_Playing