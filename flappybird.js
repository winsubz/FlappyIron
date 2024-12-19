// Khai báo âm thanh
let sound_bgm_mario = new Audio('./bgm_mario.mp3'); // Nhạc nền
let sound_die = new Audio('./die.mp3');             // Âm thanh khi chết
let sound_point = new Audio('./point.mp3');         // Âm thanh ghi điểm

sound_bgm_mario.loop = true; // Lặp lại nhạc nền

// Phát nhạc nền khi trò chơi bắt đầu
window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    document.addEventListener("keydown", startGame); // Bắt đầu game trên PC
    document.addEventListener("touchstart", startGame); // Bắt đầu game trên thiết bị cảm ứng
    setInterval(placePipes, 1700); // Mỗi 1.5 giây thêm ống mới

    // Gọi hàm điều chỉnh kích thước footer
    adjustFooter();
};

// Hàm điều chỉnh kích thước footer
function adjustFooter() {
    const footer = document.querySelector("footer");
    const board = document.getElementById("board");

    // Đặt chiều rộng footer theo chiều rộng canvas
    footer.style.width = `${board.offsetWidth}px`;
    footer.style.margin = "0 auto"; // Căn giữa footer
    footer.style.position = "relative"; // Đảm bảo footer di chuyển theo canvas
}

// Khởi động game và phát nhạc nền khi có tương tác
function startGame(e) {
    if (!sound_bgm_mario.played) {
        sound_bgm_mario.play(); // Phát nhạc nền
    }
    document.removeEventListener("keydown", startGame); // Chỉ cần phát nhạc nền một lần
    document.addEventListener("keydown", moveBird); // Gán sự kiện điều khiển bird
    requestAnimationFrame(update); // Bắt đầu vòng lặp trò chơi
}

function update() {
    if (gameOver) {
        sound_die.play(); // Phát âm thanh khi chết
        sound_bgm_mario.pause(); // Dừng nhạc nền
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // Bird không bay vượt màn hình trên
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // Pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Ghi điểm khi qua cột
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 0.5 cho mỗi ống
            pipe.passed = true;
            sound_point.play(); // Phát âm thanh ghi điểm
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Loại bỏ ống thừa
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Vẽ điểm số
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    } else {
        requestAnimationFrame(update); // Tiếp tục cập nhật
    }
}

function placePipes() {
    if (gameOver) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;    /* Khoang cach 2 ong */

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (
        (e.type === "keydown" && (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX")) || 
        e.type === "touchstart"
    ) {
        velocityY = -6;

        if (gameOver) {
            // Reset game
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            sound_bgm_mario.play(); // Phát lại nhạc nền
            requestAnimationFrame(update);
        }
    }
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width && // Góc trái trên của a không vượt qua góc phải trên của b
        a.x + a.width > b.x && // Góc phải trên của a vượt qua góc trái trên của b
        a.y < b.y + b.height && // Góc trái trên của a không vượt qua góc trái dưới của b
        a.y + a.height > b.y // Góc trái dưới của a vượt qua góc trái trên của b
    );
}

// Board và Bird
let board;
let boardWidth = 500;     /*            màn hình           */
let boardHeight = 610;
let context;

let birdWidth = 64;                     /* kich co chim */
let birdHeight = 48;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };

// Pipes                    /* cot */
let pipeArray = [];
let pipeWidth = 74;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
