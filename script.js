console.log("Wake Up Jarvis !!");
console.log("Daddy's Home !!");
console.log("Let's Write Some Javscript today.....");

let currFolder;
let playing = false;
let folderList = [];
let currentPlaylist = [];
let currentSong = new Audio();

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

function sideBarButtons() {
  // Hamburger
  let e = document.querySelector(".hamburgerLogo");
  e.addEventListener("click", (event) => {
    document.querySelector(".leftBox").style.left = "0" + "%";
    document.querySelector(".leftBox").style.backgroundColor = "black";
  });

  // Close
  let e1 = document.querySelector(".closeButton");
  e1.addEventListener("click", (event) => {
    document.querySelector(".leftBox").style.left = "-130" + "%";
  });
}
async function getFolders() {
  let albums = await fetch("/songs/");
  let response = await albums.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let folders = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.includes("/songs/")) {
      folders.push(element.href.split("/").slice(-2)[0]);
    }
  }
  return folders;
}
async function updateAlbumLists() {
  let albumArea = document.querySelector(".albums");
  for (let index = 0; index < folderList.length; index++) {
    let element = folderList[index];
    let a = await fetch(
      `/songs/${element}/info.json`
    );
    let songDetails = await a.json();
    albumArea.innerHTML =
      albumArea.innerHTML +
      `<div class="albumCard" data-folder="${element}">
                            <img src="songs/${element}/cover.jpg" alt="">
                            <p class="playlistName">${songDetails.title}</p>
                            <p class="playlistInfo">${songDetails.description}</p>
                            <img src="img/greenPlay.svg" class="greenPlayIcon" height="50px" alt="">
                        </div>`;
  }
}
async function updateLibraryList() {
  // Update Folder On click
  let albumCardList = Array.from(document.getElementsByClassName("albumCard"));
  albumCardList.forEach((element) => {
    element.addEventListener("click", async (e) => {
      currFolder = element.dataset.folder;
      let albums = await fetch(
        `/songs/${currFolder}/`
      );
      let response = await albums.text();
      let div = document.createElement("div");
      div.innerHTML = response;
      let as = div.getElementsByTagName("a");
      let songs = [];
      // Updating The Songs
      for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.includes(".mp3")) {
          songs.push(element.href.split("/").slice(-2)[1]);
        }
      }
      currentPlaylist = songs;
      // getting Playlist Info
      let variable = await fetch(
        `/songs/${currFolder}/info.json`
      );
      let playInfo = await variable.json();

      // Updating The Playlist Area
      let playArea = document.querySelector(".libraryList");
      playArea.innerHTML = "";
      for (let index = 0; index < songs.length; index++) {
        const element = songs[index];
        playArea.innerHTML =
          playArea.innerHTML +
          `<div class="libraryCard">
                            <div class="musicLogoLibraryCard">
                                <img src="img/music.svg" class="invert" width="25px" alt="">
                            </div>
                            <div class="songInfoLibraryCard">
                                <p class="songNameLibraryCard">${decodeURI(
                                  element
                                )}</p>
                                <p class="artistNameLibraryCard">${
                                  playInfo.creator
                                }</p>
                            </div>
                            <div class="playNowLibraryCard">
                                <p>Play Now</p>
                            </div>
                            <div class="playLogoLibraryCard">
                                <img src="img/play.svg" width="25px" class="invert" alt="">
                            </div>
                        </div>`;
      }
      // upadating playbar
      if (songs.length != 0) {
        currentSong.src = `/songs/${currFolder}/${songs[0]}`;
        currentSong.play();
        document.getElementById("playBtn").src = "img/pause.svg";
        updateSongInfoInPlayBar();
        playing = true;
      } else {
        currentSong.src = "";
        document.getElementById("playBtn").src = "img/play.svg";
        updateSongInfoInPlayBar();
        playing = false;
      }

      // Select song form library list to play
      let listOfSongs = document.querySelectorAll(".libraryCard");
      listOfSongs.forEach((element) => {
        element.addEventListener("click", (e) => {
          let t1 = element.querySelector(".songNameLibraryCard");
          let t2 = element.querySelector(".playLogoLibraryCard");
          let t3 = t2.querySelector("img");
          currentSong.src = `/songs/${currFolder}/${decodeURI(
            t1.innerHTML
          )}`;
          playPauseMusicLibrary();
          t3.src = "img/pause.svg";
          currentSong.play();
          document.getElementById("playBtn").src = "img/pause.svg";
          playing = true;
          updateSongInfoInPlayBar();
        });
      });
    });
  });
}
function playPauseMusicLibrary() {
  // Updating Library Card Play button
  let listOfSongs = document.querySelectorAll(".playLogoLibraryCard");
  listOfSongs.forEach((element) => {
    let t = element.querySelector("img");
    if (
      !(
        currentSong.src ==
        `/songs/${currFolder}/${decodeURI(
          t.innerHTML
        )}`
      )
    ) {
      t.src = "img/play.svg";
    }
  });
}
function playPauseMusic() {
  // updaing playbar playbuttton
  let playPauseButton = document.getElementById("playBtn");
  playPauseButton.addEventListener("click", (e) => {
    // Updating Library Card Play button
    let listOfSongs = document.querySelectorAll(".playLogoLibraryCard");
    listOfSongs.forEach((element) => {
      let t = element.querySelector("img");
      t.src = "img/play.svg";
    });
    if (playing) {
      currentSong.pause();
      playPauseButton.src = "img/play.svg";
      playing = false;
    } else if (!playing && currentSong.src.includes(".mp3")) {
      currentSong.play();
      playPauseButton.src = "img/pause.svg";
      playing = true;
    }
  });
}
function updateSongInfoInPlayBar() {

  // name update
  let songTitle = document.querySelector(".playBarSongDetails");
  if (currentSong.src.includes(".mp3")) {
    let songName = currentSong.src
    .split("/")
    .slice(-1)[0]
    .replaceAll("%20", " ");

    songTitle.innerHTML = songName.split(".mp3")[0];
  } else {
    songTitle.innerHTML = "";
  }

  // duration update
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".duration").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
  });

  // seekBar update - with song
  currentSong.addEventListener("timeupdate", () => {
    let currentTime = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
    let totalTime = `${secondsToMinutesSeconds(currentSong.duration)}`;
    document.getElementById("seekBar").value =
      (currentSong.currentTime / currentSong.duration) * 100;
  });

  // seekbar update - with selected range
  document.getElementById("seekBar").addEventListener("click", (e) => {
    let value = document.getElementById("seekBar").value;
    currentSong.currentTime = (currentSong.duration * value) / 100;
  });

  // volume bar update
  document.getElementById("volumeBar").addEventListener("click", (e) => {
    let value = document.getElementById("volumeBar").value;
    currentSong.volume = value/100;
    if(value==0){
      document.querySelector(".muteUnmuteBtn").src="img/mute.svg" 
    }
    if(value>0){
      document.querySelector(".muteUnmuteBtn").src="img/volume.svg" 
    }
  });

  // mute button
  document.querySelector(".muteUnmuteBtn").addEventListener("click",(e)=>{
    if(currentSong.volume!=0){
      currentSong.volume=0;
      document.getElementById("volumeBar").value=0;
      document.querySelector(".muteUnmuteBtn").src="img/mute.svg" 
    }
    else{
      currentSong.volume=0.1;
      document.getElementById("volumeBar").value=10;
      document.querySelector(".muteUnmuteBtn").src="img/volume.svg" 
    }
  })
}

