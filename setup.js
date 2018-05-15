    document.getElementsByTagName('body')[0].style.visibility = "visible";
    document.getElementById("kf-url").addEventListener('click', checkUrlExists);
    console.log("Added event lister to kf-url");
    document.getElementById("kf-url-verify").addEventListener('click', siteVerification);
    console.log("Added event lister to kf-url-verify");
    document.getElementById("kf-script-copy").addEventListener('click', copyText, false);
    console.log("Added event lister to kf-script-copy");

    let meta;
    let url;
    let domainResponse;

    var canRegisterDomain = 'https://us-central1-keyfold-37e3a.cloudfunctions.net/canRegisterDomain';
    var verifySite = 'https://us-central1-keyfold-37e3a.cloudfunctions.net/verifySite';

    function checkUrlExists() {
        var domain = document.getElementById("kf-url-input").value;
        firebase.auth().currentUser.getIdToken().then(function (idToken) {
            console.log('Sending request to check domain is reachable...');
            fetch(canRegisterDomain, {
                method: 'POST',
                body: JSON.stringify({
                    domain: domain,
                    idToken: idToken
                })
            }).then(response => response.json())
                .then(data => {
                    if (data.status === 200) {
                        var kfUrlInput = document.getElementById("kf-url-input");
                        meta = data.meta;
                        url = data.url;
                        domainResponse = data.domain;
                        var kfCid = document.getElementById("kf-cid");
                        kfCid.innerHTML = "\&quot;" + meta + "\&quot;";
                        document.getElementById("kf-url-success").click();
                    }
                    else {
                        errorMessage = data.errorMessage;
                        console.log(errorMessage);
                        handleError('kf-url-error', 'kf-url-error-block', errorMessage);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    handleError('kf-url-error', 'kf-url-error-block', error);
                })
        })
    }

    function siteVerification() {
        firebase.auth().currentUser.getIdToken().then(function (idToken) {
            console.log('Sending request to verify site...');
            fetch(verifySite, {
                method: 'POST',
                body: JSON.stringify({
                    idToken: idToken,
                    meta: meta,
                    url: url,
                    domain: domainResponse
                })
            }).then(response => response.json())
                .then(data => {
                    if (data.status === 200) {
                        document.getElementById("kf-verify-success").click();
                        refreshClaims().then(function () {
                            location.replace('/app/overview');
                        })

                    } else {
                        errorMessage = data.errorMessage;
                        console.log(errorMessage);
                        handleError('kf-verify-error', 'kf-verify-error-block', errorMessage);
                    }

                })
                .catch(function (error) { console.log(error); })
        })
    }

    function refreshClaims() {
        return new Promise(function (resolve, reject) {
            firebase.auth().currentUser.getIdToken()
                .then(function (idToken) {
                    console.log(idToken);
                    fetch("http://localhost:5000/keyfold-37e3a/us-central1/refreshClaims", {
                        method: 'POST',
                        body: JSON.stringify({
                            "idToken": idToken,
                            "userType": "customer"
                        })
                    }).then(function (response) {
                        console.log("Response from claims request: " + response);
                        firebase.auth().currentUser.getIdToken(true);
                        console.log("Refreshed Id Token.");
                        showClaims().then(function() {
                            setTimeout(resolve(true), 5000);
                        })
                    }).catch(function (error) {
                        console.log("Error posting data: " + error);
                        reject(error);
                    })
                }).catch((error) => {
                    console.log(error);
                    reject(error);
                });
        })
    }

    function showClaims() {
        return new Promise(function (resolve, reject) {
            firebase.auth().currentUser.getIdToken(true)
                .then((idToken) => {
                    const payload = JSON.parse(atob(idToken.split('.')[1]));
                    console.log(payload);
                    resolve(true);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                })
        })

    }
    function copyText() {
        var text = document.getElementById("kf-script-includes").textContent;
        console.log(text);
        var temp = document.createElement("input");
        document.body.appendChild(temp);
        temp.value = text;
        temp.select();
        document.execCommand("copy");
        console.log("Copied!");
        document.body.removeChild(temp);
    }