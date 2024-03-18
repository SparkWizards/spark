const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const chatwith = getById("chatwith");
const personSpan = getById("person");
const clearChat = getById("clear_chat_hist");
const refreshChat = getById("refresh_chat_history");


const PERSON_EMAILS = ["Krishiv", "Parav", "Shaurya"];
const chatReadUrl = "http://localhost:8098/chat/read";
const chatHistUrl = "http://localhost:8098/chat/history";
const chatClearUrl = "http://localhost:8098/chat/history/clear"
const chatPostUrl = "http://localhost:8098/chat/create";


// Icons made by Freepik from www.flaticon.com
const PERSON_IMG = "assets/images/person-244.svg";
const BOT_NAME = "BOT";
let PERSON_EMAIL = "";
let FROM_EMAIL = "";

let intervalId = "";

function stopCheckingMessages(){
	clearInterval(intervalId);
}

async function readNextMessage(){
	console.log("email: " + PERSON_EMAIL);
	console.log("fromEmail: " + FROM_EMAIL);
	let url = chatReadUrl + "?email=" + PERSON_EMAIL + "&fromEmail=" + FROM_EMAIL;
	const messages = await getData(url);
	console.log(messages);

	const messagesJSON = JSON.parse(messages);

	console.log(messagesJSON);
	for (var i = 0; i < messagesJSON.length; i++) {
		const messageTemp = messagesJSON[i];
		const aMessage = messageTemp.message;
		const sender = messageTemp.fromEmail;
		if (sender == FROM_EMAIL) {
			appendMessage(sender, PERSON_IMG, "left", aMessage, "read");
		} else {
			appendMessage(sender, PERSON_IMG, "right", aMessage, "sent");
		}
	}
}

// invoked by refresh button and also when user select a person to chat with
async function readMessages() {
	console.log("email: " + PERSON_EMAIL);
	msgerChat.innerHTML="";
	FROM_EMAIL = chatwith.value;
	console.log("fromEmail: " + FROM_EMAIL);
	let url = chatHistUrl + "?email=" + PERSON_EMAIL + "&fromEmail=" + FROM_EMAIL;
	const messages = await getData(url);
	console.log(messages);

	const messagesJSON = JSON.parse(messages);

	console.log(messagesJSON);
	for (var i = 0; i < messagesJSON.length; i++) {
		const messageTemp = messagesJSON[i];
		const aMessage = messageTemp.message;
		const sender = messageTemp.fromEmail;
		if (sender == FROM_EMAIL) {
			appendMessage(sender, PERSON_IMG, "left", aMessage, "read");
		} else {
			appendMessage(sender, PERSON_IMG, "right", aMessage, "sent");
		}
	}

	intervalId = setInterval(function() {
		readNextMessage()
	  }, 1000);
}
function setChatWith(person) {
	msgerChat.innerHTML="";
	PERSON_EMAIL = person;
	chatwith.innerHTML = "";

	var optEmpty = document.createElement('option');
	optEmpty.value = "";
	optEmpty.innerHTML = "Select...";
	chatwith.appendChild(optEmpty);
	var optAll = document.createElement('option');
	optAll.value = "All";
	optAll.innerHTML = "All";
	chatwith.appendChild(optAll);


	for (var i = 0; i < PERSON_EMAILS.length; i++) {
		if (person != PERSON_EMAILS[i]) {
			var opt = document.createElement('option');
			opt.value = PERSON_EMAILS[i];
			opt.innerHTML = PERSON_EMAILS[i];
			chatwith.appendChild(opt);
		}
	}

	personSpan.innerHTML = PERSON_EMAIL;

}

clearChat.addEventListener("click", async (event) => {
	let url = chatClearUrl + "?email="+PERSON_EMAIL+"&fromEmail="+FROM_EMAIL;
	event.preventDefault();
	await deleteData(url);
	msgerChat.innerHTML = "";
});

refreshChat.addEventListener("click", async (event) => {
	readMessages();
});

