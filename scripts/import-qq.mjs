import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


// ==============================
// 1. 你的 QQ 音乐歌单
// ==============================

const PLAYLIST_ID = "9034783748";


// ==============================
// 2. 六个人的信息
// ==============================

const members = [
    {
        name: "陈楚生",
        aliases: ["陈楚生"],
        id: "ccs"
    },
    {
        name: "苏醒",
        aliases: ["苏醒", "苏醒AllenSu"],
        id: "Allen"
    },
    {
        name: "王栎鑫",
        aliases: ["王栎鑫"],
        id: "KA"
    },
    {
        name: "张远",
        aliases: ["张远"],
        id: "Bird"
    },
    {
        name: "王铮亮",
        aliases: ["王铮亮"],
        id: "Reno"
    },
    {
        name: "陆虎",
        aliases: ["陆虎", "陸虎"],
        id: "LT"
    }
];

// ==============================
// 3. QQ音乐歌单接口
// ==============================

const url =
    "https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg" +
    "?type=1" +
    "&json=1" +
    "&utf8=1" +
    "&onlysong=0" +
    `&disstid=${PLAYLIST_ID}` +
    "&format=jsonp" +
    "&g_tk=5381" +
    "&jsonpCallback=playlistinfoCallback" +
    "&loginUin=0" +
    "&hostUin=0" +
    "&inCharset=utf8" +
    "&outCharset=utf-8" +
    "&platform=yqq" +
    "&needNewCode=0";


// ==============================
// 4. 请求歌单
// ==============================

console.log("正在读取 QQ 音乐歌单……");

const response = await fetch(url, {

    headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://y.qq.com/"
    }

});


if (!response.ok) {

    throw new Error(
        `读取失败：HTTP ${response.status}`
    );

}


const text = await response.text();


// ==============================
// 5. JSONP → JSON
// ==============================

const start = text.indexOf("(");
const end = text.lastIndexOf(")");

if (start === -1 || end === -1) {

    throw new Error(
        "QQ音乐返回的数据格式不正确"
    );

}


const jsonText = text.slice(start + 1, end);

const data = JSON.parse(jsonText);


// ==============================
// 6. 找到歌曲列表
// ==============================

if (
    !data.cdlist ||
    !data.cdlist[0] ||
    !data.cdlist[0].songlist
) {

    throw new Error(
        "没有读取到歌单歌曲"
    );

}


const playlist = data.cdlist[0];

const songList = playlist.songlist;


// ==============================
// 7. 整理歌曲
// ==============================

const songs = songList.map(song => {

    // 所有歌手
    const artists =
        song.singer?.map(
            singer => singer.name
        ) || [];


    // 判断这首歌属于六个人中的谁
    const matchedMembers =
    members.filter(member => {

        return member.aliases.some(alias => {

            const matchArtist =
                artists.some(
                    artist =>
                        artist.includes(alias)
                );

            const matchTitle =
                song.songname.includes(alias);

            return matchArtist || matchTitle;

        });

    });


    // 分类
    const categories =
        matchedMembers.map(
            member => member.id
        );


    // 两个人及以上一起唱
    if (matchedMembers.length >= 2) {

        categories.push("collab");

    }


    // 六个人都没有匹配到
    if (matchedMembers.length === 0) {

        categories.push("other");

    }


    // 专辑封面
    const cover = song.albummid
        ? `https://y.qq.com/music/photo_new/T002R500x500M000${song.albummid}.jpg`
        : "";


    return {

        title: song.songname,

        artists: artists,

        album: song.albumname || "",

        songmid: song.songmid,

        albummid: song.albummid || "",

        categories: categories,

        cover: cover,

        link:
            `https://y.qq.com/n/ryqq/songDetail/${song.songmid}`

    };

});


// ==============================
// 8. 最终数据
// ==============================

const output = {

    playlist: {

        id: PLAYLIST_ID,

        name: playlist.dissname || "QQ音乐歌单",

        songCount: songs.length,

        updatedAt:
            new Date().toISOString()

    },

    songs: songs

};


// ==============================
// 9. 写入 music.json
// ==============================

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const outputPath =
    path.join(
        __dirname,
        "../data/music.json"
    );


fs.mkdirSync(
    path.dirname(outputPath),
    {
        recursive: true
    }
);


fs.writeFileSync(

    outputPath,

    JSON.stringify(
        output,
        null,
        2
    ),

    "utf-8"

);


// ==============================
// 10. 显示结果
// ==============================

console.log("");
console.log("导入成功！");
console.log("");
console.log(`歌单：${output.playlist.name}`);
console.log(`歌曲数量：${songs.length}`);
console.log("");
console.log("已经生成：");
console.log("data/music.json");