function nextSong() {
  let nextButton = document.getElementById("next");
  nextButton.addEventListener("click", (e) => {
    for (let index = 0; index < currentPlaylist.length; index++) {
      let element = `/songs/${currFolder}/${currentPlaylist[index]}`;
      if (element == currentSong.src) {
        if (index + 1 < currentPlaylist.length) {
          currentSong.src = `/songs/${currFolder}/${
            currentPlaylist[index + 1]
          }`;
          currentSong.play();
          document.getElementById("playBtn").src = "img/pause.svg";
          playing = true;
          updateSongInfoInPlayBar();
          return;
        }
      }
    }
  });
}
function prevSong() {
  let prevButton = document.getElementById("previous");
  prevButton.addEventListener("click", (e) => {
    for (let index = 0; index < currentPlaylist.length; index++) {
      let element = `/songs/${currFolder}/${currentPlaylist[index]}`;
      if (element == currentSong.src) {
        if (index - 1 >= 0) {
          currentSong.src = `/songs/${currFolder}/${
            currentPlaylist[index - 1]
          }`;
          currentSong.play();
          document.getElementById("playBtn").src = "img/pause.svg";
          playing = true;
          updateSongInfoInPlayBar();
          return;
        }
      }
    }
  });
}

async function main() {
  sideBarButtons();
  folderList = await getFolders();
  await updateAlbumLists();
  await updateLibraryList();
  playPauseMusic();
  nextSong();
  prevSong();
}

main();