msgerForm.addEventListener("submit", event => {
	event.preventDefault();
	const msgText = msgerInput.value;
	
	if (FROM_EMAIL == "" || PERSON_EMAIL == ""){
		return false;
	}
	
	if (!msgText) return;

	appendMessage(PERSON_EMAIL, PERSON_IMG, "right", msgText, "sent");
	msgerInput.value = "";

	botResponse(msgText);
});

function appendMessage(name, img, side, text, status) {
	//   Simple solution for small apps
	const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
		<div class="msg-status">${status}</div>
      </div>
    </div>
  `;

	msgerChat.insertAdjacentHTML("beforeend", msgHTML);
	msgerChat.scrollTop += 500;
}

function botResponse(msgText) {
	//?email=Shaurya&fromEmail=Parav&personId=0&fromPersonId=1&message=Hello World
	let reqUrl = chatPostUrl + "?email=" +FROM_EMAIL+ "&fromEmail=" +PERSON_EMAIL+ "&personId=0&fromPersonId=1&message="+msgText;
	//postData(url, {  "model": "llama2",  prompt}).then((data) => {
	postData(reqUrl).then((data) => {	
		console.log(data);
		/*const lines = data.split('\n');
		var chatReponse = "";
		var chatDone = false;
		
		for (var i = 0; i < lines.length; i++) {
			const jsonLine =JSON.parse(lines[i]);
			let responseLine = jsonLine.response;
			responseLine = responseLine.replace(/(?:\r\n|\r|\n)/g, '<br>');;
			chatReponse += responseLine;
			chatDone = jsonLine.done;
			
			if (chatDone)
				break;
		}
		
		console.log(chatReponse);
		*/
		//appendMessage(PERSON_EMAIL, PERSON_IMG, "left", data);
	});
	
}

// Utils
function get(selector, root = document) {
	return root.querySelector(selector);
}

function getById(selector, root = document) {
	return root.getElementById(selector);
}

function formatDate(date) {
	const h = "0" + date.getHours();
	const m = "0" + date.getMinutes();

	return `${h.slice(-2)}:${m.slice(-2)}`;
}


async function postData(url = "", data = {}) {
	// Default options are marked with *
	const response = await fetch(url, {
		method: "POST", // *GET, POST, PUT, DELETE, etc.
		mode: "cors", // no-cors, *cors, same-origin
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		credentials: "same-origin", // include, *same-origin, omit
		headers: {
			"Content-Type": "application/json",
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: "follow", // manual, *follow, error
		referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data), // body data type must match "Content-Type" header
	}).then(function(response) {
		// The response is a Response instance.
		// You parse the data into a useable format using `.json()`
		return response.text();
	}).then(function(data) {
		// `data` is the parsed version of the JSON returned from the above endpoint.
		return data;
	});

	return response; // parses JSON response into native JavaScript objects
}

async function getData(url = "") {
	// Default options are marked with *

	const response = await fetch(url, {
		method: "GET", // *GET, POST, PUT, DELETE, etc.
		mode: "cors", // no-cors, *cors, same-origin
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		credentials: "same-origin", // include, *same-origin, omit
		headers: {
			"Content-Type": "application/json",
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: "follow", // manual, *follow, error
		referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
	}).then(function(response) {
		// The response is a Response instance.
		// You parse the data into a useable format using `.json()`
		return response.text();
	}).then(function(data) {
		// `data` is the parsed version of the JSON returned from the above endpoint.
		return data;
	});
	return response; // parses JSON response into native JavaScript objects
}

async function deleteData(url = "") {
	// Default options are marked with *
	const response = await fetch(url, {
		method: "DELETE", // *GET, POST, PUT, DELETE, etc.
		mode: "cors", // no-cors, *cors, same-origin
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		credentials: "same-origin", // include, *same-origin, omit
		headers: {
			"Content-Type": "application/json",
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: "follow", // manual, *follow, error
		referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
	}).then(function(response) {
		// The response is a Response instance.
		// You parse the data into a useable format using `.json()`
		return response.text();
	}).then(function(data) {
		// `data` is the parsed version of the JSON returned from the above endpoint.
		return data;
	});

	return response; // parses JSON response into native JavaScript objects
}