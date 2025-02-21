let currentSong = new Audio();
let songs = [];
let vol = document.querySelector(".volume img");
let currentfolder = "songs/myplaylist";

async function getSongs(folder) {
    try {
        currentfolder = folder;
        let a = await fetch(`/${currentfolder}/`);
        let response = await a.text();

        // Create a virtual DOM to parse the response
        let div = document.createElement("div");
        div.innerHTML = response;

        // Check if links exist
        let as = div.getElementsByTagName("a");

        songs = [];
        for (let i = 0; i < as.length; i++) {
            let element = as[i];
            let href = element.getAttribute("href");

            // Ensure href ends with '.mp3' and add full URL
            if (href && href.endsWith(".mp3")) {
                let fullUrl = new URL(href, `/${currentfolder}/`).href;
                songs.push(fullUrl.split(`/${currentfolder}/`)[1]);
            }
        }

        


        // show all the songs in the songlist
        let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        songul.innerHTML = "";
        for (const song of songs) {
            songul.innerHTML += `<li>
                            <img class="invert" src="images/music.svg" alt="music">
                            <div class="info">
                                <div class="name">${song.replaceAll("%20", " ")}</div>
                                <div class="artist">Deepak</div>
                            </div>
                            <img class="invert" src="images/play.svg" alt="play">
                        </li>`;
        }

        // attach an event listener to each song
        Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
            e.addEventListener("click", () => {
                let songname = e.querySelector(".info").firstElementChild.innerHTML.trim();
                playmusic(songname);
            });
        });

        return songs;


    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }


}
const playmusic = (songname, pause = false) => {
    // let audio = new Audio("/spotify-clone/songs/" + songname);

    currentSong.src = `/spotify-clone/${currentfolder}/` + songname;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    } else {
        currentSong.pause();
        play.src = "images/play.svg";
    }

    let songinfo = document.querySelector(".songinfo");
    songinfo.innerHTML = `${songname.replaceAll("%20", " ")}`;
    let songtime = document.querySelector(".songtime");
    songtime.innerHTML = "00:00 - ";



}
const formatTime = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;
}

//display all the albums on the page 
async function displayAlbums() {
    let a = await fetch(`songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
    for (let i = 0; i < array.length; i++) {
        let e = array[i];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0];
            // get the metadata of the album
            let info = await fetch(`songs/${folder}/info.json`);
            let infoResponse = await info.json();
            let cardcontainer = document.querySelector(".cardContainer");
            cardcontainer.innerHTML += `
                    <div class="card " data-folder="songs/${folder}">
                        <img src="songs/${folder}/${infoResponse.img}" alt="Album Cover ">
                        <h2>${infoResponse.title}</h2>
                        <p>${infoResponse.description}</p>
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60"
                                fill="none">
                                <circle cx="12" cy="12" r="11" fill="#1fdf64" />
                                <path d="M9 7L17 12L9 17V7Z" fill="black" stroke="black" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
            `;

        }
    }

    //load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
        });
    });

}

async function main() {



    //get the list of all songs
    await getSongs("songs/Haryanvi");

    playmusic(songs[0], true);


    //display all the albums on the page 
    displayAlbums();




    // attach an event listener to play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });


    //listen for time update event  
    currentSong.addEventListener("timeupdate", () => {
        let songtime = document.querySelector(".songtime");
        songtime.innerHTML = formatTime(currentSong.currentTime) + " - " + formatTime(currentSong.duration);

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    });

    // add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let seektime = (e.offsetX / e.target.clientWidth) * currentSong.duration;
        currentSong.currentTime = seektime;
    });

    // add an event listener to the hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // add an event listener to the close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // add an event listener to previous and next
    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playmusic(songs[index - 1]);
        } else {
            playmusic(songs[songs.length - 1]);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) {
            playmusic(songs[index + 1]);
        } else {
            playmusic(songs[0]);
        }
    });



    // add an event listener to the range
    document.querySelector(".range").addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
        if (currentSong.volume == 0) {
            currentSong.muted = true;
            vol.src = "images/mute.svg";
        } else {
            currentSong.muted = false;
            vol.src = "images/volume.svg";
        }
    });
    // add an event listener to the volume
    vol.addEventListener("click", () => {
        currentSong.muted = !currentSong.muted;

        if (currentSong.muted) {
            vol.src = "images/mute.svg";
        } else {
            vol.src = "images/volume.svg";
        }
    });


}

main();
