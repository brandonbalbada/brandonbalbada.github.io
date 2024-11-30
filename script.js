let request = new XMLHttpRequest();
request.open("GET", "../conversation.json", false);
request.send(null);

const conversation = JSON.parse(request.responseText);
const body = document.querySelector("#body");
// Get the conversation

const updateText = (text) => {
   let filterText = text;

   // update to bold
   let boldFilter = text.match(/\*(?=[\w\-\.\(\)#]{0,})([\w\s\-\.\(\)#]{0,})\*/g);
   if (boldFilter){
        for (const word in boldFilter){
            let updatedWord = `<strong>${boldFilter[word].replaceAll("*","")}</strong>`;
            filterText = filterText.replaceAll(boldFilter[word],updatedWord);
        }
   }
   console.log(filterText);

   let emojiFilter = text.match(/\[(?=[\w\-\.\(\)#]{0,})([\w\s\-\.\(\)#]{0,})\]/g);
   if (emojiFilter){
        console.log(emojiFilter);
   }

   return filterText;
}; 


for (const convo in conversation){
    const sender = conversation[convo];
    for (const messageBlock in sender ){
        const message = sender[messageBlock];
        
        switch(message.type){
            case "timedate":
                console.log(updateText(message.title));
                console.log(updateText(message.subtitle)); 
                break;
            default:
                console.log(updateText(message.m));
                break;
        }
    }
}

