let ignoredUsers = [],
    channelName = "testchannel",
    provider = "twitch",
    animationIn = "fadeInRight",
    animationOut = "bounceOut",
    smallDelay = 20,
    badgesEnable = "yes",
    bubbleXOffset = -6,
    bubbleYOffset = 6,
    emoteQuality = 2,
    tiltAngle = 3,
    tiltAngleRange = 0,
    colorValueClip = 80,
    messageFontDarkening = 30,
    saturationMultiplier = 1,
    smoothScrolling = "yes",
    scrollSpeedMultiplier = 1,
    animateTilt = "no";


let current_username_bias = "left";
const lorem_ipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."

window.addEventListener("onWidgetLoad", function (obj) {
   const fieldData = obj.detail.fieldData;
   animationIn = fieldData.animationIn;
   badgesEnable = fieldData.badgesEnable;
   bubbleXOffset = fieldData.bubbleXOffset;
   bubbleYOffset = fieldData.bubbleYOffset;
   switch (fieldData.emoteQuality) {
     case "low":
       emoteQuality = 1;
       break;
     case "med":
       emoteQuality = 2;
       break;
     case "high":
       emoteQuality = 4;
       break;
     default:
       emoteQuality = 2;
   }
   tiltAngle = fieldData.tiltAngle;
   tiltAngleRange = fieldData.tiltAngleRange;
   colorValueClip = fieldData.colorValueClip;
   messageFontDarkening = fieldData.messageFontDarkening;
   saturationMultiplier = fieldData.saturationMultiplier;
   smoothScrolling = fieldData.smoothScrolling;
   scrollSpeedMultiplier = fieldData.scrollSpeedMultiplier;
   if (scrollSpeedMultiplier <= 0.1) scrollSpeedMultiplier = 0.1;
   animateTilt = fieldData.animateTilt;
   channelName = obj.detail.channel.username;
   ignoredUsers = fieldData.ignoredUsers.toLowerCase().replace(" ", "").split(",");
});

