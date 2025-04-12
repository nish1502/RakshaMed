//Accessing Elements
let save_btn = document.getElementById('save-mood-btn')
let btns = Array.from(document.querySelectorAll('.mood-btns'))
let moods = document.getElementById('moods');
let calendar = document.getElementById('calendar-box')
let view = document.getElementById('view');
let show = document.getElementById('show');

let mood = null;
btns.forEach((btn)=>{
    btn.addEventListener("click",(key)=>{
        mood = key.target.innerText;
    })
})

//Function to log mood
function logMood(){
    if(mood != null){
        let calval = calendar.value;
        calval = calval.split("-").reverse().join("-");
        let p = document.createElement('p');
        p.textContent = `${calval} ${mood}`
        moods.appendChild(p)
        localStorage.setItem(`${calval}`, `${mood}`);
        mood = null;
    }else{
        console.log("No Mood Selected & Date Selected")
    }    
}
save_btn.addEventListener("click", logMood)

//Function to show logs
function showLogs(){
    for(let i = 0 ; i < frequency ; i++){
        const keys = Object.keys(localStorage)
        const values = Object.values(localStorage)
        const sortedKeys = keys.sort()
        const sortedValues = values.sort()
        if(keys[i] != null){
            let p = document.createElement('p')
            p.textContent = `${sortedKeys[i]} ${sortedValues[i]}`
            moods.appendChild(p)
        }
    }
}
show.addEventListener("click", ()=>{

    moods.innerHTML = '';

    if(view.value == 'Week'){
        frequency = 7;
        showLogs();
    }else if(view.value == 'Month'){
        frequency = 31;
        showLogs();
    }else{
        frequency = localStorage.length;
        showLogs();
    }

})