export { Pinyin }

class Pinyin {
    constructor(){
        this.dict = {
            "a": ["ā", "á", "ǎ", "à"],
            "e": ["ē", "é", "ě", "è"],
            "i": ["ī", "í", "ǐ", "ì"],
            "o": ["ō", "ó", "ǒ", "ò"],
            "u": ["ū", "ú", "ǔ", "ù"],
            "v": ["ǖ", "ǘ", "ǚ", "ǜ"],
            "ü": ["ǖ", "ǘ", "ǚ", "ǜ"],
            "A": ["Ā", "Á", "Ǎ", "À"],
            "E": ["Ē", "É", "Ě", "È"],
            "I": ["Ī", "Í", "Ǐ", "Ì"],
            "O": ["Ō", "Ó", "Ǒ", "Ò"],
            "U": ["Ū", "Ú", "Ǔ", "Ù"],
            "V": ["Ǖ", "Ǘ", "Ǚ", "Ǜ"],
            "Ü": ["Ǖ", "Ǘ", "Ǚ", "Ǜ"],
            "ü": ["Ǖ", "Ǘ", "Ǚ", "Ǜ"]
        }
        this.readable="";
        this.pure="";
        this.tone=0;
        this.tonedChar=-1;
    }
    setTone(tone){
        this.tone=tone;
        this.fromReadable(this.toReadable());
    }
    fromReadable(readable){
        this.readable=readable;
        this.pure=""
        let readableSplited=readable.split('')
        for(let charIndex=0;charIndex<readableSplited.length;charIndex++){
            let char=readableSplited[charIndex];
            if(char.charCodeAt(0)<=128){
                this.pure+=char;
            }else{
                for(let key in this.dict){
                    if(this.dict[key].includes(char)){
                        this.pure+=key;
                        this.tone=this.dict[key].indexOf(char)+1;
                        this.tonedChar=charIndex;
                        break;
                    }
                }
            }
        }
        return true;
    }
    toReadable(){
        this.readable=this.pure;
        if(this.tonedChar!=-1)
        this.readable=this.pure.slice(0,this.tonedChar)+this.dict[this.pure[this.tonedChar]][this.tone-1]+this.pure.slice(this.tonedChar+1);
        return this.readable
    }
    mistaked(){
        let mistakeMakers={
            wrongTone(push){
                if(this.tone!=0){
                    for(let x=1;x<4;x++){
                        let newe=this.clone()
                        if(x!=this.tone){
                            newe.setTone(x)
                            push(newe);
                        }
                        
                    }
                }
            },wrongToneType(push){
                let map={
                    "zh":"z",
                    "ch":"c",
                    "sh":"s",
                    "z":"zh",
                    "c":"ch",
                    "s":"sh",
                    "l":"n"
                }
                for(let key in map){
                    let cl=this.clone()
                    if(cl.pure.startsWith(key)){
                        cl.pure=cl.pure.replace(key,map[key])
                        cl.tonedChar+=map[key].length-key.length
                        push(cl.clone())
                        return;
                    }
                }
            },wrongToneType2(push){
                let map={
                    "ng":"n"
                }
                for(let key in map){
                    let cl=this.clone()
                    if(cl.pure.endsWith(key)){
                        cl.pure=cl.pure.replace(key,map[key])
                        cl.tonedChar+=map[key].length-key.length
                        push(cl.clone())
                        return;
                    }
                }
            }
        }
        let mistakeList=[]
        for(let mMaker in mistakeMakers){
            mistakeMakers[mMaker].call(this,(mistake)=>mistakeList.push({mistaked:mistake,maker:mMaker}));
        }
        return mistakeList
    }
    clone(){
        let n=new Pinyin()
        n.fromReadable(this.toReadable())
        return n
    }
}