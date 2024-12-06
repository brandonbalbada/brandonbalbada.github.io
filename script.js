let request = new XMLHttpRequest();
request.open("GET", "../conversation.json", false);
request.send(null);

let time = new Date().toLocaleString('en-US', { hour: 'numeric', minute:"numeric", hour12: true });

const conversation = JSON.parse(request.responseText);
const body = document.querySelector("#convo");

let finalConvo = [];
let currentConvoGroup = [];
let currentConvoGroupName = "";
let count = 1;

const convoCurrent = document.getElementById("currentConvoCreated");
const convoFinal = document.getElementById("convoCreated");
const convoType = document.getElementById("convoType");
const convoInputText = document.getElementById("convoInput");
const convoInputText2 = document.getElementById("convoInputAnother");

const convertToObject = (arr) => Object.assign({},arr);
const outputObject = (obj) => JSON.stringify(convertToObject(obj), null, 2);


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
    console.log(emojiFilter);
        for (const word in emojiFilter){
            const filetype = type == "pic" ? ["","jpg"] : ["icons/","png"];
            let updatedWord = `files/${filetype[0]}${emojiFilter[word].replaceAll(/\[|\]/g,"")}.${filetype[1]}`;
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
        let messageTagAndContents = [];
        let messageDetails;
        
        let messageAdditionalClass = "";

        if (currentMessage.type.indexOf("link") !== -1){
            messageAdditionalClass = currentMessage.type.indexOf("first") !== -1 ? "first" : "last";
            currentMessage.type = currentMessage.type.replace(messageAdditionalClass,"");
        }

        messageInsideElement.classList.add("message",currentMessage.type);
        messageAdditionalClass === "" || messageInsideElement.classList.add(messageAdditionalClass);

        switch (currentMessage.type){
            case "timedate":
                for (let contents in currentMessage){
                    if (contents != "type") {
                        messageTagAndContents.push(["span",currentMessage[contents]]);
                    }
                }
            break;
            case "link":
                let iconFilter = currentMessage.m.match(/#(?=[\w\-\.\(\)#]{0,})([\w\s/\-\.\(\)#]{0,})#/g);
                if (iconFilter){
                     for (const word in iconFilter){
                         let updatedWord = `<img src="${iconFilter[word].replaceAll("#","")}"/>`;
                         currentMessage.m = currentMessage.m.replaceAll(iconFilter[word],updatedWord);
                         messageTagAndContents.push(["a",currentMessage.m]);
                     }
                }
             
            break;
            case "pic":
            case "emoji":
                let splitArray = currentMessage.m.split(" ");
                
                for (let contents in splitArray){
                    messageTagAndContents.push(["img",splitArray[contents]]);
                }
            break;
            case "first":
            case "last":
            default:
                messageTagAndContents = [["p",currentMessage.m]]; 
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
                if (currentMessage.type == "link"){
                    messageDetails.setAttribute("href",currentMessage.link);
                    messageDetails.setAttribute("target","_blank");
                }
                //  && console.log(messageContents);
                messageDetails.innerHTML = messageContents;     
            }
            messageInsideElement.appendChild(messageDetails);
        }
        messageElement.appendChild(messageInsideElement);
        currentMessage.title !== undefined && messageElement.setAttribute("id",currentMessage.title.replaceAll(/<((\/[A-Za-z])|([A-Za-z]))*>/g,"").toLowerCase());
    }
    body.appendChild(messageElement);
    // create a condition inside first and last for emojis
}

const putHTMLElements = (conversation) => {
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
        console.log(count);
        count++;
    }
}

putHTMLElements(conversation);

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

// CONVO GENERATOR
function add(element){
    let convoInputTextValue = convoInputText.value;
    let convoInputTextValue2 = convoInputText2.value;
    let convoTypeValue = convoType.value;
    let convoClassName = element.currentTarget.classList.contains("me") ? "me" : "them";
    
    document.querySelectorAll(".add").forEach((element) => !(element.classList.contains(convoClassName)) ? element.setAttribute("disabled","true") : "" );

    let currentConvoGroupDetails = [];
    
    if (currentConvoGroupName == "") {
        currentConvoGroupName = convoClassName + count;
    }

    switch (convoTypeValue){
        case "timedate":       
            convoInputTextValue != null && (currentConvoGroupDetails["title"] = convoInputTextValue);
            currentConvoGroupDetails["subtitle"] = convoInputTextValue2;
        break;
        case "link":
            currentConvoGroupDetails["m"] = convoInputTextValue;
            currentConvoGroupDetails["link"] = convoInputTextValue2;
        break;
        case "pic":
        case "emoji":
        case "first":
        case "last":
        default:    
            currentConvoGroupDetails["m"] = convoInputTextValue;
        break;
    }

    currentConvoGroupDetails["type"] = convoTypeValue;
    currentConvoGroup.push(convertToObject(currentConvoGroupDetails));
    // reset value
    convoCurrent.innerHTML = outputObject(currentConvoGroup);
    convoInputText.value = "";
    convoInputText2.value = "";
    convoType.value = "first";
}

function end(element){
    if (element.currentTarget.classList.contains("end")){   
        finalConvo[currentConvoGroupName] = convertToObject(currentConvoGroup);
        convoFinal.innerHTML = outputObject(finalConvo);
        count++;
    }

    document.querySelectorAll(".add").forEach((element) => element.removeAttribute("disabled"));
    convoCurrent.innerHTML = "";
    currentConvoGroupName = "";
    currentConvoGroup = [];
}

document.querySelectorAll(".add").forEach((element) => element.addEventListener('click',add) );
document.querySelector(".end").addEventListener('click',end);
document.querySelector(".reset").addEventListener('click',end);

const copy = () => {
  navigator.clipboard.writeText(outputObject(finalConvo));
  alert("Copied");
}
document.querySelector("#copy").addEventListener("click",copy);

const preview = () => {
    body.innerHTML = "";
    putHTMLElements(finalConvo);
}
document.querySelector("#preview").addEventListener("click",preview);

