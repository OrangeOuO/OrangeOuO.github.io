import { Pinyin } from "/lib/pinyin.js"
import { LocalObject } from "/lib/localJSON.js"

!(async () => {
    let data = await (await fetch("data.json")).json()
    let queue = {
        get queue() {
            while (this._queue.value.length < 5) {
                let word = randIn(data)
                let pinyin = new Pinyin()
                pinyin.fromReadable(word.pron)
                queue._queue.value.push({
                    pinyin, word, mistakes: pinyin.mistaked().sort(() => Math.random() - 0.5).slice(0, 3).map((e) => { return { readable: e.mistaked.toReadable() } })
                })
                queue._queue.write()
            }
            return this._queue.value
        },
        _queue: new LocalObject("chinese_pinyin_queue", [])
    };
    let errorRecorder = new LocalObject("chinese_pinyin_error_recorder", {
        errors: [],
    })

    function randIn(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
    }

    let nowWord;
    function queueNext() {
        $(".choices div").text("")
        $(`.correct`).removeClass("correct")
        $(`.wrong`).removeClass("wrong")
        try {
            if (Math.random() < 0.3&&errorRecorder.value.errors.length!=0) {
                errorRecorder.value.errors=errorRecorder.value.errors.sort(() => Math.random() - 0.5)
                let qele=errorRecorder.value.errors.pop();
                errorRecorder.write()
                queue._queue.value.unshift(qele)
                console.log("Replay mistake:",qele)
                nowWord = queue.queue[0]
            }else {
                nowWord = queue.queue[0]
                nowWord.mistakes.push({ readable: nowWord.word.pron })
            }
            
            queue._queue.value.shift()
            queue._queue.write()

            $(".text").html(`${nowWord.word.text.slice(0, nowWord.word.highlight)}
        <span class="highlight">${nowWord.word.text[nowWord.word.highlight]}</span>
        ${nowWord.word.text.slice(nowWord.word.highlight + 1)}`)
            let sides = ["left", "right", "up", "down"]
            
            sides.sort(() => Math.random() - 0.5).forEach((side, i) => {
                if (nowWord.mistakes[i])
                    $(`.${side}`).text(nowWord.mistakes[i].readable)
            })
        } catch (e) { 
            // console.log(e)
            queueNext() }
    }
    function choose(side) {
        if ($(`.${side}`).text() == nowWord.word.pron) {
            $(`.${side}`).addClass("correct")
            $(".container").fadeOut(200)
            setTimeout(() => {
                queueNext()
                $(".container").fadeIn(100)
            }, 100)

        } else {
            $(`.${side}`).addClass("wrong")
            let cside = ""
            "left,up,right,down".split(',').forEach((s) => {
                if ($(`.${s}`).text() == nowWord.word.pron) {
                    $(`.${s}`).addClass("correct")
                    cside = s
                }
            })
            nowWord["time"]=new Date().getTime()
            errorRecorder.value.errors.push(nowWord)
            errorRecorder.write()
            setTimeout(() => {
                choose(cside)
            }, 2000)
        }
    }
    $(".choices").on("click", "div", function () {
        choose(this.classList[0])
    })
    queueNext()
    addEventListener("keyup", (e) => {
        choose(("left,up,right,down".split(','))[e.keyCode - 37])
    })
})()

/*
a=a.split(",")
a=a.filter((x)=>(-x.indexOf("[")+x.lastIndexOf("]"))==2)
a.reduce((p,c)=>{
    c=c.replace('(',"（").replace(")","）")
    let x=/\[(\S+)\]/.exec(c)
    let r=c.replace(/[\[,\]]/g,"").replace(/（\S+）/g,"")
    let py=/（(\S+)）/g.exec(c)[1]
    p.push({
        text:r,highlight:r.indexOf(x[1]),pron:py
    })
    return p
},[])
*/