const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs').promises;
const path = require('path');
// const jsmediatags = require('jsmediatags')
const mm = require("music-metadata")
const { promisify } = require('util')
const { resolve } = require('path')
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
require('dotnet').config()

const apiKey = process.env.CLIENT_SECRET

const musicLocation = localStorage.getItem("MusicPath")
const music_folder = musicLocation ? localStorage.getItem("MusicPath") : "";

const songsSavedData = "C:\\Music_Data\\songsSavedData"
const queueSavedData = "C:\\Music_Data\\queueSavedData"
const lyricsSavedData = "C:\\Music_Data\\lyrics"
// const resources = "C:\\Music_Data\\resources"
// const playlistSavedData = "C:\\Music_Data\\playlistSavedData"
// const favoritesSavedData = "C:\\Music_Data\\favoritesSavedData"

function writeTime(time){
    return time < 10 ? `0${time}` : time
}

async function createFoldersIfNotExist() {
    const foldersToCreate = [songsSavedData, queueSavedData, lyricsSavedData];
    for (const folder of foldersToCreate) {
        try {
            await fs.mkdir(folder, { recursive: true });
            console.log(`Folder created: ${folder}`);
        } catch (error) {
            console.error(`Error creating folder ${folder}:`, error);
        }
    }
}

async function deleteFilesInFolder(folderPath) {
    try {
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            await fs.unlink(filePath);
            console.log(`Deleted ${file}`);
        }
    } catch (err) {
        console.error('Error deleting files:', err);
    }
}

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

async function saveDataToFile(data, savePath, FileName = "musicData_") {
    const chunks = Math.ceil(data.length / 20);
    for (let i = 0; i < chunks; i++) {
        const start = i * 20;
        const end = (i + 1) * 20;
        const chunkData = data.slice(start, end);
        const fileName = `${FileName}${i + 1}.json`;
        const filePath = path.join(savePath, fileName);
        try {
            await fs.writeFile(filePath, JSON.stringify(chunkData, null, 2));
        } catch (error) {
            console.error(`Error saving ${fileName}:`, error);
        }
    }
}

async function readFromFile(savePath, single = false){
    const files = await fs.readdir(savePath);
    if(files.length === 0){
        return []
    }
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    if (jsonFiles.length > 0) {
        const musicData = [];
        for (const file of jsonFiles) {
            const filePath = path.join(savePath, file);
            const jsonData = await fs.readFile(filePath, 'utf-8');
            const parsedData = JSON.parse(jsonData);
            musicData.push(...parsedData);
        }
        musicData.sort((a, b) => a.tag.tags.album.localeCompare(b.tag.tags.album));
        return musicData;
    }else{
        return []
    }
}
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        console.error('Error reading JSON file:', err);
        return null;
    }
}

const convertImagesToBase64 = async () => {
    const imageFolderPath = 'src/renderer/public/my_images/placeholders/music';
    try {
        const imageFiles = await fs.readdir(imageFolderPath);
        const imageBase64Array = await Promise.all(imageFiles.map(async (imageFile) => {
            const imagePath = path.join(imageFolderPath, imageFile);
            const imageBuffer = await fs.readFile(imagePath);
            const imageBase64 = imageBuffer.toString('base64');
            return `data:image/png;base64,${imageBase64}`;
        }));
        return imageBase64Array;
    } catch (error) {
        console.error('Error converting images to base64:', error);
        return [];
    }
};

contextBridge.exposeInMainWorld('electron', {
    createFolders: () => {
        createFoldersIfNotExist()
    },
    playSong: (songUrl) => {
        ipcRenderer.send('play-song', songUrl);
    },
    saveQueue: async (queue) => {
        try{
            await deleteFilesInFolder(queueSavedData);
            await saveDataToFile(queue, queueSavedData, "queueData_");
            return true
        }catch(error){
            console.error("Error saving to file: ", error)
        }
    },
    readQueue: async () => {
        try{
            const musicData = await readFromFile(queueSavedData)
            return musicData
        }catch(error){
            console.error("Error reading from file: ", error)
        }
    },
    getLyrics: async (song) => {
        try{
            // const fileName = `${song.tag.tags.title}_${song.tag.tags.album}`
            // const lyricsData = readJsonFile(fileName+'.json')
            // if(lyricsData.lyrics){
            //     return lyricsData.lyrics
            // }
            fetch(
                `https://api.lyrics.ovh/v1/${song.tag.tags.artist}/${song.tag.tags.title}`
            ).then(response => response.json())
            .then(data => {
                if(data.lyrics !== undefined){
                    console.log(data.lyrics)
                    saveDataToFile(data.lyrics, lyricsSavedData, fileName);
                }else{
                    console.log("Lyrics not found")
                }
            })
        }catch(error){
            console.error('An error occured: ', error)
        }
    },
    addMusicDirectory: async () => {
        try {
            const directoryPath = await ipcRenderer.invoke('dialog:openDirectory');
            return directoryPath;
        } catch (error) {
            console.error('Error selecting music directory:', error);
            throw error;
        }
    },
    getDirectoryContents: async(clearAll) => {
        try {
            if(clearAll){
                await deleteFilesInFolder(songsSavedData);
            }
            const musicData = await readFromFile(songsSavedData);
            if (musicData.length > 0) {
                return musicData;
            }
            const imagesBase64 = await convertImagesToBase64();
            const songsPath = await getFiles(music_folder);
            const mp3Files = songsPath.filter(song => path.extname(song) === '.mp3');

            let index = 0;
            for (const filePath of mp3Files) {
                const metadata = await mm.parseFile(filePath)
                const duration = metadata.format.duration
                const imageSrc = metadata.common.picture && metadata.common.picture.length > 0
                    ? `data:${metadata.common.picture[0].format};base64,${metadata.common.picture[0].data.toString('base64')}`
                    : imagesBase64[index % imagesBase64.length];
                musicData.push({
                    url: `/songs/${path.basename(filePath)}`,
                    tag: {tags: {
                        title: metadata.common.title ? metadata.common.title : path.basename(filePath).split('.mp3')[0],
                        artist: metadata.common.artist ? metadata.common.artist : `Unknown Artist`,
                        album: metadata.common.album ? metadata.common.album : `Unknown Album`,
                        year: metadata.common.year ? metadata.common.year : `#`,
                        genre: metadata.common.genre ? metadata.common.genre : `#`,
                    }},
                    imageSrc,
                    duration: `${writeTime(Math.floor(duration / 60))}:${writeTime(Math.floor(duration % 60))}`
                });
                index+=1
                console.log(index)
            }
    
            // console.log(musicData);
            await saveDataToFile(musicData, songsSavedData);
            return musicData;
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    }
});
