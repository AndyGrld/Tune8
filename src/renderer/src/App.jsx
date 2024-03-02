import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react'
import './App.css'
import React from 'react'

import Home from './windows/Home/Home'
import Songs from './windows/Songs/Songs'
import Albums from './windows/Albums/Albums'
import Artists from './windows/Artists/Artists'
import Queue from './windows/Queue/Queue'
import Playlist from './windows/Playlist/Playlist'
import Settings from './windows/Settings/Settings'
import Layout from './Layout';
import Artist from './windows/Artist/Artist';
import ArtistView from './windows/ArtistView/ArtistView';
import Album from './windows/Album/Album';
import AlbumView from './windows/AlbumView/AlbumView';
import Favorites from './windows/Favorites/Favorites';
import ScrollToTop from './components/ScrollToTop';

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState(null)
  const audioElem = useRef()
  const [musicProgress, setMusicProgress] = useState(0)
  const [allSongs, setAllSongs] = useState([])
  const [queueSongs, setQueueSongs] = useState([])
  const [theme, setTheme] = useState('dark')
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [favoriteSongs, setFavoriteSongs] = useState([])

  useEffect(() => {
    const index = queueSongs.findIndex(song => song === currentSong);
    setCurrentIndex(index);
  }, [currentSong, queueSongs]);

  function changeTheme(newTheme){
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  // fetch all songs on app startup
  useEffect(() => {
    fetchItems()
  }, [])

  // change music progress in now playing
  useEffect(() => {
    setInterval(() => {
      if(isPlaying){
        setMusicProgress(audioElem.current.currentTime)
      }
    }, 1000)
  }, [isPlaying])

  // plays next song if current song has ended
  useEffect(() => {
    const audio = audioElem.current;
    const handleEnded = () => {
      nextSong();
    };
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong]);

  // function to fetch all songs
  async function fetchItems(clearAll = false) {
      try {
        await window.electron.createFolders()
        if(clearAll){
          setAllSongs([])
        }
          const directoryContents = await window.electron.getDirectoryContents(clearAll);
          setAllSongs(directoryContents)
          const prevQueue = await window.electron.readQueue()
          if(prevQueue){
            if(prevQueue.length > 0){
              console.log("prevQueue: ", prevQueue)
              setQueueSongs(prevQueue)
            }
          }
      } catch (error) {
          console.error('Error reading directory:', error)
      }
  }

  function prevSong(){
    if (queueSongs.length === 1) {
      // If there is only one song in the queue, reset to the beginning of the song
      audioElem.current.currentTime = 0;
    } else {
      if (currentIndex === 0) {
        setCurrentSong(queueSongs[queueSongs.length - 1]);
      } else {
        setCurrentSong(queueSongs[currentIndex - 1]);
      }
    }
    setTimeout(()=>{
      audioElem.current.play()
      setIsPlaying(true)
    }, 1)
  }

  function nextSong(){
    if (queueSongs.length === 1) {
      // If there is only one song in the queue, reset to the beginning of the song
      audioElem.current.currentTime = 0;
    } else {
      if (currentIndex === (queueSongs.length - 1)) {
        setCurrentSong(queueSongs[0]);
      } else {
        setCurrentSong(queueSongs[currentIndex + 1]);
      }
    }
    console.log("current song: ", currentIndex)
    setTimeout(()=>{
      audioElem.current.play()
      setIsPlaying(true)
    }, 1)
  }

  function PlayPause(song, queue = allSongs, refreshQueue = true) {
    // keep refreshQueue to prevent re-rendering when a song is clicked on now playing
    if (refreshQueue) {
      if(queueSongs === queue){
        console.log("not refreshing queue")
      }else{
        setTimeout(async () => {
          setQueueSongs(queue)
          console.log("New Queue: ", queue);
          try {
            const saved = await window.electron.saveQueue(queueSongs);
            if (saved) {
              console.log('Queue saved successfully');
            } else {
              console.log('Queue not saved');
            }
          } catch (error) {
            console.error('Error saving queue:', error);
          }
        }, 1)
      }
    }else if(queueSongs.length === 0){
      console.log("Queue set to all Songs since queue is empty")
      setQueueSongs(allSongs)
    }
  
      if (currentSong === song) {
        console.log("play or pause song");
        setTimeout(() => {
          if (isPlaying) {
            audioElem.current.pause();
            setIsPlaying(false);
          } else {
            audioElem.current.play();
            setIsPlaying(true);
          }
        }, 1);
      } else {
        console.log("playing a new song: ", song.url);
        setCurrentSong(song);
        setTimeout(() => {
          audioElem.current.play();
          setIsPlaying(true);
        }, 5);
      }
  }

  return (
    <BrowserRouter>
      <ScrollToTop/>
      <Routes>
        <Route path='/' element={<Layout allSongs={allSongs} isPlaying={isPlaying} PlayPause={PlayPause} currentSong={currentSong}
        audioElem={audioElem} musicProgress={musicProgress} setMusicProgress={setMusicProgress}
        nextSong={nextSong} prevSong={prevSong} theme={theme} queueSongs={queueSongs}
        currentIndex={currentIndex} favoriteSongs={favoriteSongs} setFavoriteSongs={setFavoriteSongs}/>}>
          <Route index element={<Home/>}></Route>
          <Route path='albums' element={<Albums allSongs={allSongs}/>}></Route>
          <Route path='songs' element={<Songs allSongs={allSongs} isPlaying={isPlaying}
            currentSong={currentSong} PlayPause={PlayPause}/>}></Route>
          <Route path='artists' element={<Artists allSongs={allSongs}/>}></Route>
          <Route path='queue' element={<Queue isPlaying={isPlaying}
            currentSong={currentSong} PlayPause={PlayPause} queueSongs={queueSongs}/>}></Route>
          <Route path='playlist' element={<Playlist isPlaying={isPlaying}
            currentSong={currentSong} PlayPause={PlayPause} queueSongs={queueSongs}/>}></Route>
          <Route path='favorites' element={<Favorites isPlaying={isPlaying}
            currentSong={currentSong} PlayPause={PlayPause} queueSongs={queueSongs}
            favoriteSongs={favoriteSongs} setFavoriteSongs={setFavoriteSongs}/>}></Route>
          <Route path='settings' element={<Settings changeTheme={changeTheme} fetchItems={fetchItems}/>}></Route>
          <Route path='artist' element={<Artist/>}>
            <Route path=':artist' element={<ArtistView allSongs={allSongs} PlayPause={PlayPause}
            isPlaying={isPlaying} currentSong={currentSong}/>}></Route>
          </Route>
          <Route path='album' element={<Album/>}>
            <Route path=':album' element={<AlbumView allSongs={allSongs} PlayPause={PlayPause}
            isPlaying={isPlaying} currentSong={currentSong} />}></Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App