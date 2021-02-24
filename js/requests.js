(async () => {
    let refFetch = await fetch("../.netlify/functions/token-hider/token-hider");
    let refresh = await refFetch.text()
    refresh = JSON.parse(refresh)
    let refresh_token = refresh["REFRESH"]
   
    let grant_type = "refresh_token"
    let code_type = "refresh_token"
    
    
    let client_id = "046b829766094645b6cef22e6583cfec"
    let client_secret = refresh["CLIENT_SECRET"]
    let myurl = "https:%2F%2Fexample.com%2Fcallback"

    // console.log(`https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${myurl}&scope=user-read-private%20user-read-email%20user-read-currently-playing%20user-read-playback-state&state=34fFs29kd09`)

    let auth = await fetch(`https://accounts.spotify.com/api/token`, {
        method: "POST",
        body: `grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&${code_type}=${refresh_token}&redirect_uri=${myurl}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },       
    })

    let response = await auth.text();
    response = JSON.parse(response)

    let access_token =  response["access_token"]

    getPlayback()
    setInterval(getPlayback, 5000)

    async function getPlayback() {
        let playback = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {headers: {
            "Authorization": "Bearer " + access_token,
            "Accept" :"application/json",
            "Content-Type": "application/json"
        }})
    
        try {
            let playbackReponse = await playback.text()
            playbackReponse = JSON.parse(playbackReponse)

            document.querySelector(".container_inner").style.display = "flex"
            document.querySelector(".widget_title p").textContent = "Currently vibing with"
            document.querySelector(".error").style.display = "none"
        
            let image = document.querySelector(".cover")
            let trackName = document.querySelector("#track-name")
            let artist = document.querySelector("#artist")
        
            image.setAttribute("src", playbackReponse["item"]["album"]["images"][0]["url"])
            trackName.textContent = playbackReponse["item"]["name"]
            let artists = playbackReponse["item"]["artists"].map((artist) => {
                return artist["name"]
            })
            
            artist.textContent = artists.join(", ")
        } catch(e) {
            document.querySelector(".error").style.display = "inline-block"
            document.querySelector(".container_inner").style.display = "none"
            document.querySelector(".widget_title p").textContent = "Currently offline"
        }
    }
})()

let offsetTop = 100;
let ratio = $("#container .error").outerHeight() / $("#container").outerHeight()
let h = $("#container").height();

$(window).resize(() => {
    ratio = $("#container .error").outerHeight() / $("#container").outerHeight()
    h = $("#container").height();
})

setInterval(() => {
    if(offsetTop < -h * ratio / 1.1) {
        document.querySelector(".error").style.marginTop = 0;
        offsetTop = 100;
    }

    document.querySelector(".error").style.marginTop = offsetTop + "%"
    offsetTop -= 0.1;
}, 10)