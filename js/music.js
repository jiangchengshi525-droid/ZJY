/* =========================
   歌曲数据
========================= */

const songs = [
    {
        title: "大小姐",
        artist: "苏醒AllenSu",
        src: "./music/大小姐.mp3"
    },

    {
        title: "循迹",
        artist: "王铮亮&李佳薇",
        src: "./music/循迹.mp3"
    },

    {
        title: "傻鱼",
        artist: "王栎鑫",
        src: "./music/傻鱼.mp3"
    },

    {
        title: "无所求必满载而归",
        artist: "张远",
        src: "./music/无所求必满载而归.mp3"
    }
];


/* =========================
   获取 HTML 元素
========================= */

const audio =
    document.querySelector("#audio-player");

const playBtn =
    document.querySelector("#play-btn");

const prevBtn =
    document.querySelector("#prev-btn");

const nextBtn =
    document.querySelector("#next-btn");

const progress =
    document.querySelector(".music-progress");

const progressBar =
    document.querySelector(".music-progress-bar");

const musicTime =
    document.querySelector("#music-time");

const playerTitle =
    document.querySelector(".music-top h3");

const playerArtist =
    document.querySelector(".music-top p");

const songItems =
    document.querySelectorAll(".song-item");


/* =========================
   当前歌曲
========================= */

let currentIndex = 0;


/* =========================
   加载歌曲
========================= */

function loadSong(index) {

    // 当前歌曲编号
    currentIndex = index;

    // 当前歌曲的数据
    const song = songs[currentIndex];


    // 修改播放器歌名
    playerTitle.textContent =
        song.title;


    // 修改播放器歌手
    playerArtist.textContent =
        song.artist;


    // 修改音频文件
    audio.src =
        song.src;


    // 进度条归零
    progressBar.style.width =
        "0%";


    // 时间归零
    musicTime.textContent =
        "00:00 / 00:00";


    // 先取消所有歌曲的高亮
    songItems.forEach(function (item) {

        item.classList.remove(
            "active-song"
        );

    });


    // 当前歌曲高亮
    songItems[currentIndex]
        .classList.add(
            "active-song"
        );

}


/* =========================
   播放音乐
========================= */

function playMusic() {

    audio.play();

    playBtn.textContent =
        "❚❚";

}


/* =========================
   暂停音乐
========================= */

function pauseMusic() {

    audio.pause();

    playBtn.textContent =
        "▶";

}


/* =========================
   播放 / 暂停按钮
========================= */

playBtn.addEventListener(
    "click",
    function () {

        if (audio.paused) {

            playMusic();

        } else {

            pauseMusic();

        }

    }
);


/* =========================
   点击左边歌曲切歌
========================= */

songItems.forEach(
    function (item, index) {

        item.addEventListener(
            "click",
            function () {

                // 加载点击的歌曲
                loadSong(index);

                // 自动播放
                playMusic();

            }
        );

    }
);


/* =========================
   上一首
========================= */

prevBtn.addEventListener(
    "click",
    function () {

        currentIndex =
            currentIndex - 1;


        // 如果已经在第一首
        if (currentIndex < 0) {

            currentIndex =
                songs.length - 1;

        }


        loadSong(currentIndex);

        playMusic();

    }
);


/* =========================
   下一首
========================= */

nextBtn.addEventListener(
    "click",
    function () {

        currentIndex =
            currentIndex + 1;


        // 如果已经超过最后一首
        if (
            currentIndex
            >=
            songs.length
        ) {

            currentIndex = 0;

        }


        loadSong(currentIndex);

        playMusic();

    }
);


/* =========================
   播放进度
========================= */

audio.addEventListener(
    "timeupdate",
    function () {

        if (
            isNaN(audio.duration)
        ) {

            return;

        }


        const percent =
            audio.currentTime
            /
            audio.duration
            *
            100;


        progressBar.style.width =
            percent + "%";


        musicTime.textContent =
            formatTime(
                audio.currentTime
            )
            +
            " / "
            +
            formatTime(
                audio.duration
            );

    }
);


/* =========================
   音频信息加载完成
========================= */

audio.addEventListener(
    "loadedmetadata",
    function () {

        musicTime.textContent =
            "00:00 / "
            +
            formatTime(
                audio.duration
            );

    }
);


/* =========================
   点击进度条跳转
========================= */

progress.addEventListener(
    "click",
    function (event) {

        const rect =
            progress
                .getBoundingClientRect();


        const clickX =
            event.clientX
            -
            rect.left;


        const percent =
            clickX
            /
            rect.width;


        audio.currentTime =
            percent
            *
            audio.duration;

    }
);


/* =========================
   一首歌播放结束
   自动播放下一首
========================= */

audio.addEventListener(
    "ended",
    function () {

        currentIndex =
            currentIndex + 1;


        if (
            currentIndex
            >=
            songs.length
        ) {

            currentIndex = 0;

        }


        loadSong(currentIndex);

        playMusic();

    }
);


/* =========================
   时间格式
   例如：
   65秒 → 01:05
========================= */

function formatTime(seconds) {

    if (isNaN(seconds)) {

        return "00:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const secs =
        Math.floor(
            seconds % 60
        );


    return (
        String(minutes)
            .padStart(
                2,
                "0"
            )
        +
        ":"
        +
        String(secs)
            .padStart(
                2,
                "0"
            )
    );

}


/* =========================
   页面首次打开
   加载第一首歌
========================= */

loadSong(0);