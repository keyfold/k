    function refreshCustomerClaims() {
        return new Promise(function (resolve, reject) {
            firebase.auth().currentUser.getIdToken()
                .then((idToken) => {
                    console.log(idToken);
                    fetch(refreshClaims, {
                        method: 'POST',
                        body: JSON.stringify({
                            "idToken": idToken,
                        })
                    }).then(function (response) {
                        console.log("Response from claims request: " + response);
                        firebase.auth().currentUser.getIdToken(true);
                        console.log("Refreshed Id Token.");
                        showClaims();
                        resolve(true);
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
        firebase.auth().currentUser.getIdToken(true)
            .then((idToken) => {
                const payload = JSON.parse(atob(idToken.split('.')[1]));
                console.log(payload);
            })
            .catch((error) => {
                console.log(error);
            })
    }