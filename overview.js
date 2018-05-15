checkInit();

function checkInit() {
    if (init === false) {
        setTimeout(checkInit, 50);
    } else {
        console.log("DB is initialised!");
        getUsers();
    }
}

function getUsers() {
    return new Promise(function (resolve, reject) {
        try {
            firebase.auth().currentUser.getIdToken(true)
                .then((idToken) => {
                    console.log(idToken);
                    fetch("http://localhost:5000/keyfold-37e3a/us-central1/getUsers", {
                        method: 'POST',
                        body: JSON.stringify({
                            "idToken": idToken,
                            "site": "default",
                            "userType": "customer"
                        })
                    })
                        .then(function (response) { return response.json(); })
                        .then(function (data) {
                            console.log(data);
                            if (data.status === 200 && Object.keys(data.userProfiles).length >= 1) {
                                displayUsers(data.userProfiles);
                            } else {
                                displayNoUsers();
                            }
                        })
                })
        } catch (e) {
            console.log(e);
            reject(e);
        }
    })
}

function displayUsers(userProfiles) {
    var userListCont = document.getElementById("kf-user-list-container");
    while (userListCont.firstChild) {
        userListCont.removeChild(userListCont.firstChild);
    }
    var userProfileProms = [];
    Object.keys(userProfiles).forEach(function (key) {
        userProfileProms.push(new Promise(function (resolve) {
            console.log(key, userProfiles[key]);
            var displayName = userProfiles[key].displayName;
            var email = userProfiles[key].email;
            var emailVerified = userProfiles[key].emailVerified;
            var creationTime = userProfiles[key].creationTime;
            var disabled = userProfiles[key].disabled;
            var status;
            if (disabled === true) {
                status = "Suspended";
            } else status = "Active";
            var userProfileWrapper = document.createElement('div');
            userProfileWrapper.innerHTML =
                `
                    <div class="kf-user">
    <div class="left-align w-clearfix">
        <div class="user-avatar">
            <div class="html-embed w-embed">
                <!--?xml version="1.0" encoding="UTF-8"?-->
                <svg width="41px" height="43px" viewBox="0 0 41 43" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <defs></defs>
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
                        <g transform="translate(1.000000, 1.000000)" stroke="currentColor" stroke-width="2">
                            <path d="M38.6232655,41 C38.6232655,31.1609871 24,31.1 24,27.5 L24,22.5 C26.4,20.9 28,18.1 28,15 C28,14.5 28,9.5 28,9 C28,4 24,0 19,0 C14,0 10,4 10,9 C10,9.5 10,14.5 10,15 C10,18.1 11.6,20.9 14,22.5 L14,27.5 C14,31 0,31.1 0,41"
                                id="Shape"></path>
                        </g>
                    </g>
                </svg>
            </div>
            <img src="http://uploads.webflow.com/img/image-placeholder.svg" width="40" height="40" id="kf-user-image" class="image">
        </div>
        <div class="kf-user-detail w-clearfix">
            <div id="kf-user-name" class="user-name">${displayName}</div>
        </div>
        <div class="kf-user-detail">
            <div id="kf-user-email" class="user-email">${email}</div>
        </div>
        <div class="kf-user-detail short">
            <div id="kf-user-status" class="user-status active">${status}</div>
        </div>
        <div class="kf-user-detail short">
            <div id="kf-user-sub-date" class="user-sub-date">${creationTime}</div>
        </div>
    </div>
    <div class="right-align w-clearfix">
        <div class="user-actions">
            <a href="#" class="user-action-wrapper w-inline-block">
                <div id="kf-user-status" class="user-action-text" onclick="showModal('suspend','${displayName}', '${key}')">Suspend user</div>
            </a>
            <a href="#" class="user-action-wrapper w-inline-block">
                <div id="kf-user-status" class="user-action-text delete" onclick="showModal('delete','${displayName}', '${key}')">delete user</div>
            </a>
        </div>
    </div>
</div>
            `
            userListCont.appendChild(userProfileWrapper);
            console.log("Appended user to users list");
            resolve();
        }));
    });
    Promise.all(userProfileProms).then(function () {
        document.getElementById("kf-users-loader-container").style.display = "none";
        userListCont.style.display = "block";
    });
}

function displayNoUsers() {
    document.getElementById("kf-users-loader-container").style.display = "none";
    document.getElementById("kf-no-users-container").style.display = "block";
    console.log("Displayed no users container");
}

function showModal(action, displayName, targetUid) {
    document.getElementById("kf-users-modal").style.display = "flex";
    if (action === "suspend") {
        document.getElementById("kf-suspend-user-name").innerText = displayName;
        var suspendBox = document.getElementById("kf-users-suspend-box");
        var modal = document.getElementById("kf-users-modal");
        suspendBox.style.display = "block";
        document.getElementById("kf-suspend-box-close-button").addEventListener("click", function () {
            suspendBox.style.display = "none";
            modal.style.display = "none";
        });
        var suspendButton = document.getElementById("kf-users-suspend-button");
        suspendButton.addEventListener("click", function () {
            try {
                suspendButton.innerText = "";
                document.getElementById("kf-suspend-user-spinner").style.display = "block";
                firebase.auth().currentUser.getIdToken(true)
                    .then(function (idToken) {
                        fetch("http://localhost:5000/keyfold-37e3a/us-central1/suspendUser", {
                            method: 'POST',
                            body: JSON.stringify({
                                "idToken": idToken,
                                "u": targetUid,
                            })
                        }).then(function (response) { return response.json(); })
                            .then(function (data) {
                                console.log(data);
                                if (data.status === 200) {
                                    console.log("Successfully deleted user!");
                                    suspendBox.style.display = "none";
                                    modal.style.display = "none";
                                    document.getElementById("kf-user-list-container").style.display = "none";
                                    document.getElementById("kf-users-loader-container").style.display = "flex";
                                    getUsers();
                                } else {
                                    console.log("Error suspending user");
                                }
                            })
                    })
            } catch (e) {
                console.log(e);
                reject(e);
            }

        })

    }
    if (action === "delete") {
        document.getElementById("kf-delete-user-name").innerText = displayName;
        document.getElementById("kf-users-delete-box").style.display = "block";
        var deleteBox = document.getElementById("kf-users-delete-box");
        var modal = document.getElementById("kf-users-modal");
        document.getElementById("kf-delete-box-close-button").addEventListener("click", function () {
            deleteBox.style.display = "none";
            modal.style.display = "none";
        });
        var deleteButton = document.getElementById("kf-users-delete-button");
        deleteButton.addEventListener("click", function () {
            try {
                deleteButton.innerText = "";
                document.getElementById("kf-delete-user-spinner").style.display = "block";
                firebase.auth().currentUser.getIdToken(true)
                    .then(function (idToken) {
                        fetch("http://localhost:5000/keyfold-37e3a/us-central1/deleteUser", {
                            method: 'POST',
                            body: JSON.stringify({
                                "idToken": idToken,
                                "u": targetUid,
                            })
                        }).then(function (response) { return response.json(); })
                            .then(function (data) {
                                console.log(data);
                                if (data.status === 200) {
                                    console.log("Successfully deleted user!");
                                    deleteBox.style.display = "none";
                                    modal.style.display = "none";
                                    document.getElementById("kf-user-list-container").style.display = "none";
                                    document.getElementById("kf-users-loader-container").style.display = "flex";
                                    getUsers();
                                } else {
                                    console.log("Error deleting user");
                                }
                            })
                    })
            } catch (e) {
                console.log(e);
                reject(e);
            }
        })
    }

}
