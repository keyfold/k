var urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('u') && urlParams.get('code')) {
    var u = urlParams.get('u');
    console.log(u);
    var code = urlParams.get('code');
    console.log(code);
    verify(u, code);
} else {
    console.log("Did not find params");
    document.getElementById("email-verify-error").style.display = "block";
}

function verify(u, code) {
    console.log('Sending request to verify email...');
    fetch('https://us-central1-keyfold-37e3a.cloudfunctions.net/verify-email', {
        method: 'POST',
        body: JSON.stringify({
            u: u,
            code: code
        })
    }).then(response => response.json())
        .then(data => {
            if (data.status === 200) {
                console.log("Success!");
                document.getElementById("spinner-container").style.display = "none";
                document.getElementById("email-verify-success").style.display = "block";
                var domain = data.domain;
                if (domain) {
                    window.location = domain;
                }
            } else {
                errorMessage = data.errorMessage;
                console.log(errorMessage);
            }
        })
        .catch(function (error) { console.log(error); })
}