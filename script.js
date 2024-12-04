let request = new XMLHttpRequest();
request.open("GET", "../conversation.json", false);
request.send(null);

let time = new Date().toLocaleString('en-US', { hour: 'numeric', minute:"numeric", hour12: true });

const conversation = JSON.parse(request.responseText);
const body = document.querySelector("#convo");

const updateText = (text, type = "") => {
   let filterText = text;

   // update to bold
   let boldFilter = text.match(/\*(?=[\w\-\.\(\)#]{0,})([\w\s/\-\.\(\)#]{0,})\*/g);
   if (boldFilter){
        for (const word in boldFilter){
            let updatedWord = `<strong>${boldFilter[word].replaceAll("*","")}</strong>`;
            filterText = filterText.replaceAll(boldFilter[word],updatedWord);
        }
   }

   let emojiFilter = text.match(/\[(?=[\w\-\.\(\)#]{0,})([\w\s/\-\.\(\)#]{0,})\]/g);
   if (emojiFilter){ 
        for (const word in emojiFilter){
            const filetype = type == "pic" ? ["","jpg"] : ["icons","png"];
            let updatedWord = `files/${filetype[0]}/${emojiFilter[word].replaceAll(/\[|\]/g,"")}.${filetype[1]}`;
            filterText = filterText.replaceAll(emojiFilter[word],updatedWord);
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
        let currentMessage = message[m];
        let messageDetails;
        
        let messageTagAndContents = [["p",currentMessage.m]]; 
        let messageAdditionalClass = "";

        if (currentMessage.type.indexOf("link") !== -1){
            messageAdditionalClass = currentMessage.type.indexOf("first") !== -1 ? "first" : "last";
            currentMessage.type = currentMessage.type.replace(messageAdditionalClass,"");
        }

        messageInsideElement.classList.add("message",currentMessage.type);
        messageAdditionalClass === "" || messageInsideElement.classList.add(messageAdditionalClass);

        switch (currentMessage.type){
            case "timedate":
                messageTagAndContents = [];
                for (let contents in currentMessage){
                    if (contents != "type") {
                        messageTagAndContents.push(["span",currentMessage[contents]]);
                    }
                }
            break;
            case "link":
            break;
            case "pic":
            case "emoji":
                messageTagAndContents = [];
                let splitArray = currentMessage.m.split(" ");
                
                for (let contents in splitArray){
                    messageTagAndContents.push(["img",splitArray[contents]]);
                }
            break;
            case "first":
            case "last":
            break;
        }

        for (let message in messageTagAndContents){
            let messageTag = messageTagAndContents[message][0];
            let messageContents = messageTagAndContents[message][1];
        
            messageDetails = document.createElement(messageTag);
            if (currentMessage.type == "pic" || currentMessage.type == "emoji"){
                messageDetails.setAttribute("src",messageContents);
                messageDetails.classList.add(currentMessage.type);
            } else {
                //  && console.log(messageContents);
                messageDetails.innerHTML = messageContents;     
            }
            messageInsideElement.appendChild(messageDetails);
        }
        messageElement.appendChild(messageInsideElement);
        // clean regex for strong variable
        currentMessage.title !== undefined && messageElement.setAttribute("id",currentMessage.title.replace("<strong>","").replace("</strong>","").toLowerCase());
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
            if (messageLines != "type" && messageLines != "link"){
                message[messageLines] = updateText(message[messageLines],message["type"]);
            } 
        }
        messageContents.push(message);
    }
    createHTMLElement(filterSender,messageContents);
}

let firstTrigger = true;

const updateTime = () => {
    const timeElement = document.getElementById("headerTime");
    timeElement.innerHTML = new Date().toLocaleString('en-US', { hour: 'numeric', minute:"numeric", hour12: true });

    let second = new Date().getSeconds() * 1000;
    let secondUpdated = firstTrigger == true ? 60000 - second : 60000;

    firstTrigger = false;
    setTimeout(updateTime, secondUpdated);
}

updateTime();