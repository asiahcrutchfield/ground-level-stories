import "./style.css"

// getting paths to stories, images and audio
let storyLang: string = "zh"
let level: string = "0"
const imgPath: string = `/dictionary/${storyLang}/images/`
const audioPath: string = `/dictionary/${storyLang}/audio/lvl${level}/`
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

// load story by index number
async function loadStory(index: number): Promise<Story> {
    const stories = await fetchStories()
    let story = stories[index]

    return story
}

const story = await loadStory(storyIndex)

// load and display images and audio
const imgframe = document.querySelector<HTMLDivElement>("#image-frame")
const vocabAudio = document.querySelector<HTMLAudioElement>(".vocab-audio")
const imgBtns = document.querySelectorAll<HTMLButtonElement>(".nav-btn")

// 1. load all images based on coreVocab
function initImages(storyItem: Story): void {
    if (!imgframe) return
    imgframe.innerHTML = ""

    storyItem.coreVocab.forEach((vocab: string, index: number) => {
        const imagefilename = storyItem.images[vocab]
        const img = document.createElement("img")
            img.classList.add("primer-image")
            img.src = `${imgPath}${imagefilename}`
            img.alt = `${imagefilename}`
        imgframe.append(img)
        
        if (index === 0) {
            img.classList.add("img-display")
        }
    })
}
initImages(story)

// 2. initialize correct vocab audio
function initVocabAudio(storyItem: Story): void {
    if (!vocabAudio) return

    vocabAudio.src = `${audioPath}${storyItem.vocabAudio[storyItem.coreVocab[0]]}`
}
initVocabAudio(story)

// 3. cycle through images and audio
