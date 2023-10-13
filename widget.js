 let totalMessages = 0,
    messagesLimit = 20,
    ignoredUsers = [],
    channelName = "testchannel",
    provider = "twitch",
    animationIn = "fadeInUp",
    animationOut = "bounceOut",
    smallDelay = 250,
    badgesEnable = "yes",
    bubbleXOffset = 0,
    bubbleYOffset = 0;

window.addEventListener("onWidgetLoad", function (obj) {
   const fieldData = obj.detail.fieldData;
   animationIn = fieldData.animationIn;
   badgesEnable = fieldData.badgesEnable;
   bubbleXOffset = fieldData.bubbleXOffset;
   bubbleYOffset = fieldData.bubbleYOffset;
   channelName = obj.detail.channel.username;
   ignoredUsers = fieldData.ignoredUsers.toLowerCase().replace(" ", "").split(",");
});

let current_username_bias = "left";

function send_test_message() {
    let emulated = new CustomEvent("onEventReceived", {
        detail: {
            listener: "message", event: {
                service: "twitch",
                data: {
                    time: Date.now(),
                    tags: {
                        "badge-info": "",
                        badges: "moderator/1,partner/1",
                        color: "#8822FF",
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
                    displayColor: "#8822FF",
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
                    text: "Howdy! My name is Bill and I am here to serve Kappa",
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


window.addEventListener('onEventReceived', function (stream_event) {
  
    if (stream_event.detail.event.listener === "widget-button") {
        if (stream_event.detail.event.field === "testMessage") {
            send_test_message();
            return;
        }
    }
  
    if (stream_event.detail.listener === "delete-message") {
        const msgId = stream_event.detail.event.msgId;
        $(`.message-row[data-msgid=${msgId}]`).remove();
        return;
    } else if (stream_event.detail.listener === "delete-messages") {
        const sender = stream_event.detail.event.userId;
        $(`.message-row[data-sender=${sender}]`).remove();
        return;
    } // not bothering to change these, they'll likely work fine...

    if (stream_event.detail.listener !== "message") return; // we only care about messages after this point

    let data = stream_event.detail.event.data;

    if (data.text.startsWith("!")) return; // if the message starts with "!", we don't care about it
    // unless you want to, in which case it's safe to comment this out

    if (ignoredUsers.indexOf(data.nick) !== -1) return;
    // so if none of the prior conditions were met, so this is a valid message event to display...


    let user_color = data.displayColor !== "" ? data.displayColor : "#" + (md5(data.displayName).slice(26));
    // the above gets the username color from twitch, or generates a random color if that for some reason returns nothing

    let message_container = document.createElement("div");
    message_container.className = `message-row {animationIn} animated`; // this is to contain ALL the message elements
    console.log(message_container.className);
    message_container.setAttribute("data-sender", data.userId);
    message_container.setAttribute("data-msgid", data.msgId);
    message_container.id = `msg-${totalMessages}`;
  
    let message_container_inner_pre = document.createElement("div");
    message_container_inner_pre.className = "message-row-container-pre";

    let message_container_inner = document.createElement("div");
    message_container_inner.className = "message-row-container";
    // the extra layer for the 'inner' is to use the outer layer to add padding for right-biased content

    let username_box = document.createElement("div");
    username_box.className = "user-box";
    username_box.style.backgroundColor = user_color; // set the username box color as the twitch username color
    // typically the CSS is used to define the static colors for things otherwise

    if (badgesEnable === "yes") {
        for (let i = 0; i < data.badges.length; i++) { // so prior to the username, the user badges...
            let badge = data.badges[i];
            let badge_elem = document.createElement("img");
            badge_elem.className = "badge";
            badge_elem.alt= "";
            badge_elem.src = badge.url;

            username_box.appendChild(badge_elem);
        }
    }

    let username_elem = document.createElement("span");
    username_elem.innerText = data.displayName;

    username_box.appendChild(username_elem); // the username_box is now complete

    let user_message = document.createElement("div");
    user_message.className = "user-message"; // contains the user message and/or any emotes
    user_message.style.color = user_color;
    // user_message.style.boxShadow = `-5px 5px ${user_color}`;

    user_message.innerHTML += attachEmotes(data); // this'll probably be fine as-is...

    let username_box_container = document.createElement("div");
    username_box_container.className = "user-box-container";

    let username_spacer = document.createElement("div");
    username_spacer.className = "spacer";

    if (current_username_bias === "left") {
        username_box_container.appendChild(username_box);
    } else { // if not left then, well, right
        let message_spacer = document.createElement("div");
        message_spacer.className = "spacer";
        message_container_inner_pre.appendChild(message_spacer);
        username_box_container.appendChild(username_spacer);
        username_box_container.appendChild(username_box);
    }

    message_container_inner.appendChild(username_box_container);

    message_container_inner.appendChild(user_message);
  
    message_container_inner_pre.appendChild(message_container_inner);

    message_container.appendChild(message_container_inner_pre);
    // the entire message assembly is now complete, ready to append to the scene

    let list_container = document.getElementsByClassName("main-container")[0];

    list_container.appendChild(message_container);
  
    let this_direction = current_username_bias;
    
    if (current_username_bias === "right") {
      current_username_bias = "left";
    } else {
      current_username_bias = "right";
    }

    // EVERYTHING BELOW HERE IS TO ADD THE BUBBLES AND SHADOW
    // SINCE IT HAS TO BE ON SCREEN TO MAKE SURE THE RECT SIZE IS RIGHT
    setTimeout(function(){
      const rect = user_message.getBoundingClientRect();
      const xy_arr = [ // position of all the bubbles :)
          [36, 8],
          [-4, Math.floor(rect.height / 2)],
          [rect.width - 4, Math.floor(rect.height / 2) - 2],
          [rect.width - 35, rect.height - 4],
          [rect.width - 66, rect.height - 12],
          [rect.width - 58, rect.height + 10],
          [rect.width - 42, rect.height + 18]
      ];
      const size_arr = [44, 20, 28, 30, 26, 16, 10]; // size of all the bubbles

      if (data.channel !== channelName) {
          for (let i = 0; i < xy_arr.length; i++) { // background bubbles
              let x_off = Math.floor(xy_arr[i][0] - (size_arr[i] / 2)) + 12; // manual offsets also because why not
              let y_off = Math.floor(xy_arr[i][1] - (size_arr[i] / 2)) + 36 - 16; // the -16 is to match the CSS offset
              x_off += bubbleXOffset;
              y_off += bubbleYOffset;
              x_off -= 4;
              y_off += 4; // then offset diagonally since these are the shadows

              let test = document.createElement("div");
              test.className = "bubble";
              test.style.backgroundColor = user_color;
              test.style.transform = `translate(${x_off}px, ${y_off}px)`;
              test.style.width = `${size_arr[i]}px`;
              test.style.height = `${size_arr[i]}px`;

              message_container_inner.appendChild(test);
          }
      }

      let shadow_elem = document.createElement("div");
      shadow_elem.className = "message-shadow";
      shadow_elem.style.width = `${rect.width}px`; // an actual drop shadow in CSS ends up in front of the bubbles
      shadow_elem.style.height = `${rect.height}px`; // hence this jank
      shadow_elem.style.transform = `translate(${4 + bubbleXOffset}px, ${24 + bubbleYOffset}px)`;
      shadow_elem.style.backgroundColor = user_color;

      message_container_inner.appendChild(shadow_elem);

      if (data.channel !== channelName) {
          for (let i = 0; i < xy_arr.length; i++) { // foreground bubbles
              let x_off = Math.floor(xy_arr[i][0] - (size_arr[i] / 2)) + 12;
              let y_off = Math.floor(xy_arr[i][1] - (size_arr[i] / 2)) + 36 - 16;
              x_off += bubbleXOffset;
              y_off += bubbleYOffset;

              let test = document.createElement("div");
              test.className = "bubble";
              test.style.transform = `translate(${x_off}px, ${y_off}px)`;
              test.style.width = `${size_arr[i]}px`;
              test.style.height = `${size_arr[i]}px`;

              message_container_inner.appendChild(test);
          }
      }

      message_container_inner_pre.style.transform = this_direction === "left" ? "rotate(-3deg)" : "rotate(3deg)";

    }, smallDelay);
  
    let main_spacer = document.getElementsByClassName("main-spacer")[0];
    while (main_spacer.clientHeight == 0) {
        list_container.removeChild(list_container.childNodes[2]);
    }
})


function html_encode(e) { // I presume this just removes characters that would break the HTML
    return e.replace(/[<>"^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}

async function on_load() {
    console.log("Page loaded!");
    // send_test_message();
}

function attachEmotes(message) {
    let text = html_encode(message.text); // sanitize that dirty, dirty user input
    let data = message.emotes;
    if (typeof message.attachment !== "undefined") {
        if (typeof message.attachment.media !== "undefined") {
            if (typeof message.attachment.media.image !== "undefined") {
                text = `${message.text}<img src="${message.attachment.media.image.src}">`;
            }
        }
    }
    return text
        .replace(
            /([^\s]*)/gi,
            function (m, key) {
                let result = data.filter(emote => {
                    return html_encode(emote.name) === key
                });
                if (typeof result[0] !== "undefined") {
                    let url = result[0]['urls'][1];
                    if (provider === "twitch") {
                        return `<img class="emote" " src="${url}"/>`;
                    } else {
                        if (typeof result[0].coords === "undefined") {
                            result[0].coords = {x: 0, y: 0};
                        }
                        let x = parseInt(result[0].coords.x);
                        let y = parseInt(result[0].coords.y);

                        let width = "{emoteSize}px";
                        let height = "auto";

                        if (provider === "mixer") {
                            console.log(result[0]);
                            if (result[0].coords.width) {
                                width = `${result[0].coords.width}px`;
                            }
                            if (result[0].coords.height) {
                                height = `${result[0].coords.height}px`;
                            }
                        }
                        return `<div class="emote" style="width: ${width}; height:${height}; display: inline-block; background-image: url(${url}); background-position: -${x}px -${y}px;"></div>`;
                    }
                } else return key;

            }
        );
}
