const socket = io()
// Elements
const $msgForm = document.querySelector('form');
const $msgFormInput = $msgForm.querySelector('input');
const $msgFormButton = $msgForm.querySelector('button');
const $sendLocationBtn = document.getElementById('send-location');
const $messages = document.getElementById("messages");
const $sidebar = document.getElementById("sidebar");

// Template
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Option
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// autoscroll
const autoscroll = () => {
    // new message
    const $newMessage = $messages.lastElementChild;
    // height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    // visible height
    const visibleHeight = $messages.offsetHeight;
    // height of message container
    const containerHeight = $messages.scrollHeight;
    // how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = containerHeight;
    }
}

$msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if ($msgFormInput.value) {
        $msgFormButton.setAttribute('disabled', 'disabled');

        socket.emit("sendMessage", $msgFormInput.value, (error) =>{
            $msgFormButton.removeAttribute('disabled');
            $msgFormInput.value = '';
            $msgFormInput.focus();
            if (error) {
                return console.log(error);
            }
            console.log("Message was delivered!");
        });
    }
})

$sendLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser doesn\'t support geolocation');
    }
    $sendLocationBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {latitude: position.coords.latitude, longitude: position.coords.longitude}, () => {
            console.log("Location shared");
            $sendLocationBtn.removeAttribute('disabled');
        });
    })
})

socket.on("message", (message) => {
    // console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on("locationMessage", (location) => {
    // console.log(location);
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url:location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.emit("join", {username,room} , (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
});

socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
    // console.log(data.room);
    // console.log(data.users);
})