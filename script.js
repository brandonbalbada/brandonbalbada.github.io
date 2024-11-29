let request = new XMLHttpRequest();
request.open("GET", "../conversation.json", false);
request.send(null);

const conversation = JSON.parse(request.responseText);
const body = document.querySelector("#body");
// Get the conversation

const updateText = (text) => `EDITED: ${JSON.stringify(text)}`; 


for (const convo in conversation){
    let sender = conversation[convo];
    for (let messageBlock in sender ){
        let message = sender[messageBlock];
        
        switch(message.type){
            case "timedate":
                console.log(updateText(message.title));
                console.log(updateText(message.subtitle)); 
                break;
            default:
                console.log(message.m);
                break;
        }
    }
}

