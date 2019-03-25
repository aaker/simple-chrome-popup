function postData(url = ``, data = {}) {
  // Default options are marked with *
    return fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: Object.entries(data).map(([key, val]) => `${key}=${val}`).join('&'),
    })
    .then(response => response.json()); // parses JSON response into native Javascript objects
}

function lookupNumber (number, settings)
{
  let params = {api_key:settings.whitepages_key, phone:number };
  fetch('https://proapi.whitepages.com/3.0/phone?'+ Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&'),
   {
      'Accept': 'application/json',
  })
  .then(response => response.json())
  .then(data => postNotification(number,data))
  .catch(error => console.log(error));

}

let myNotificationID = 0;
function postNotification(number,data)
{
  if (Notification.permission !== "granted")
                    Notification.requestPermission();
  else {
      let name = "";
      let extra = "";
      if (data.belongs_to[0].firstname)
      {
        name = data.belongs_to[0].firstname + " " + data.belongs_to[0].lastname;
        extra = data.belongs_to[0].gender + " " + data.belongs_to[0].age_range + " " + data.carrier;

      }
      else if(data.belongs_to.name)
      {
        name = data.belongs_to[0].name;
        extra =  data.line_type + " " + data.carrier;
      }

      chrome.notifications.create(number+Math.random(), {
          type: "basic",
          title: "Incoming Call",
          contextMessage: name + " (" + number + ")" ,
          message: extra,
          iconUrl:"User.png",
          requireInteraction: true,
          //https://stackoverflow.com/questions/44535778/chrome-extension-notification-buttons-not-showing-on-macos-osx
          buttons: [{
              title: "Answer",
              iconUrl: "Check.png"
          }, {
              title: "Reject",
              iconUrl: "Delete.png"
          }]
      }, function(id) {
          myNotificationID = id;
          tmpName = name;
      });
  }

}

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    if (notifId === myNotificationID) {
        chrome.notifications.clear(notifId, function() {});
        chrome.storage.sync.get({
            // #TODO grab settings
        }, function(items) {
            if (btnIdx === 0) {
                console.log("Answering");
                // #TODO add in logic
            } else if (btnIdx === 1) {
                console.log("Reject");
                // #TODO add in logic
            }
        });
    }
});



function subscribe(settings,token)
{

  var request_call_data = {
    domain: settings.username.split("@")[1],
    filter: settings.username.split("@")[0],
    type: 'call',
    'bearer': token
  };


  let socket = io.connect('https://' + settings.hostname + ':8001', {secure: true});
  socket.on('connect', function() {
    setTimeout(
      function(request_call_data){
        socket.emit('subscribe', request_call_data);
      }, 1000,request_call_data
    );
  });

  socket.on('connect_error', function(err) {
    console.log( 'connect_error');
    console.log( err);
  });

  socket.on('error', function(err) {
    console.log( 'error');
    console.log( err);
  });

  let triggered_orig_callids = [];
  socket.on('call', function(data) {
    if (triggered_orig_callids.includes(data.orig_callid))
      return;
    if (data.term_user != request_call_data.filter )
      return;
    triggered_orig_callids.push(data.orig_callid);

    lookupNumber(data.orig_from_user, settings);

  });

  socket.on('status', function(data) {
    console.log( data);
  });
}

chrome.storage.sync.get([
  'hostname',
  'client_id',
  'client_secret',
  'username',
  'password',
  'whitepages_key',
], function(settings) {

  postData("https://"+settings.hostname+"/ns-api/Oauth2/token/",
      {client_id:settings.client_id,client_secret:settings.client_secret,
        username:settings.username,password:settings.password,grant_type:"password"  }
   )
  .then(data => subscribe(settings,data.access_token))
  .catch(error => console.log(error));

});

if (Notification.permission !== "granted")
   Notification.requestPermission();
