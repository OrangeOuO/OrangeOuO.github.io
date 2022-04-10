export {LocalObject}

class LocalObject{
    constructor(key,initalValue={}){
        this.value=initalValue
        this.key=key
        if(localStorage[key])
            this.value = JSON.parse(localStorage[key]);
        
    }
    write(){
        localStorage[this.key] = JSON.stringify(this.value);
    }
    read(){
        this.value = JSON.parse(localStorage[key]);
    }
}