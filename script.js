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

    let emojiInsideTextFilter = filterText.match(/#([A-Za-z.\/]+)#/g);
    if (emojiInsideTextFilter){
         for (const word in emojiInsideTextFilter){
             let updatedWord = `<img class="emoji" src="${emojiInsideTextFilter[word].replaceAll("#","")}"/>`;
             filterText = filterText.replaceAll(emojiInsideTextFilter[word],updatedWord);
         }
    }

    let iconImageFilter = filterText.match(/#(?=[\w\-\.\(\)#]{0,})([\w\s/\-\.\(\)#]{0,})#/g);
    if (iconImageFilter){
         for (const word in iconImageFilter){
             let updatedWord = `<img src="${iconImageFilter[word].replaceAll("#","")}"/>`;
             filterText = filterText.replaceAll(iconImageFilter[word],updatedWord);
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
            messageAdditionalClass = currentMessage.type.indexOf("last") !== -1 ? "last" : "first";
            currentMessage.type = currentMessage.type.replace(messageAdditionalClass,"");
        }

        messageInsideElement.classList.add("message",currentMessage.type);
        messageAdditionalClass === "" || messageInsideElement.classList.add(messageAdditionalClass);

        switch (currentMessage.type){
            case "timedate":
                for (let contents in currentMessage){
                    if (contents != "type") {
                        messageTagAndContents.push(["span",updateText(currentMessage[contents])]);
                    }
                }
            break;
            case "link":
                // currentMessage["pic"] !== undefined && messageTagAndContents.push(["img",currentMessage["pic"]]);  
                messageTagAndContents.push(["a",updateText(currentMessage.m)]);
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
                messageTagAndContents = [["p",updateText(currentMessage.m)]]; 
            break;
        }

        for (let message in messageTagAndContents){
            let messageTag = messageTagAndContents[message][0];
            let messageContents = messageTagAndContents[message][1];
        
            messageDetails = document.createElement(messageTag);
            if (currentMessage.type == "pic" || currentMessage.type == "emoji"){
                messageDetails.setAttribute("src",messageContents);
                messageDetails.classList.add(currentMessage.type);

                if (currentMessage.link){
                    let newElementPic = document.createElement("a");
                    newElementPic.setAttribute("href",currentMessage.link);
                    newElementPic.setAttribute("target","_blank");        
                    newElementPic.appendChild(messageDetails);

                    if (currentMessage.linkTitle){            
                        let newElementText = document.createElement("span");
                        newElementText.classList.add("label");
                        newElementText.innerHTML = currentMessage.linkTitle;
                        newElementPic.appendChild(newElementText);
                    }
                    
                    messageDetails = newElementPic;


                }
            } else {
                if (currentMessage.type == "link"){
                    messageDetails.setAttribute("href",currentMessage.link);
                    messageDetails.setAttribute("target","_blank");               
                }
                
                messageDetails.innerHTML += messageContents;     
            }
            messageInsideElement.appendChild(messageDetails);
        }
        
        if (currentMessage.status !== undefined) {
            let statusSpan = document.createElement("span");
            statusSpan.classList.add("status");
            statusSpan.innerHTML = currentMessage.status;
            messageInsideElement.appendChild(statusSpan);
        }

        currentMessage.type !== "emoji" && messageInsideElement.setAttribute("tabindex","1");
        
        currentMessage.title && messageElement.setAttribute("id",currentMessage.title.replaceAll(/<((\/[A-Za-z])|([A-Za-z]))*>/g,"").replaceAll(" ","_").toLowerCase());
        
        if (currentMessage.type == "pic" && currentMessage.link){        
            messageInsideElement.classList.add("link");
        }

        messageElement.appendChild(messageInsideElement);
 
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
                    let filterType;

                    if (messageLines == "linkTitle") {
                        filterType = messageLines;
                    } else {                    
                        filterType = message["pic"] && messageLines == "pic" ? "pic" : message["type"];
                    }
                    
                    message[messageLines] = updateText(message[messageLines],filterType);
                } 
            }
            messageContents.push(message);
        }
        createHTMLElement(filterSender,messageContents);
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

const updateSignalSrc = () => {
    const signalElement = document.getElementById("signal");
    const internetSpeed = navigator.connection.downlink;
    let signalSrc;

    if (internetSpeed >= 1){
        if (internetSpeed >= 8){
            signalSrc = "signal.svg";
        } else if (internetSpeed >= 4){
            signalSrc = "signal-good.svg";
        } else if (internetSpeed >= 1){
            signalSrc = "signal-bad.svg";
        }    
    }
    else {
        // body.innerHTML = "";
        signalSrc = "no-signal.svg";
    }  

    signalElement.setAttribute("src",`files/icons/${signalSrc}`);

    setTimeout(updateSignalSrc, 3000);
}

updateSignalSrc();

const editButton = document.getElementById("videocall");
const editModal = document.getElementById("convoGenerator");

const openEdit = () => {
    editModal.style.display = editModal.style.display == "none" ? "flex" : "none";
}

const closeEdit = (e) => {
    console.log(e);
    e.target.classList.contains("modal") && (e.target.style.display = "none");
}

editButton.addEventListener("dblclick",openEdit);
editModal.addEventListener("click",closeEdit);