function html_encode(e) { // sanitizes user input
    return e.replace(/[<>"^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}

function send_test_message() {
    let lorem_ipsum_arr = lorem_ipsum.split(" ");
    let out_length = Math.floor(Math.random() * lorem_ipsum_arr.length);
    if (out_length === 0) out_length = 1;
    let message_text = lorem_ipsum_arr.slice(0, out_length).join(" ");
    let test_color = new Color("hsl", [Math.random() * 360, Math.random() * 100, Math.random() * 100]);
    let emulated = new CustomEvent("onEventReceived", {
        detail: {
            listener: "message", event: {
                service: "twitch",
                data: {
                    time: Date.now(),
                    tags: {
                        "badge-info": "",
                        badges: "moderator/1,partner/1",
                        color: test_color.toString(),
                        "display-name": "testUser",
                        emotes: "25:46-50",
                        flags: "",
                        id: "43285909-412c-4eee-b80d-89f72ba53142",
                        mod: "1",
                        "room-id": "85827806",
                        subscriber: "0",
                        "tmi-sent-ts": "1579444549265",
                        turbo: "0",
                        "user-id": "100135110",
                        "user-type": "mod"
                    },
                    nick: "StreamElements",
                    userId: "100135110",
                    displayName: "testUser",
                    displayColor: test_color.toString(),
                    badges: [{
                        type: "moderator",
                        version: "1",
                        url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
                        description: "Moderator"
                    }, {
                        type: "partner",
                        version: "1",
                        url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3",
                        description: "Verified"
                    }],
                    channel: "test",
                    text: message_text,
                    isAction: !1,
                    emotes: [{
                        type: "twitch",
                        name: "Kappa",
                        id: "25",
                        gif: !1,
                        urls: {
                            1: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                            2: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                            4: "https://static-cdn.jtvnw.net/emoticons/v1/25/3.0"
                        },
                        start: 46,
                        end: 50
                    }],
                    msgId: "43285909-412c-4eee-b80d-89f72ba53142"
                },
                renderedText: 'Howdy! My name is Bill and I am here to serve <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 1x, https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 2x, https://static-cdn.jtvnw.net/emoticons/v1/25/3.0 4x" title="Kappa" class="emote">'
            }
        }
    });
    window.dispatchEvent(emulated);
}

function makeDiv(className) {
    let _elem = document.createElement("div");
    _elem.className = className;
    return _elem;
}

function formatMessage(message) {
    let text = message.text;
    let data = message.emotes;

    text = html_encode(text); // turn any nasty stuff into HTML escape chars...
    let emote_buffer = "";
    if (data.length > 0) { // if there are emotes in the message...
        for (let i=0; i < data.length; i++) {
            let emote = data[i];
            emote_buffer += emote.name
        }
    }

    let emote_class = text.length === emote_buffer.length + data.length - 1 ? "large-emote" : "emote";

    if (data.length > 0) { // if there are emotes in the message...
        for (let i=0; i < data.length; i++) {
            let emote = data[i];
            let img = `<img class=${emote_class} src=${emote.urls[emoteQuality]}>`;
            text = text.replace(emote.name, img);
        }
    }
    return text;
}

class UserMessage {
    container;
    anim_container;
    both_container;
    username_container;
    username_box;
    message_container;
    message_box;
    username_spacer;
    inner_spacer;
    outer_spacer;
    user_color;
    msg_color;
    constructor(data, direction) {
        this.container = makeDiv(`message-row {animationIn} animated`);
        this.container.setAttribute("data-sender", data.userId);
        this.container.setAttribute("data-msgid", data.msgId);
        this.anim_container = makeDiv("anim-container");
        this.both_container = makeDiv("both-container");
        this.username_container = makeDiv("username-container");
        this.username_box = makeDiv("username-box");
        this.message_container = makeDiv("message-container");
        this.message_box = makeDiv("message-box");
        this.username_spacer = makeDiv("inner-spacer");
        this.inner_spacer = makeDiv("inner-spacer");
        this.outer_spacer = makeDiv("outer-spacer");

        let username = document.createElement("span");
        username.innerText = data.displayName;
        this.username_box.appendChild(username);
        this.message_box.innerHTML = formatMessage(data);

        if (direction === "right") {
            this.anim_container.appendChild(this.inner_spacer);
            this.anim_container.appendChild(this.both_container);
            this.anim_container.appendChild(this.outer_spacer);
            this.username_container.appendChild(this.username_spacer);
        } else {
            this.anim_container.appendChild(this.outer_spacer);
            this.anim_container.appendChild(this.both_container);
            this.anim_container.appendChild(this.inner_spacer);
        }
        this.both_container.appendChild(this.username_container);
        this.both_container.appendChild(this.message_container);
        this.username_container.appendChild(this.username_box);
        this.message_container.appendChild(this.message_box);

        this.container.appendChild(this.anim_container);
		
      	this.user_color = new Color("hsl", [Math.random() * 360, Math.random() * 100, Math.random() * 100]);
        if (data.displayColor !== "") {
          this.user_color = new Color(data.displayColor);
        }
        this.user_color.hsl.s *= saturationMultiplier;
        if (this.user_color.hsl.s > 100) this.user_color.hsl.s = 100;
        if (this.user_color.hsl.l > colorValueClip) {
            this.user_color.hsl.l = colorValueClip;
        }
        this.msg_color = new Color(this.user_color);
        this.msg_color.hsl.l *= (messageFontDarkening / 100);

        this.username_box.style.backgroundColor = this.user_color.toString();
        this.username_box.style.textShadow = `-2px 2px 0px ${this.msg_color.toString()}`;
        this.message_box.style.color = this.msg_color.toString();

        let message_container = this.message_container;
        let message_box = this.message_box;
        let both_container = this.both_container;
        let outer_spacer = this.outer_spacer;
        let anim_container = this.anim_container;
    }
    post_update(data, direction) {
        let list_container = document.getElementsByClassName("main-container")[0];
        const outer_rect = list_container.getBoundingClientRect();
        let rect = this.message_box.getBoundingClientRect();
        let perc = rect.width / outer_rect.width;
        if (perc < 0.7) {
          perc = 0.7 - perc;
          this.outer_spacer.style.flex = `${perc} 1 auto`;
        }

        let shadow_elem = makeDiv("message-shadow");
        shadow_elem.style.width = `${rect.width}px`;
        shadow_elem.style.height = `${rect.height}px`;
        shadow_elem.style.transform = `translate({bubbleXOffset}px, ${bubbleYOffset - 16}px)`;
        shadow_elem.style.backgroundColor = this.user_color.toString();

        this.message_container.appendChild(shadow_elem);

        let xy_arr = [];
        if (direction === "left") {
          xy_arr = [ // position of all the bubbles :)
            [rect.width * 0.4, 16],
            [8, rect.height * 0.6],
            [rect.width + 8, rect.height * 0.6],
            [rect.width - 35, rect.height + 4],
            [rect.width - 66, rect.height - 4],
            [rect.width - 58, rect.height + 18],
            [rect.width - 42, rect.height + 26]
          ];
        } else {
          xy_arr = [
            [rect.width * 0.6, 16],
            [rect.width + 8, rect.height * 0.6],
            [12 + 4, rect.height * 0.6],
            [35 + 8, rect.height + 4],
            [66 + 8, rect.height - 4],
            [58 + 8, rect.height + 18],
            [42 + 8, rect.height + 26]
          ];
        }
        const size_arr = [44, 20, 28, 30, 26, 16, 10];

        if (data.nick !== channelName) {
          for (let i = 0; i < xy_arr.length; i++) { // background bubbles
            let x_off = Math.floor(xy_arr[i][0] - (size_arr[i] / 2));
            let y_off = Math.floor(xy_arr[i][1] - (size_arr[i] / 2)) - 16; // the -16 is to match the CSS offset
            x_off += bubbleXOffset;
            y_off += bubbleYOffset;

            let test = document.createElement("div");
            test.className = "bubble";
            test.style.backgroundColor = this.user_color;
            test.style.transform = `translate(${x_off}px, ${y_off}px)`;
            test.style.width = `${size_arr[i]}px`;
            test.style.height = `${size_arr[i]}px`;

            this.message_container.appendChild(test);
          }
        }

        if (data.nick !== channelName) {
          for (let i = 0; i < xy_arr.length; i++) { // foreground bubbles
            let x_off = Math.floor(xy_arr[i][0] - (size_arr[i] / 2));
            let y_off = Math.floor(xy_arr[i][1] - (size_arr[i] / 2)) - 16;

            let test = document.createElement("div");
            test.className = "bubble";
            test.style.transform = `translate(${x_off}px, ${y_off}px)`;
            test.style.width = `${size_arr[i]}px`;
            test.style.height = `${size_arr[i]}px`;

            this.message_container.appendChild(test);
          }
        }

        let tilt = tiltAngle + ((Math.random() * tiltAngleRange) - (tiltAngleRange / 2));
        this.both_container.style.transform = direction === "left" ? `rotate(${tilt * -1}deg)` : `rotate(${tilt * 1}deg)`;
    }
    get elem() {
        return this.container;
    }
}

function is_message(_inp) {
    if (_inp.detail.listener !== "message") return false;
    if (ignoredUsers.indexOf(_inp.detail.event.data.nick) !== -1) return false;
    return true;
}

function count_messages() {
    let counter = 0;
  	for (let i=0; i < event_list.length; i++) {
        if (is_message(event_list[i])) counter += 1;
    }
    return counter;
}

let event_list = [];
let msg_counter = 0;

window.addEventListener('onEventReceived', function(stream_event){
    //console.log(stream_event);
    if (stream_event.detail.event.listener === "widget-button") {
        if (stream_event.detail.event.field === "testMessage") {
            send_test_message();
            return;
        }
    }
  
    if (ignoredUsers.indexOf(stream_event.detail.event.nick) !== -1) return;
    if (is_message(stream_event)) {
        msg_counter++;
    }
    event_list.push(stream_event);
  
    //console.log("event?");
    if (stream_event.detail.listener === "delete-message") {
        const msgId = stream_event.detail.event.msgId;
        let bad_msg = $(`.message-row[data-msgid=${msgId}]`);
        height += bad_msg.getBoundingClientRect().height;
        bad_msg.remove();
        return;
    } else if (stream_event.detail.listener === "delete-messages") {
        const sender = stream_event.detail.event.userId;
        let bad_list = $(`.message-row[data-sender=${sender}]`);
        for (let i=0; i < bad_list.length; i++) {
            let bad_msg = bad_list[i];
            height += bad_msg.getBoundingClientRect().height;
            bad_msg.remove();
        }
        return;
    }
});

let avg_list = [];
let msg_avg = 0;
function msg_average() {
    avg_list.push(msg_counter);
    msg_counter = 0;
    if (avg_list.length > 12) {
      	avg_list.shift();
    }
    msg_avg = 0;
    for (let i=0; i < avg_list.length; i++) {
        msg_avg += avg_list[i];
    }
    msg_avg /= avg_list.length;
    msg_avg *= 4;
}

setInterval(msg_average, 250);

console.log(document.getElementsByClassName("main-spacer")[0].getBoundingClientRect());
console.log(document.getElementsByClassName("main-container")[0].getBoundingClientRect());
let main_container = document.getElementsByClassName("main-container")[0];
let main_spacer = document.getElementsByClassName("main-spacer")[0];
let height = main_container.getBoundingClientRect().height;
main_spacer.style.height = `${height}px`;


function process_loop() {
    //height = main_spacer.getBoundingClientRect().height;
    let trans_speed = 500;
    if (smoothScrolling !== "yes") trans_speed = 20;
    if (event_list.length > 0) {
        if (is_message(event_list[0])) {
            let num_messages = count_messages();
            let data = event_list.shift().detail.event.data;
            let message = new UserMessage(data, current_username_bias);
            let list_container = document.getElementsByClassName("main-container")[0];
            list_container.appendChild(message.elem);
            if (animateTilt === "yes") {
                message.both_container.style.transition = "all 800ms";
            }
            message.post_update(data, current_username_bias);
          
            let message_height = message.elem.getBoundingClientRect().height;
          
            if (smoothScrolling === "yes") {
          
            	let mult = message_height / (60 * scrollSpeedMultiplier);
                trans_speed *= mult;
                if (msg_avg < 0.75) msg_avg = 0.75;
                trans_speed /= msg_avg;
            }
          
            let ease_type = "ease";
            if (msg_avg > 5) ease_type = "linear";

            if (message_height > height) {
                let count = 24;
                while (message_height >= height) {
                    let _elem = main_container.children[1];
                    let elem_height = _elem.getBoundingClientRect().height;
                    main_container.removeChild(_elem);
                    height += elem_height;
                    count -= 1;
                    if (count <= 0) break;
                }
                main_spacer.style.transition = "none";
                main_spacer.style.minHeight = `${height}px`;
                console.log(main_spacer.clientHeight); // necessary
                height -= message_height;
                if (smoothScrolling === "yes") {
              	    main_spacer.style.transition = `all ${trans_speed}ms ${ease_type}`;
                }
                main_spacer.style.minHeight = `${height}px`;
            } else {
                height -= message_height;
                console.log(main_spacer.clientHeight); // necessary
                if (smoothScrolling === "yes") {
                    main_spacer.style.transition = `all ${trans_speed}ms ${ease_type}`;
                }
                main_spacer.style.minHeight = `${height}px`;
            }

            current_username_bias = current_username_bias === "left" ? "right" : "left";
        } else {
            let stream_event = event_list.shift();
            if (stream_event.detail.listener === "delete-message") {
                const msgId = stream_event.detail.event.msgId;
                let bad_msg = $(`.message-row[data-msgid=${msgId}]`);
                height += bad_msg.getBoundingClientRect().height;
                bad_msg.remove();
            } else if (stream_event.detail.listener === "delete-messages") {
                const sender = stream_event.detail.event.userId;
                let bad_list = $(`.message-row[data-sender=${sender}]`);
                for (let i=0; i < bad_list.length; i++) {
                    let bad_msg = bad_list[i];
                    height += bad_msg.getBoundingClientRect().height;
                    bad_msg.remove();
                }
            }
        }
    } else {
        trans_speed = 20;
    }
    setTimeout(process_loop, trans_speed);
}

setTimeout(process_loop, 500);
