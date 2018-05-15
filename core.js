var init = false;

var head = document.getElementsByTagName('head')[0];

scrs = [
    "https://www.gstatic.com/firebasejs/4.12.0/firebase.js",
    "https://www.gstatic.com/firebasejs/4.12.0/firebase-app.js",
    "https://www.gstatic.com/firebasejs/4.12.0/firebase-auth.js",
    "https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js"
];

for (var i = 0; i < scrs.length; i++) {
    var scr = document.createElement("script");
    scr.src = scrs[i];
    head.appendChild(scr);
    console.log("Added " + scrs[i]);
}

var ravenScript = document.createElement('script');
ravenScript.src = "https://cdn.ravenjs.com/3.24.2/raven.min.js";
ravenScript.crossOrigin = "anonymous";
head.appendChild(ravenScript);



var kfEls = [
    '[keyfold="logout"]',
    '[keyfold="private"]',
    '[keyfold="login"]',
    '[keyfold="signup"]',
    '[keyfold="signuplogin"]',
    '[keyfold="public"]'
];

window.onload = function () {
    // Raven.config('https://053c0960de5f40f7ad9f5a1d1171c249@sentry.io/1193420').install();
    // Raven.context(function () {
    var config = {
        apiKey: "AIzaSyB6Wt1ngl5t9Oo4XK0gp4r5iFHk2hORneE",
        authDomain: "keyfold-37e3a.firebaseapp.com",
        databaseURL: "https://keyfold-37e3a.firebaseio.com",
        projectId: "keyfold-37e3a",
        storageBucket: "keyfold-37e3a.appspot.com",
        messagingSenderId: "637019872359"
    };
    firebase.initializeApp(config);

    var cid = document.getElementById("kf").getAttribute("kf");

    checkParams().then(function (result) {
        if (result === false) {
            kfInit().then(function () {
                init = true;
                showBody();
            });
        } else {
            verify(result);
            showSpinner();
            showBody();
        }
    })

    function showSpinner() {
        var style = document.createElement("style");
        style.type = "text/css";
        style.innerHTML =
            `
            .spinner-container {
                height: 100vh;
                width: 100vw;
                display: flex;
                -webkit-box-orient: vertical;
                -webkit-box-direction: normal;
                flex-direction: column;
                -webkit-box-pack: center;
                justify-content: center;
                -webkit-box-align: center;
                align-items: center;
                position: absolute;
                margin: 0px;
                border: none;
                z-index: 100000; 
                background-color: #fff;
            }
            .spinner {
                border: 16px solid #f3f3f3; /* Light grey */
                border-top: 16px solid #3498db; /* Blue */
                border-radius: 50%;
                width: 120px;
                height: 120px;
                animation: spin 2s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            `
        document.getElementsByTagName('head')[0].appendChild(style);

        var spinnerContainer = document.createElement('div');
        spinnerContainer.id = 'spinner-container';
        spinnerContainer.className = 'spinner-container';

        var spinnerAnimation = document.createElement('div');
        spinnerAnimation.className = 'spinner';

        spinnerContainer.appendChild(spinnerAnimation);

        document.body.insertBefore(spinnerContainer, document.body.firstChild);
    }

    function checkParams() {
        return new Promise(function (resolve, reject) {
            try {
                if (window.location.href.indexOf("?t=") != -1) {
                    console.log("Found param");
                    var idToken = getUrlParameter('t');
                    window.history.replaceState(null, null, window.location.pathname);
                    console.log(idToken);
                    resolve(idToken);

                } else {
                    console.log("Did not find params");
                    resolve(false);
                }
            } catch (e) {
                console.log(e);
                Raven.captureException(e);
            }
        })
    }

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    if (document.querySelectorAll('[keyfold="logout"]') !== null) {
        logoutButtons = document.querySelectorAll('[keyfold="logout"]');
        for (var i = 0; i < logoutButtons.length; i++) {
            logoutButtons[i].addEventListener('click', logout);
        }
        console.log("✔️ Listening for clicks on logout button");

    }

    function logout() {
        try {
            firebase.auth().signOut().then(function () {
                document.getElementsByTagName('body')[0].style.visibility = "hidden";
                location.reload(true);
            })
        } catch (e) {
            console.log(e);
            Raven.captureException(e);
        }
    }

    function kfInit() {
        return new Promise(function (resolve, reject) {
            try {
                firebase.auth().onAuthStateChanged(function (user) {
                    if (user) {
                        procEls(kfEls, "authed");
                        console.log("Set display for authed user");
                        resolve(true);
                    } else {
                        procEls(kfEls, "non-authed");
                        console.log("Set display for non-authed user");
                        resolve(true);
                    }
                })
            } catch (e) {
                console.log(e);
                Raven.captureException(e);
            }
        })
    }

    function procEls(kfEls, authState) {
        try {
            for (var i = 0; i < kfEls.length; i++) {
                var str = String(kfEls[i]);
                if (document.querySelectorAll(kfEls[i]) !== null) {
                    console.log("Found " + str)
                    renderEls(kfEls[i], authState, str);
                } else {
                    console.log("Did not find " + str);
                }
            }
        } catch (e) {
            console.log(e);
            Raven.captureException(e);
        }
    }

    function renderEls(elsQ, authState, str) {
        try {
            var els = document.querySelectorAll(elsQ);
            for (var x = 0; x < els.length; x++) {
                if (authState === "authed") {
                    if (str.indexOf("login") !== -1 || str.indexOf("signup") !== -1 || str.indexOf("public") !== -1 || str.indexOf("signuplogin") !== -1) {
                        els[x].setAttribute("style", "display: none !important;");
                        console.log("Set element to display none");
                    }
                } else if (str.indexOf("logout") !== -1 || str.indexOf("private") !== -1) {
                    els[x].setAttribute("style", "display: none !important;");
                    console.log("Set element to display none");
                } else {
                    console.log("Left " + str + " with default display style");
                }
            }
        } catch (e) {
            console.log(e);
            Raven.captureException(e);
        }
    }

    function showBody() {
        try {
            document.getElementsByTagName('body')[0].style.visibility = "visible";
            console.log("✔️ Showed body");
        } catch (e) {
            console.log(e);
            Raven.captureException(e);
        }
    }

    function showClaims() {
        try {
            firebase.auth().currentUser.getIdToken()
                .then((idToken) => {
                    const payload = JSON.parse(atob(idToken.split('.')[1]));
                    console.log(payload);
                }).catch((error) => {
                    console.log(error);
                });
        } catch (e) {
            console.log(e);
            Raven.captureException(e);
        }

    }

    if (document.querySelectorAll('[keyfold="login"]') !== null) {
        loginButtons = document.querySelectorAll('[keyfold="login"]');
        for (var i = 0; i < loginButtons.length; i++) {
            loginButtons[i].addEventListener('click', loginRedir);
        }
        console.log("✔️ Listening for clicks on auth button");
    }

    if (document.querySelectorAll('[keyfold="signup"]') !== null) {
        signinButtons = document.querySelectorAll('[keyfold="signup"]');
        for (var i = 0; i < signinButtons.length; i++) {
            signinButtons[i].addEventListener('click', signupRedir);
        }
        console.log("✔️ Listening for clicks on auth button");
    }

    function loginRedir() {
        var ori = window.location.href;
        var url = "http://kf-auth.webflow.io/login-signup/?o=" + ori + "&c=" + cid + "&d=login";
        console.log(url);
        window.location.href = url;
    }

    function signupRedir() {
        var ori = window.location.href;
        var url = "http://kf-auth.webflow.io/login-signup/?o=" + ori + "&c=" + cid + "&d=signup";
        console.log(url);
        window.location.href = url;
    }

    function checkClaims() {
        return new Promise(function (resolve, reject) {
            try {
                firebase.auth().currentUser.getIdToken()
                    .then((idToken) => {
                        console.log(idToken);
                        fetch(refreshClaims, {
                            method: 'POST',
                            body: JSON.stringify({
                                "idToken": idToken,
                                "user": true
                            }).then(function () {
                                resolve(true);
                            })
                        })
                    })
            } catch (e) {
                console.log(e);
                Raven.captureException(e);
                reject(e);
            }
        })
    }

    function refreshClaims() {
        return new Promise(function (resolve, reject) {
            try {
                firebase.auth().currentUser.getIdToken(true)
                    .then(function () {
                        resolve(true);
                    })
            } catch (e) {
                console.log(e);
                Raven.captureException(e);
                reject(e);
            }
        })
    }


    function verify(idToken) {
        return new Promise(function (resolve, reject) {
            try {
                fetch("http://localhost:5000/keyfold-37e3a/us-central1/login", {
                    method: 'POST',
                    body: JSON.stringify({
                        "idToken": idToken,
                        "meta": cid,
                        "origin": origin
                    })
                }).then(response => response.json())
                    .then(data => {
                        if (data.status === 200) {
                            console.log(data);
                            token = data.customToken;
                            console.log(token);
                            customLogin(token);
                            resolve(true);
                        } else {
                            reject();
                        }
                    })
            } catch (e) {
                reject(e);
                console.log(e);
                Raven.captureException(e);
            }
        })
    }

    function customLogin(token) {
        try {
            firebase.auth().signInWithCustomToken(token)
                .then(function () {
                    console.log("Signed in with custom token");
                    var url = window.location.href.split('?')[0];
                    window.location.href = url;
                })
        } catch (e) {
            console.log(e);
            Raven.captureException(e);
        }
    }
    // })
};