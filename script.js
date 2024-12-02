let request = new XMLHttpRequest();
request.open("GET", "../conversation.json", false);
request.send(null);

let time = new Date().toLocaleString('en-US', { hour: 'numeric', minute:"numeric", hour12: true });

const conversation = JSON.parse(request.responseText);
const body = document.querySelector("#convo");


const updateText = (text) => {
   let filterText = text;

   // update to bold
   let boldFilter = text.match(/\*(?=[\w\-\.\(\)#]{0,})([\w\s/\-\.\(\)#]{0,})\*/g);
   if (boldFilter){
        for (const word in boldFilter){
            let updatedWord = `<strong>${boldFilter[word].replaceAll("*","")}</strong>`;
            filterText = filterText.replaceAll(boldFilter[word],updatedWord);
        }
   }

   let timeFilter = text.match(/\=(?=[\w\-\.\(\)#]{0,})([\w\s/\-\.\(\)#]{0,})\=/g);
   if (timeFilter){ 
        for (const word in timeFilter){
            let updatedWord = time;
            filterText = filterText.replaceAll(timeFilter[word],updatedWord);
        }
   }

   return filterText;
}; 

const createHTMLElement = (sender,message) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("messageGroup",sender);

    for (let m in message){
        const messageInsideElement = document.createElement("div");
        let messageDetails;
        let messageTagAndContents = [["p", message[m].m]]; 
        let messageAdditionalClass = "";

        if (message[m].type.indexOf("link") !== -1){
            messageAdditionalClass = message[m].type.indexOf("first") !== -1 ? "first" : "last";
            message[m].type = message[m].type.replace(messageAdditionalClass,"");
        }

        messageInsideElement.classList.add("message",message[m].type);
        messageAdditionalClass === "" || messageInsideElement.classList.add(messageAdditionalClass);

        switch (message[m].type){
            case "timedate":
                messageTagAndContents = [];
                for (let contents in message[m]){
                    if (contents != "type") {
                        messageTagAndContents.push(["span",message[m][contents]]);
                    }
                }
            break;
            case "link":
            break;
            case "pic":
                console.log(message[m].m);
                // messageTagAndContents = [["img",message[m].m]];
                // MAKE THIS WORK TOMORROW
            break;
            case "first":
            case "last":
            break;
        }

        for (let message in messageTagAndContents){
            let messageTag = messageTagAndContents[message][0];
            let messageContents = messageTagAndContents[message][1];
        
            messageDetails = document.createElement(messageTag);
            messageDetails.innerHTML = messageContents;     
            messageInsideElement.appendChild(messageDetails);
        }

        messageElement.appendChild(messageInsideElement);
    }
    
    body.appendChild(messageElement);

}

// Get the conversation
for (const sender in conversation){
    const convo = conversation[sender];
    const filterSender = sender.replace(/\d/g,"");
    let messageContents = [];
    for (const messageBlock in convo){
        const message = convo[messageBlock];
        for (let messageLines in message){
            // console.log(messageLines);
            if (messageLines != "type" && messageLines != "link"){
                message[messageLines] = updateText(message[messageLines]);
            } 
        }
        messageContents.push(message);
    }
    createHTMLElement(filterSender,messageContents);
}


