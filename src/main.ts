import "./style.css"

// getting paths to stories, images and audio
let storyLang: string = "zh"
let level: string = "0"
const imgPath: string = `/dictionary/${storyLang}/images/`
const audioPath: string = `/dictionary/${storyLang}/audio/lvl${level}`
const storyPath: string = `/dictionary/${storyLang}/levels/lvl${level}/stories.json` // path to stories
const vocabPath: string = `/dictionary/${storyLang}/levels/lvl${level}/lvl${level}.json` // path to vocab list

// defining types
type Story = {
    readonly id: string,
    title: string,
    coreVocab: string[],
    lines: string[],
    audio: string
}

type Stories = Story[]

// fetch story data
async function fetchStories(): Promise<void> {
    const response: Response = await fetch(storyPath)
    const stories: Stories = await response.json()

    console.log(stories)
}
