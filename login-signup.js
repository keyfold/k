// Raven.config('https://053c0960de5f40f7ad9f5a1d1171c249@sentry.io/1193420').install();
// Raven.context(function () {

document.getElementById("keyfold-user-log-in-button").addEventListener("click", handleLogin);
console.log("Added event listener to login button");
document.getElementById("keyfold-user-sign-up-button").addEventListener("click", handleSignup);
console.log("Added event listener to signup button");

getParams().then(function (result) {
    if (result === "signup") {
        setDisplay("signup");
    } else {
        setDisplay("login");
    }
});

var o;
var c;

function getParams() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    return new Promise(function (resolve, reject) {
        try {
            if (url.searchParams.get("o")) {
                o = url.searchParams.get("o");
                console.log(o);
            }
            if (url.searchParams.get("c")) {
                c = url.searchParams.get("c");
                console.log(c);
            }
            if (url.searchParams.get("d")) {
                var d = url.searchParams.get("d");
                console.log(d);
                resolve(d);
            }
            resolve(true);
        } catch (e) {
            console.log(e);
            reject(e);
            Raven.captureException(e);
        }
    });
}

function setDisplay(x) {
    if (x === "signup") {
        window.history.replaceState(null, null, window.location.pathname);
        document.getElementById("keyfold-user-signup-form").setAttribute("style", "display: block !important;");
    } else {
        window.history.replaceState(null, null, window.location.pathname);
        document.getElementById("keyfold-user-login-form").setAttribute("style", "display: block !important;");
    }
}

function handleLogin() {
    try {
        var loginEmail = document.getElementById("keyfold-form-field-email-login").value;
        var password = document.getElementById("keyfold-form-field-pass-login").value;
        if (!c || !o) {
            handleError("login", "invalidOrigin");
        } else {
            var email = c + "#" + loginEmail;
            console.log(email);
            console.log(email);
            logUserIn(email, password);
        }
    } catch (e) {
        console.log(e);
        Raven.captureException(e);
    }
}

function handleSignup() {
    try {
        var displayName = document.getElementById("keyfold-form-field-name-signup").value;
        if (displayName.length < 3) {
            handleError("signup", "displayNameNull");
        } else {
            var signupEmail = document.getElementById("keyfold-form-field-email-signup").value;
            var password = document.getElementById("keyfold-form-field-pass-signup").value;
            if (!c || !o) {
                handleError("signup", "invalidOrigin");
            } else {
                var email = c + "#" + signupEmail;
                console.log(email);
                console.log(email);
                createNewUser(displayName, email, password);
            }
        }
    } catch (e) {
        console.log(e);
        Raven.captureException(e);
    }
}

function createNewUser(displayName, email, password) {
    try {
        startLoader();
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function (user) {
                user.updateProfile({
                    displayName: displayName
                }).then(function () {
                    console.log(o);
                    if (o === "http://app-keyfold.webflow.io/" || o === "https://keyfold.io/" || o === "http://keyfold.io/") {
                        window.location.href = "http://app-keyfold.webflow.io/app/setup";
                    } else {
                        redirect(user);
                    }
                });
            })
            .catch(function (e) {
                stopLoader();
                console.log(e);
                handleError("signup", e);
            })
    } catch (e) {
        stopLoader();
        alert(e);
    }
}

function logUserIn(email, password) {
    try {
        startLoader();
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function (user) {
                if (o === "http://app-keyfold.webflow.io/" || o === "https://keyfold.io/" || o === "http://keyfold.io/") {
                    window.location.href = "http://app-keyfold.webflow.io/app/overview";
                } else {
                    redirect(user);
                }
            })
            .catch(function (e) {
                stopLoader();
                console.log(e);
                handleError("login", e);
            })
    } catch (e) {
        stopLoader();
        alert(e);
    }
}

function redirect(user) {
    try {
        user.getIdToken()
            .then(function (idToken) {
                var jsonStr = JSON.stringify(idToken);
                var str = jsonStr.replace(/^"|"$/g, '')
                var dest = (o + "?t=" + str).toString();
                console.log(dest);
                window.location.href = dest;
            })
    } catch (e) {
        console.log(e);
    }
}

