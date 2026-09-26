const heroPrev = document.querySelector(".hero-prev");
const heroNext = document.querySelector(".hero-next");
const heroImage = document.querySelector(".hero-image");
const heroDots = document.querySelectorAll(".hero-dot");

function updateDots(){

    heroDots.forEach(function(dot){
        dot.classList.remove("active");
    });

    heroDots[heroIndex].classList.add("active");
}

const heroImages = [
    "./image/hero.jpg",
    "./image/hero2.jpg",
    "./image/hero3.jpg",
    "./image/hero4.jpg",
    "./image/hero5.jpg",
    "./image/hero6.jpg"
];

let heroIndex = 0;

function updateDots(){

    heroDots.forEach(function(dot){
        dot.classList.remove("active");
    });

    heroDots[heroIndex].classList.add("active");

}

function changeHeroImage(){

    // 先让旧图片淡出
    heroImage.classList.add("fade");

    // 等待0.3秒
    setTimeout(function(){

        // 换成新的图片
        heroImage.src = heroImages[heroIndex];

        // 删除fade，让新图片重新淡入
        heroImage.classList.remove("fade");

    }, 300);

}

heroNext.addEventListener("click", function(){

    heroIndex = heroIndex + 1;

    if(heroIndex >= heroImages.length){
        heroIndex = 0;
    }

    changeHeroImage();
    updateDots();

});

heroPrev.addEventListener("click", function(){

    heroIndex = heroIndex - 1;

    if(heroIndex < 0){
        heroIndex = heroImages.length - 1;
    }
    
    changeHeroImage();
    updateDots();

});

heroDots.forEach(function(dot, index){

    dot.addEventListener("click", function(){

        heroIndex = index;

        changeHeroImage();

        updateDots();

    });

});