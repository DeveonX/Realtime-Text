const socket = io();

function send_message(){
    let text = document.getElementById('textbox').value;
    if(text!=''){
    socket.emit('message-send', {name: name, text: text});
    document.getElementById('textbox').value = "";
    }
}

socket.on('message-recieve', (dataObject)=>{
    document.getElementById('chatapp').innerHTML += `
    <div class="chat-item">
        <div class="name">
            ${dataObject.name}
        </div>
        <div class="text">
        ${dataObject.text}
        </div>
    </div>
    `
})

socket.on('remove-all-data', ()=>{
    document.getElementById('chatapp').innerHTML = '';
})