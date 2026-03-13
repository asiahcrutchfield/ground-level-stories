import "./style.css"

// retrieving info from language engine
let storyLang: string = "zh"
const universal: string = "u"
let conceptNum: number = 0
let conceptItemNum: number = 0
    const conceptCat: string = String(conceptNum).padStart(2, '0')
    const conceptItem: string = String(conceptItemNum).padStart(4, "0")

// getting paths to stories, images and audio
let level: string = "0"
const imgPath1: string = `/dictionary/universal/${storyLang}/images/`
const imgPath2: string = `/dictionary/langs/${storyLang}/images/`
const vocabAudioPath: string = `/dictionary/langs/${storyLang}/audio/`
const storyAudioPath: string = `/stories/langs/${storyLang}/lvl_${level}/`
const storyPath: string = `/stories/langs/${storyLang}/lvl_${level}/stories.json` // path to stories
const vocabPath: string = `/dictionary/levels/lang/${storyLang}/lvl_${level}.json` // path to vocab list

// defining types
type Story = {
    readonly id: string,
    title: string,
    coreConcepts: string[],
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
    storyItem.coreConcepts.forEach((vocab: string, index: number) => {
        const imagefilename = storyItem.images[vocab]
        const img = document.createElement("img")
            img.classList.add("primer-image")
            img.src = `${imgPath1}${imagefilename}`
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


    vocabAudio.src = `${vocabAudioPath}${storyItem.vocabAudio[storyItem.coreConcepts[0]]}`
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
                vocabAudio.src = `${vocabAudioPath}${story.vocabAudio[story.coreConcepts[vocabIndex]]}`
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
                vocabAudio.src = `${vocabAudioPath}${story.vocabAudio[story.coreConcepts[vocabIndex]]}`
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

// build test sections
// 1. select random number 
function randomIndex(arrayLen: number): number {
    return Math.floor(Math.random() * arrayLen)
}

// 2. remove item from list
function removeItem(arr: string[], itemIndex: number): void {
    arr.splice(itemIndex, 1)
}

// 3. display question image/audio
const tests: NodeListOf<HTMLDivElement> = document.querySelectorAll<HTMLDivElement>(".review")
const imgTest: HTMLDivElement = document.querySelector<HTMLDivElement>("#pic-audio")!
    const imgQuestion: HTMLImageElement = document.querySelector<HTMLImageElement>("#pic-audio .review-img")!
const audioTest: HTMLDivElement = document.querySelector<HTMLDivElement>("#audio-pic")!
    const audioQuestion: HTMLAudioElement = document.querySelector<HTMLAudioElement>("#audio-pic .review-audio")!

function loadQuestion(arr: string[], indexNum: number): number {
    const randNum: number = Math.floor(Math.random() * 2)
    const imgAudioWord: string = arr[indexNum]

    // 1. hide both sections
    tests.forEach(test => {
        test.classList.add("hide")
    })

    // 2. display test and question based on randNum
    if (randNum === 0) {
        imgTest.classList.remove("hide")
        imgQuestion.src = `${imgPath1}${story.images[imgAudioWord]}`
    } else {
        audioTest.classList.remove("hide")
        audioQuestion.src = `${vocabAudioPath}${story.vocabAudio[imgAudioWord]}`
        audioQuestion.load()
    }

    return randNum
}

// 4. find item by key
function getKey(obj: Record<string, string>, value: string): string | undefined {
    const keyList = Object.keys(obj)

    for (const key of keyList) {
        if (obj[key] === value) {
            return key
        }
    }
}

// 5. choose random answer item and populate choices
const picLabels: NodeListOf<HTMLLabelElement> = document.querySelectorAll<HTMLLabelElement>(".pic-label")
    const picChoices: NodeListOf<HTMLImageElement> = document.querySelectorAll<HTMLImageElement>(".pic-label .review-img")
const audioLabels: NodeListOf<HTMLLabelElement> = document.querySelectorAll<HTMLLabelElement>(".audio-label")
    const audioChoices: NodeListOf<HTMLAudioElement> = document.querySelectorAll<HTMLAudioElement>(".audio-label .review-audio")
const picRadio: NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>("input[name='pic-choice']")!
const audioRadio: NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>("input[name='audio-choice']")!

function randomAnswer(num: number): number {
    // create copy of original array
    const wrongAnswers: string[] = [...story.coreConcepts]
    console.log(wrongAnswers)
    // get length of choices
    const picLen: number = picLabels.length
    const audioLen: number = audioLabels.length
    // get a random number 
    const correctPic = Math.floor(Math.random() * picLen) 
    const correctAudio = Math.floor(Math.random() * audioLen)

    // populate correct answer
    if (num === 0) {
        const imgName: string = imgQuestion.src.split("/").pop()!.split(".")[0]
            const decodedName = decodeURIComponent(imgName)
            const newImgName = decodedName.split(".")[0]
        audioChoices[correctAudio].src = `${vocabAudioPath}${story.vocabAudio[newImgName]}`
        audioRadio[correctAudio].value = newImgName // add value to radio button
        audioChoices[correctAudio].load()
        const audioIndex: number =  wrongAnswers.indexOf(newImgName)
        removeItem(wrongAnswers, audioIndex)
    console.log("After removal", wrongAnswers)
        audioChoices.forEach((audio: HTMLAudioElement, index: number) => {
            if (index === correctAudio) return

            const randomAudio = Math.floor(Math.random() * wrongAnswers.length)
            audioRadio[index].value = wrongAnswers[randomAudio]
            audio.src = `${vocabAudioPath}${story.vocabAudio[wrongAnswers[randomAudio]]}`
            audio.load()
        })

        return correctAudio
    } else {
        const audioName: string = audioQuestion.src.split("/").pop()!
            const decodedName = decodeURIComponent(audioName)
            const newAudioName = decodedName.split(".")[0]
        console.log(newAudioName)
        picChoices[correctPic].src = `${imgPath1}${story.images[newAudioName]}`
        picRadio[correctPic].value = newAudioName // add value to radio button
        const imgIndex: number =  wrongAnswers.indexOf(newAudioName)
        removeItem(wrongAnswers, imgIndex)
        console.log("After removal", wrongAnswers)
        picChoices.forEach((img: HTMLImageElement, index: number) => {
            if (index === correctPic) return

            const randomPic = Math.floor(Math.random() * wrongAnswers.length)
            picRadio[index].value = wrongAnswers[randomPic]
            img.src = `${imgPath1}${story.images[wrongAnswers[randomPic]]}`
        })

        return correctPic
    }
}

// shared variables
const storyCoreVocab: string[] = [...story.coreConcepts]
let currentQuestionIndex: number = -1
let currentTestType: number = -1
let correctAnsIndex: number = -1

// 7. construct tests
function reviewTest(testArr: string[]): void {
     if (testArr.length === 0) {
        console.log("All questions completed")
        return
    }

    resetRadios()

    currentQuestionIndex = randomIndex(testArr.length)

    currentTestType = loadQuestion(testArr, currentQuestionIndex)

    correctAnsIndex = randomAnswer(currentTestType)
}

// helper function for tests
function resetRadios(): void {
    const radios = document.querySelectorAll<HTMLInputElement>(".review-answers input[type='radio']")
    radios.forEach(radio => {
        radio.checked = false
    })
}

// 6. wire submit button
const reviewForm: HTMLFormElement = document.querySelector<HTMLFormElement>(".review-answers")!

function submit(): void {
    reviewForm.addEventListener("submit", (event) => {
        event.preventDefault()

        const reviewInputs = document.querySelectorAll<HTMLInputElement>(".review-answers input")
        const correctAnswer = reviewInputs[correctAnsIndex].value

        const groupName = reviewInputs[correctAnsIndex].name
        const userChoice = document.querySelector<HTMLInputElement>(`input[name="${groupName}"]:checked`)

        if (!userChoice) {
            console.log("No option selected")
            return
        }

        const userAnswer = userChoice.value

        if (userAnswer === correctAnswer) {
            console.log(`User chose the correct answer (${correctAnswer})`)
        } else {
            console.log(`User chose the wrong answer (${userAnswer}). It should be ${correctAnswer}`)
        }

        removeItem(storyCoreVocab, currentQuestionIndex)

        if (storyCoreVocab.length === 0) {
            console.log("Test complete!")
            return
        }

        reviewTest(storyCoreVocab)
    })
}

submit()
reviewTest(storyCoreVocab)

