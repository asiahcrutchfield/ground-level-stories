import "./style.css"

// getting paths to stories, images and audio
let storyLang: string = "zh"
let level: string = "0"
const imgPath: string = `/dictionary/${storyLang}/images/`
const vocabAudioPath: string = `/dictionary/${storyLang}/audio/lvl${level}/vocab/`
const storyAudioPath: string = `/dictionary/${storyLang}/audio/lvl${level}/stories/`
const storyPath: string = `/dictionary/${storyLang}/levels/lvl${level}/stories.json` // path to stories
const vocabPath: string = `/dictionary/${storyLang}/levels/lvl${level}/lvl${level}.json` // path to vocab list

// defining types
type Story = {
    readonly id: string,
    title: string,
    coreVocab: string[],
    lines: string[],
    audio: string,
    images: {[imageName: string]: string},
    vocabAudio: {[audioName: string]: string}
}

type Stories = Story[]

// fetch story data
async function fetchStories(): Promise<Stories> {
    const response: Response = await fetch(storyPath)
    const stories: Stories = await response.json()

    return stories
}

let storyIndex: number = 0

// fetch dictionary
async function fetchVocab(): Promise<string[]> {
    const response: Response = await fetch(vocabPath)
    const dict = await response.json()

    return dict
}
const vocabDict: string[] = await fetchVocab()

// load story by index number
async function loadStory(): Promise<Story> {
    const stories = await fetchStories()
    const storySelector = document.querySelector<HTMLSelectElement>("#story-select") 

    // populate selections
    stories.forEach((story: Story, index: number) => {
        const option: HTMLOptionElement = document.createElement("option")
            option.value = `story-${index+1}`
            option.textContent = `${story.title}`
        storySelector?.append(option)

        if (index === 0) {
            option.selected = true
        }
    })
    
    const options = document.querySelectorAll<HTMLOptionElement>("#story-select option")
    options.forEach((option: HTMLOptionElement, num: number) => {
        option.addEventListener("click", ()=> {
            storyIndex === num
        })
    })

    let story = stories[storyIndex]

    return story
}

const story = await loadStory()

// load and display images and audio
const imgframe = document.querySelector<HTMLDivElement>("#image-frame")
const vocabAudio = document.querySelector<HTMLAudioElement>(".vocab-audio")

// 1. load all images based on coreVocab
function initImages(storyItem: Story): void {
    if (!imgframe) return
    imgframe.innerHTML = ""

    // append all the core vocab to the image frame
    storyItem.coreVocab.forEach((vocab: string, index: number) => {
        const imagefilename = storyItem.images[vocab]
        const img = document.createElement("img")
            img.classList.add("primer-image")
            img.src = `${imgPath}${imagefilename}`
            img.alt = `${imagefilename}`
        imgframe.append(img)
        
        if (index === 0) {
            img.classList.add("img-display") // only display the first image
        }
    })
}
initImages(story)

// 2. initialize correct vocab audio
function initVocabAudio(storyItem: Story): void {
    if (!vocabAudio) return


    vocabAudio.src = `${vocabAudioPath}${storyItem.vocabAudio[storyItem.coreVocab[0]]}`
    vocabAudio.load() // load the correct audio
}
initVocabAudio(story)

let vocabIndex: number = 0

// 3. cycle through images and audio
const forwardBtn = document.querySelector<HTMLButtonElement>("#forward")
const backBtn = document.querySelector<HTMLButtonElement>("#backward")
const vocabImages = document.querySelectorAll<HTMLImageElement>(".primer-image")
    const numOfImages: number = vocabImages.length

function forward(): void {
    if (forwardBtn) {
        forwardBtn.addEventListener("click", () => {
            const prevIndex: number = vocabIndex
            vocabIndex = (vocabIndex + 1) % numOfImages
            vocabImages[prevIndex].classList.remove("img-display")
            vocabImages[vocabIndex].classList.add("img-display")
            if (vocabAudio) {
                vocabAudio.src = `${vocabAudioPath}${story.vocabAudio[story.coreVocab[vocabIndex]]}`
                vocabAudio.load() // load the correct audio
            }
        })
    }
}

function backward(): void {
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            const nextIndex: number = vocabIndex
            vocabIndex = (vocabIndex - 1 + numOfImages) % numOfImages
            vocabImages[nextIndex].classList.remove("img-display")
            vocabImages[vocabIndex].classList.add("img-display")
            if (vocabAudio) {
                vocabAudio.src = `${vocabAudioPath}${story.vocabAudio[story.coreVocab[vocabIndex]]}`
                vocabAudio.load() // load the correct audio
            }
        })
    }
}

// activate front and back buttons
function imagePrimer(): void {
    forward()
    backward()
}
imagePrimer()

// 4. initialize story
const storyPlayer = document.querySelector<HTMLAudioElement>("#story")

function initStory(): void {
    if (!storyPlayer) return

    storyPlayer.src = `${storyAudioPath}${story.audio}`
    storyPlayer.load()
}
initStory()

// build review sections
// 1. select random number 
function randomIndex(arrayLen: number): number {
    return Math.floor(Math.random() * arrayLen)
}

// 2. display question image/audio
const reviewPic = document.querySelector<HTMLImageElement>("#pic-audio img")
    const picReview = document.querySelector<HTMLDivElement>("#pic-audio")
const reviewAudio = document.querySelector<HTMLAudioElement>("#audio-pic audio")
    const audioReview = document.querySelector<HTMLDivElement>("#audio-pic")
const reviewSection = document.querySelectorAll<HTMLDivElement>(".review")

function loadMedia(): number {
    const randNum: number = Math.floor(Math.random() * 2)

    reviewSection.forEach(section => {
        section.classList.add("hide")
    })

    if (randNum === 0) {
        picReview?.classList.remove("hide")
    } else {
        audioReview?.classList.remove("hide")
    }
    return randNum
}

// 3. build test
function buildTest(index: number): void {
    let randIndex: number = randomIndex(index)
    const picVocab: string = story.images[story.coreVocab[randIndex]]
        const picAnswers = document.querySelectorAll<HTMLImageElement>("#audio-pic img")
    const audioVocab: string = story.vocabAudio[story.coreVocab[randIndex]]
        const audioAnswers = document.querySelectorAll<HTMLAudioElement>("#pic-audio audio")
    const picAudioTest: number = loadMedia()

    if (picAudioTest === 0) {
        if (reviewPic) {
            reviewPic.src = `${imgPath}${picVocab}`
            // populate the correct answers
            audioAnswers.forEach((audio: HTMLAudioElement, index: number) => {
                const correctAudio: number = Math.floor(Math.random() * 2)
                const correctAnswer = 

                if (index !== correctAudio) {
                    audio.src = audioVocab
                }
                audio.load()
            })
        }
    } else {
        if (reviewAudio) {
            reviewAudio.src = `${vocabAudioPath}${audioVocab}`
        }
    }
} 