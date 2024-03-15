/**@type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas1')
const ctx = canvas.getContext('2d')
canvas.width = 700
canvas.height = 700

let played = []
let animationRunning = true // Variable to track if animation is running
let grid = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
]

class Circle {
    constructor(x, y) {
        const cellWidth = canvas.width / 3
        const cellHeight = canvas.height / 3
        
        const regionX = Math.floor(x / cellWidth)
        const regionY = Math.floor(y / cellHeight)
        
        // Check if the click is within the allowed regions
        if (
            (regionX === 0 || regionX === 1 || regionX === 2) &&
            (regionY === 0 || regionY === 1 || regionY === 2)
        ) {
            this.x = (regionX + 0.5) * cellWidth
            this.y = (regionY + 0.5) * cellHeight
        } else {
            this.x = null
            this.y = null
        }

        this.radius = 50
    }

    draw() {
        if (this.x !== null && this.y !== null) {
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
            ctx.stroke() // Draw the circle outline
        }
    }
}

class Ex {
    constructor(x, y) {
        const cellWidth = canvas.width / 3
        const cellHeight = canvas.height / 3
        
        const regionX = Math.floor(x / cellWidth)
        const regionY = Math.floor(y / cellHeight)
        
        // Check if the click is within the allowed regions
        if (
            (regionX === 0 || regionX === 1 || regionX === 2) &&
            (regionY === 0 || regionY === 1 || regionY === 2)
        ) {
            this.x = (regionX + 0.5) * cellWidth
            this.y = (regionY + 0.5) * cellHeight
        } else {
            this.x = null
            this.y = null
        }

        this.size = 100 // Set the size of the "X"
    }

    draw() {
        if (this.x !== null && this.y !== null) {
            ctx.beginPath() // Begin path for the "X"
            ctx.moveTo(this.x - this.size / 2, this.y - this.size / 2) // Move to top-left of the "X"
            ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2) // Draw diagonal line to bottom-right
            ctx.moveTo(this.x - this.size / 2, this.y + this.size / 2) // Move to bottom-left of the "X"
            ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2) // Draw diagonal line to top-right
            ctx.stroke() // Stroke the lines to draw the "X"
        }
    }
}

class AI {
    constructor(symbol) {
        this.symbol = symbol 
    }

    findBestMove() {
        let bestScore = -Infinity
        let move

        // Iterate through all empty cells
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i][j] === null) {
                    // Make the move
                    grid[i][j] = this.symbol
                    // Calculate the score for this move
                    let score = this.minimax(grid, 0, false)
                    // Undo the move
                    grid[i][j] = null
                    // Check if this score is better than the current best score
                    if (score > bestScore) {
                        bestScore = score
                        move = { i, j }
                    }
                }
            }
        }
        // Return the best move
        return move
    }

    minimax(grid, depth, isMaximizing) {
        // Check for terminal states (win, lose, draw)
        const winner = checkWin()
        if (winner === 'circle') {
            return -10 + depth // AI wins
        } else if (winner === 'x') {
            return 10 - depth // Player wins
        } else if (!winner && !grid.flat().includes(null)) {
            return 0 // Draw
        }

        if (isMaximizing) {
            let bestScore = -Infinity
            // Maximizing player (AI)
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (grid[i][j] === null) {
                        grid[i][j] = this.symbol
                        let score = this.minimax(grid, depth + 1, false)
                        grid[i][j] = null
                        bestScore = Math.max(score, bestScore)
                    }
                }
            }
            return bestScore
        } else {
            let bestScore = Infinity
            // Minimizing player (Player)
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (grid[i][j] === null) {
                        grid[i][j] = this.symbol === 'circle' ? 'x' : 'circle'
                        let score = this.minimax(grid, depth + 1, true)
                        grid[i][j] = null
                        bestScore = Math.min(score, bestScore)
                    }
                }
            }
            return bestScore
        }
    }
}

// Instantiate AI player
const aiPlayer = new AI('x')

let lastShape = 'circle' 
const cellWidth = canvas.width / 3 // Define cellWidth
const cellHeight = canvas.height / 3 // Define cellHeight


function StartGame() {
    const choice = prompt("Choose who starts the game: 'player' or 'ai'")
    if (choice === 'player' || choice === 'ai') {
        currentPlayer = choice
        animationRunning = true // Start the animation loop
        animate() // Start the game
    } else {
        alert("Invalid choice! Please choose 'player' or 'ai'.")
    }
}

canvas.addEventListener('click', function(e) {
    if (!animationRunning || currentPlayer !== 'player') return;
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const cellX = Math.floor(mouseX / cellWidth)
    const cellY = Math.floor(mouseY / cellHeight)

    if (grid[cellY][cellX] !== null) return

    if (lastShape === 'circle') {
        const circle = new Circle(mouseX, mouseY)
        played.push(circle)
        grid[cellY][cellX] = 'circle'
        lastShape = 'x'

        const winner = checkWin()
        if (winner) {
            drawWinMessage(winner)
            animationRunning = false
        } else {
            // AI's move
            const { i, j } = aiPlayer.findBestMove()
            grid[i][j] = 'x'
            lastShape = 'circle'
            animate() // Trigger animation loop after AI's move
        }
    }

    animate() // Redraw the frame after player's move
})


function drawGrid() {
    // Define grid parameters
    const rows = 3
    const cols = 3
    const cellWidth = canvas.width / cols
    const cellHeight = canvas.height / rows

    // Draw horizontal grid lines
    for (let i = 1; i < rows; i++) {
        ctx.beginPath()
        ctx.moveTo(0, i * cellHeight)
        ctx.lineTo(canvas.width, i * cellHeight)
        ctx.stroke()
    }

    // Draw vertical grid lines
    for (let j = 1; j < cols; j++) {
        ctx.beginPath()
        ctx.moveTo(j * cellWidth, 0)
        ctx.lineTo(j * cellWidth, canvas.height)
        ctx.stroke()
    }
}

// Call drawGrid function to draw the grid
drawGrid()

function checkWin() {
    // Check for symbols repeated three times across
    for (let i = 0; i < 3; i++) {
        if (grid[i][0] && grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2]) {
            return grid[i][0]
        }
    }

    // Check for symbols repeated three times downwards
    for (let i = 0; i < 3; i++) {
        if (grid[0][i] && grid[0][i] === grid[1][i] && grid[1][i] === grid[2][i]) {
            return grid[0][i]
        }
    }

    // Check for symbols repeated three times diagonally (from top-left to bottom-right)
    if (grid[0][0] && grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
        return grid[0][0]
    }

    // Check for symbols repeated three times diagonally (from top-right to bottom-left)
    if (grid[0][2] && grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) {
        return grid[0][2]
    }

    return null // No winner yet
}

function drawWinMessage(winner) {
    ctx.save()
    ctx.fillStyle = 'red' // Set text color to red for winner
    ctx.font = '40px Arial'
    ctx.fillText(`Player ${winner.toUpperCase()} wins!`, canvas.width / 2 - 150, canvas.height / 2)
    ctx.restore()
}

function animate() {
    ctx.clearRect(0,0,canvas.width, canvas.height)
    const winner = checkWin() // Check for winner
    drawGrid() // Call drawGrid to draw the grid
    played.forEach((circle) => {
        circle.draw()
    })

    if (currentPlayer === 'ai') {
        // AI's move
        const { i, j } = aiPlayer.findBestMove();
        grid[i][j] = 'x';
        currentPlayer = 'player'; // Switch to player's turn after AI's move
    }
    // Draw X's made by AI player
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i][j] === 'x') {
                const ex = new Ex((j + 0.5) * cellWidth, (i + 0.5) * cellHeight)
                ex.draw()
            }
        }
    }
    if (winner) {
        // Draw winning message if there's a winner
        drawWinMessage(winner)
    }
    // Stop animation if there's a winner or animationRunning is false
    if (!animationRunning || winner) {
        return
    }
    requestAnimationFrame(animate)
}
 animate()

function RestartGame(e){
    window.parent.location = window.parent.location.href
}
