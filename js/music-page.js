
/* ==========================================
   MUSIC PAGE
   QQ 音乐歌单自动展示

   功能：
   1. 读取 music.json
   2. 歌手分类
   3. 搜索歌曲
   4. 排序
   5. 加载更多
   6. 点击歌曲切换右侧黑胶
========================================== */

(() => {

    "use strict";


    // =========================
    // 1. 基础设置
    // =========================

    // 每次显示多少首歌曲
    const PAGE_SIZE = 24;

    // 所有歌曲
    let allSongs = [];

    // 当前筛选后的歌曲
    let filteredSongs = [];

    // 当前分类
    let currentCategory = "all";

    // 当前显示的歌曲数量
    let visibleCount = PAGE_SIZE;

    // 当前选中的歌曲编号
    let selectedIndex = -1;


    // 分类名称
    const categoryNames = {

        all: "全部歌曲",

        ccs: "陈楚生",

        Allen: "苏醒",

        KA: "王栎鑫",

        Bird: "张远",

        Reno: "王铮亮",

        LT: "陆虎",

        collab: "六人合作",

        other: "其他收藏"

    };


    // =========================
    // 2. 默认封面
    // =========================

    // 无需额外图片文件
    // 直接使用 SVG 制作备用唱片封面

    const DEFAULT_COVER =
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="300"
                 height="300"
                 viewBox="0 0 300 300">

                <rect width="300"
                      height="300"
                      fill="#203c32"/>

                <circle cx="150"
                        cy="150"
                        r="105"
                        fill="#152923"
                        stroke="#6ccbab"
                        stroke-width="3"/>

                <circle cx="150"
                        cy="150"
                        r="80"
                        fill="none"
                        stroke="#466d5c"
                        stroke-width="2"/>

                <circle cx="150"
                        cy="150"
                        r="55"
                        fill="none"
                        stroke="#466d5c"
                        stroke-width="2"/>

                <circle cx="150"
                        cy="150"
                        r="30"
                        fill="#65d9b0"/>

                <circle cx="150"
                        cy="150"
                        r="7"
                        fill="#173a2d"/>

            </svg>
        `);


    // =========================
    // 3. 获取 HTML 元素
    // =========================

    const songList =
        document.querySelector("#songList");

    const filters =
        document.querySelector("#musicFilters");

    const searchInput =
        document.querySelector("#musicSearch");

    const sortSelect =
        document.querySelector("#musicSort");

    const loadMoreButton =
        document.querySelector("#loadMoreSongs");

    const totalSongs =
        document.querySelector("#totalSongs");

    const resultCount =
        document.querySelector("#resultCount");

    const currentCategoryTitle =
        document.querySelector("#currentCategory");


    // 右侧黑胶相关元素

    const vinylCover =
        document.querySelector("#vinylCover");

    const playerTitle =
        document.querySelector("#playerTitle");

    const playerArtist =
        document.querySelector("#playerArtist");

    const playerAlbum =
        document.querySelector("#playerAlbum");

    const qqMusicLink =
        document.querySelector("#qqMusicLink");

    const playerFootnote =
        document.querySelector(
            ".player-footnote span:first-child"
        );


    // =========================
    // 4. 图片和链接处理
    // =========================

    function getCover(song) {

        return song.cover || DEFAULT_COVER;

    }


    // 如果远程封面加载失败，显示默认图
    function handleImageError(img) {

        img.addEventListener("error", () => {

            if (img.src !== DEFAULT_COVER) {
                img.src = DEFAULT_COVER;
            }

        });

    }


    function getSongLink(song) {

        // 优先使用导入 JSON 时保存的 QQ 音乐链接
        if (
            typeof song.link === "string" &&
            song.link.startsWith("https://y.qq.com/")
        ) {
            return song.link;
        }

        // 没有有效链接时，根据歌曲 MID 生成
        if (/^[a-zA-Z0-9]+$/.test(song.songmid)) {

            return (
                "https://y.qq.com/n/ryqq/songDetail/" +
                song.songmid
            );

        }

        return "https://y.qq.com/";

    }


    // =========================
    // 5. 读取 music.json
    // =========================

    async function loadMusic() {

        showMessage("正在读取 QQ 音乐歌单……");

        try {

            const response = await fetch(
                "./data/music.json",
                { cache: "no-cache" }
            );

            if (!response.ok) {

                throw new Error(
                    "读取失败：" + response.status
                );

            }

            const data = await response.json();

            if (!Array.isArray(data.songs)) {

                throw new Error(
                    "music.json 中没有有效歌曲列表"
                );

            }


            // 给每首歌一个编号
            // 方便后面选择和定位

            allSongs = data.songs.map((song, index) => {

                return {

                    index: index,

                    title: song.title || "未命名歌曲",

                    artists: Array.isArray(song.artists)
                        ? song.artists
                        : [],

                    album: song.album || "",

                    categories: Array.isArray(song.categories)
                        ? song.categories
                        : ["other"],

                    cover: song.cover || "",

                    link: song.link || "",

                    songmid: song.songmid || ""

                };

            });


            // 更新总歌曲数量

            totalSongs.textContent = allSongs.length;


            // 默认选择歌单的第一首歌

            if (allSongs.length > 0) {

                selectSong(allSongs[0]);

            }


            // 显示全部歌曲

            applyFilters();

            console.log(
                `成功加载 ${allSongs.length} 首歌曲`
            );


        } catch (error) {

            console.error(
                "音乐数据读取失败：",
                error
            );

            showMessage(
                "歌曲加载失败，请检查 data/music.json，并使用 Live Server 打开页面。"
            );

        }

    }


    // =========================
    // 6. 分类 + 搜索 + 排序
    // =========================

    function applyFilters() {

        // 搜索框输入内容
        const keyword =
            searchInput.value.trim().toLowerCase();


        // 第一步：分类筛选

        filteredSongs = allSongs.filter(song => {

            if (currentCategory === "all") {

                return true;

            }

            return song.categories.includes(
                currentCategory
            );

        });


        // 第二步：搜索筛选

        if (keyword !== "") {

            filteredSongs = filteredSongs.filter(song => {

                const searchText = [

                    song.title,

                    song.artists.join(" "),

                    song.album

                ].join(" ").toLowerCase();


                return searchText.includes(keyword);

            });

        }


        // 第三步：排序

        const sortType = sortSelect.value;


        if (sortType === "name") {

            filteredSongs.sort((a, b) => {

                return a.title.localeCompare(
                    b.title,
                    "zh-CN"
                );

            });

        }


        else if (sortType === "artist") {

            filteredSongs.sort((a, b) => {

                const artistA =
                    a.artists.join(" ");

                const artistB =
                    b.artists.join(" ");


                return artistA.localeCompare(
                    artistB,
                    "zh-CN"
                );

            });

        }


        // 歌单顺序默认不排序，
        // 保留 music.json 中原始的歌曲顺序


        // 每次重新筛选，从前 24 首开始展示

        visibleCount = PAGE_SIZE;


        // 更新标题和结果数量

        currentCategoryTitle.textContent =
            categoryNames[currentCategory];

        resultCount.textContent =
            `共找到 ${filteredSongs.length} 首歌曲`;


        // 如果原来选中的歌不在当前分类里，
        // 自动选中筛选结果里的第一首

        if (
            filteredSongs.length > 0 &&
            !filteredSongs.some(
                song => song.index === selectedIndex
            )
        ) {

            selectSong(filteredSongs[0]);

        }


        // 重新生成歌曲列表

        renderSongs();

    }


    // =========================
    // 7. 创建单首歌曲 HTML
    // =========================

    function createSongItem(song, position) {

        // li：整首歌曲所在的行
        const li = document.createElement("li");

        li.className = "song-item";

        li.dataset.index = song.index;


        if (song.index === selectedIndex) {

            li.classList.add("is-selected");

        }


        // 歌曲选择按钮
        const button = document.createElement("button");

        button.className = "song-select";
        button.type = "button";

        button.setAttribute(
            "aria-label",
            `查看${song.title}的唱片信息`
        );

        button.setAttribute(
            "aria-pressed",
            String(song.index === selectedIndex)
        );


        // 序号
        const number = document.createElement("span");

        number.className = "song-number";

        number.textContent =
            String(position + 1).padStart(2, "0");


        // 专辑封面
        const img = document.createElement("img");

        img.className = "song-cover";

        img.alt = song.title + "封面";

        img.loading = "lazy";

        handleImageError(img);

        img.src = getCover(song);


        // 歌曲名 + 歌手
        const details = document.createElement("span");

        details.className = "song-details";


        const title = document.createElement("strong");

        title.textContent = song.title;


        const artist = document.createElement("small");

        artist.textContent =
            song.artists.join(" / ") || "未知歌手";


        details.append(title, artist);


        // 专辑名称
        const album = document.createElement("span");

        album.className = "song-album";

        album.textContent =
            song.album || "暂无专辑";


        // 合并按钮内容
        button.append(
            number,
            img,
            details,
            album
        );


        // 点击歌曲，切换右侧黑胶
        button.addEventListener("click", () => {

            selectSong(song);

        });


        // QQ 音乐跳转链接
        const external = document.createElement("a");

        external.className = "song-external";

        external.href = getSongLink(song);

        external.target = "_blank";

        external.rel = "noopener noreferrer";

        external.textContent = "↗";

        external.setAttribute(
            "aria-label",
            `在 QQ 音乐打开${song.title}`
        );


        li.append(button, external);

        return li;

    }


    // =========================
    // 8. 生成歌曲列表
    // =========================

    function renderSongs() {

        // 清空旧列表
        songList.replaceChildren();


        if (filteredSongs.length === 0) {

            showMessage("没有找到符合条件的歌曲");

            return;

        }


        const songsToShow =
            filteredSongs.slice(0, visibleCount);


        const fragment =
            document.createDocumentFragment();


        songsToShow.forEach((song, index) => {

            fragment.appendChild(
                createSongItem(song, index)
            );

        });


        songList.appendChild(fragment);


        // 是否还有歌曲未显示
        const hasMore =
            visibleCount < filteredSongs.length;


        loadMoreButton.style.display =
            hasMore ? "flex" : "none";

    }


    // =========================
    // 9. 选择歌曲，更新黑胶
    // =========================

    function selectSong(song) {

        selectedIndex = song.index;


        // 唱片封面
        vinylCover.src = getCover(song);


        // 标题和歌手
        playerTitle.textContent = song.title;

        playerArtist.textContent =
            song.artists.join(" / ") || "未知歌手";


        // 专辑信息
        playerAlbum.textContent =
            "专辑：" + (song.album || "暂无专辑");


        // QQ 音乐链接
        qqMusicLink.href = getSongLink(song);


        // 黑胶下方编号
        if (playerFootnote) {

            playerFootnote.textContent =
                "NO. " +
                String(song.index + 1).padStart(3, "0") +
                " / MUSIC COLLECTION";

        }


        // 更新歌曲列表的选中样式

        songList.querySelectorAll(
            ".song-item"
        ).forEach(item => {

            const isSelected =
                Number(item.dataset.index) === selectedIndex;


            item.classList.toggle(
                "is-selected",
                isSelected
            );


            item.querySelector(
                ".song-select"
            ).setAttribute(
                "aria-pressed",
                String(isSelected)
            );

        });
        
        // =========================
        // 黑胶切换动画
        // =========================

        const vinylDisc =
            document.querySelector(".vinyl-disc");

        const songInfo =
            document.querySelector(".player-song-info");

        // 只有用户没有开启减少动画设置时才执行
        if (
            !window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {

            if (vinylDisc) {

                // 避免连续点击时动画叠加
                vinylDisc.getAnimations().forEach(animation => {
                    animation.cancel();
                });

                // 黑胶轻轻旋转并回到原位
                vinylDisc.animate(

                    [
                        {
                            transform: "rotate(-16deg) scale(.97)"
                        },
                        {
                            transform: "rotate(4deg) scale(1.01)",
                            offset: 0.65
                        },
                        {
                            transform: "rotate(0deg) scale(1)"
                        }
                    ],

                    {
                        duration: 650,
                        easing: "ease-out"
                    }

                );

            }


            // 歌曲信息从下方淡入
            if (songInfo) {

                songInfo.getAnimations().forEach(animation => {
                    animation.cancel();
                });

                songInfo.animate(

                    [
                        {
                            opacity: 0.4,
                            transform: "translateY(8px)"
                        },
                        {
                            opacity: 1,
                            transform: "translateY(0)"
                        }
                    ],

                    {
                        duration: 380,
                        easing: "ease-out"
                    }

                );

            }

        }

    }


    // =========================
    // 10. 空状态 / 错误提示
    // =========================

    function showMessage(message) {

        songList.replaceChildren();


        const li = document.createElement("li");

        li.className = "song-empty";

        li.textContent = message;


        songList.appendChild(li);


        loadMoreButton.style.display = "none";

    }


    // =========================
    // 11. 绑定用户操作
    // =========================

    function bindEvents() {


        // 左侧分类点击
        filters.addEventListener("click", event => {

            const button =
                event.target.closest(".music-filter");

            if (!button) return;


            currentCategory =
                button.dataset.category;


            // 更新分类按钮的选中状态
            filters.querySelectorAll(
                ".music-filter"
            ).forEach(item => {

                const active = item === button;

                item.classList.toggle(
                    "is-active",
                    active
                );

                item.setAttribute(
                    "aria-pressed",
                    String(active)
                );

            });


            applyFilters();

        });


        // 搜索框
        searchInput.addEventListener("input", () => {

            applyFilters();

        });


        // 排序切换
        sortSelect.addEventListener("change", () => {

            applyFilters();

        });


        // 加载更多
        loadMoreButton.addEventListener("click", () => {

            visibleCount += PAGE_SIZE;

            renderSongs();

        });

    }


    // =========================
    // 12. 页面初始化
    // =========================

    function init() {

        handleImageError(vinylCover);

        bindEvents();

        loadMusic();

    }


    document.addEventListener(
        "DOMContentLoaded",
        init
    );


})();