var signUpNameTrigger = document.getElementById("kf-sign-up-name-trigger");
var signUpNameErrorMessage = document.getElementById("kf-sign-up-name-error");
var signUpEmailTrigger = document.getElementById("kf-sign-up-email-trigger");
var signUpEmailErrorMessage = document.getElementById("kf-sign-up-email-error");
var signUpPasswordTrigger = document.getElementById("kf-sign-up-password-trigger");
var signUpPasswordErrorMessage = document.getElementById("kf-sign-up-password-error");

var logInEmailTrigger = document.getElementById("kf-login-email-trigger");
var logInEmailErrorMessage = document.getElementById("kf-login-email-error");
var logInPasswordTrigger = document.getElementById("kf-login-password-trigger");
var logInPasswordErrorMessage = document.getElementById("kf-login-password-error");

function handleError(location, e) {
    if (location === "signup") {
        if (e === "displayNameNull") {
            signUpNameErrorMessage.innerText = "Sorry, your name needs to have at least 3 characters.";
            signUpNameTrigger.click();
        }
        if (e.code === "auth/email-already-in-use") {
            signUpEmailErrorMessage.innerText = "Sorry, this email address is already taken.";
            signUpEmailTrigger.click();
        }
        if (e.code === "auth/invalid-email") {
            signUpEmailErrorMessage.innerText = "Sorry, this email seems to be invalid.";
            signUpEmailTrigger.click();
        }
        if (e.code === "auth/weak-password") {
            signUpPasswordErrorMessage.innerText = "Sorry, password needs to have at least 6 characters.";
            signUpPasswordTrigger.click();
        }
        if (e === "invalidOrigin") {
            signUpPasswordErrorMessage.innerText = "Sorry, you need to come from a valid origin.";
            signUpPasswordTrigger.click();
        }
    }
    if (location === "login") {
        if (e.code === "auth/user-not-found") {
            logInEmailErrorMessage.innerText = "Sorry, we could not find this user.";
            logInEmailTrigger.click();
        }
        if (e.code === "auth/invalid-email") {
            logInEmailErrorMessage.innerText = "Sorry, this email seems to be invalid.";
            logInEmailTrigger.click();
        }
        if (e.code === "auth/wrong-password") {
            logInPasswordErrorMessage.innerText = "Sorry, this password is incorrect.";
            logInPasswordTrigger.click();
        }
        if (e.code === "auth/user-disabled") {
            logInEmailErrorMessage.innerText = "Sorry, this account has been disabled.";
            logInEmailTrigger.click();
        }
        if (e === "invalidOrigin") {
            logInPasswordErrorMessage.innerText = "Sorry, you need to come from a valid origin.";
            logInEmailTrigger.click();
        }
    }
}

function startLoader() {
    console.log("Started trigger");
    // var trigger = document.getElementById("kf-progress-spinner-start-stop");
    // trigger.click();
    var signUpButton = document.getElementById("keyfold-user-sign-up-button");
    var logInButton = document.getElementById("keyfold-user-log-in-button");
    signUpButton.innerText = "";
    logInButton.innerText = "";
    var signUpSpinner = document.getElementById("kf-sign-up-spinner");
    var logInSpinner = document.getElementById("kf-log-in-spinner");
    signUpSpinner.setAttribute("style", "display: block !important; position: absolute;");
    logInSpinner.setAttribute("style", "display: block !important; position: absolute;");
}

function stopLoader() {
    console.log("Stopped trigger");
    // var trigger = document.getElementById("kf-progress-spinner-start-stop");
    // trigger.click();
    var signUpSpinner = document.getElementById("kf-sign-up-spinner");
    var logInSpinner = document.getElementById("kf-log-in-spinner");
    signUpSpinner.setAttribute("style", "display: none !important");
    logInSpinner.setAttribute("style", "display: none !important");
    var signUpButton = document.getElementById("keyfold-user-sign-up-button");
    var logInButton = document.getElementById("keyfold-user-log-in-button");
    signUpButton.innerText = "Sign up";
    logInButton.innerText = "Log in";
}

        // })


