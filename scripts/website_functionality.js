const kinveyAppID = 'kid_r1mi4MLY';
const kinveyAppSecret = 'c65bf74098564788b1147610ba9548a6';
const kinveyBaseUrl = 'https://baas.kinvey.com/';

$(function() {
    showView("Home");
    showHideNavigationLinks();
    $("#linkHome").click(function() {showView("Home")});
    $("#linkLogin").click(function() {showView("Login")});
    $("#linkRegister").click(function () {showView("Register")});
    $("#linkAdverts").click(function () {drawAdverts()});
    $("#linkNewAdvert").click(function() {showView("NewAdvert");});
    $("#linkMyAdverts").click(function() {drawAdverts(sessionStorage.uid); showView("MyAdverts")});
    $("#linkProfile").click(function() {showView("Profile")});
    $("#errorBox").click(function () {$("#errorBox").slideUp(300)});
    $("#infoBox").click(function () {$("#infoBox").slideUp(300)});
    $("#formLogin").submit(function (f) {f.preventDefault(); login()});
    $("#formRegister").submit(function (f) {f.preventDefault(); register()});
    $("#formCreateAdvert").submit(function (f) {f.preventDefault(); createAdvert();});
    $(document).on("click", ".advertBox", function () {showAdvert($(this).attr("data-advert-id"))});
    $("#backButton").click(function () {showPreviousView()});
});

function showView(viewId) {
    let sections = $("main > section");
    let buttons = $(".navbar-link");
    let view = $("#view" + viewId);
    let button = $("#link" + viewId);
    if (!sections.is(':animated')) {
        $.when(sections.slideUp(300)).done(function() {view.slideDown(300)});
        buttons.removeClass("selected");
        button.addClass("selected");
        let currentSelection = $(".current-selection");
        $(".previous-selection").removeClass("previous-selection");
        currentSelection.addClass("previous-selection");
        currentSelection.removeClass("current-selection");
        view.addClass("current-selection");
    }
}

function showPreviousView() {
    if ($(".previous-selection").attr("id") == "viewMyAdverts   ") {
        showView("MyAdverts");
    } else {
        showView("Adverts");
    }
}

function showHideNavigationLinks() {
    let loggedIn = (sessionStorage.authToken != null);
    if (loggedIn) {
        $("#linkLogin").hide();
        $("#linkRegister").hide();
        $("#linkAdverts").show();
        $("#linkNewAdvert").show();
        $("#linkMyAdverts").show();
        $("#linkProfile").show();
        $("#linkLogout").show();
        $("#headerGreeting").append("Greetings, " + sessionStorage.username + "!");
    } else {
        $("#linkLogin").show();
        $("#linkRegister").show();
        $("#linkAdverts").show();
        $("#linkNewAdvert").hide();
        $("#linkMyAdverts").hide();
        $("#linkProfile").hide();
        $("#linkLogout").hide();
        $("#headerGreeting").empty();
    }
}

function login() {
    let authBase64 = btoa(kinveyAppID + ":" + kinveyAppSecret);
    let loginUrl = kinveyBaseUrl + "user/" + kinveyAppID + "/login";
    let loginData = ({
        username: $("#loginUser").val(),
        password: $("#loginPassword").val()
    });
    $.ajax({
        method: "POST",
        url: loginUrl,
        data: loginData,
        headers: {"Authorization" : "Basic " + authBase64},
        success: loginSuccess,
        error: showAjaxError
    });
    function loginSuccess(data, status) {
        sessionStorage.authToken = data._kmd.authtoken;
        sessionStorage.username = data.username;
        sessionStorage.fullName = data.fullname;
        sessionStorage.uid = data._id;
        showView("Home");
        showInfo("Login Successful!");
        showHideNavigationLinks();
    }
}

function register()  {
    let passwordMatch = $('#registerPassword').val() === $('#registerPasswordConfirm').val();
    if (passwordMatch) {
        let authBase64 = btoa(kinveyAppID + ":" + kinveyAppSecret);
        let registerUrl = kinveyBaseUrl + "user/" + kinveyAppID + "/";
        let registerData = ({
            username: $('#registerUser').val(),
            password: $('#registerPassword').val(),
            fullname: $('#registerFullName').val(),
            email: $('#registerEmail').val()
        });
        $.ajax({
            method: "POST",
            url: registerUrl,
            data: registerData,
            headers: {"Authorization": "Basic " + authBase64},
            success: registerSuccess,
            error: showAjaxError
        });
        function registerSuccess(data, status) {
            sessionStorage.authToken = data._kmd.authtoken;
            sessionStorage.username = data.username;
            sessionStorage.fullName = data.fullname;
            sessionStorage.uid = data._id;

            showView("Home");
            showHideNavigationLinks();
            showInfo("Registration successful!")
        }
    } else {
        showError("The two passwords don't match, please re-enter them!");
        $('#registerPassword').val("");
        $('#registerPasswordConfirm').val("");
    }
}

function createAdvert() {
    let advertsUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/adverts";
    let authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    let newAdvertData = {
        title: $("#advertTitle").val(),
        category: $("#advertCategory").val(),
        description: $("#advertDescription").val(),
        condition: $("#advertCondition").val(),
        price: $("#advertPrice").val(),
        phone: $("#advertPhone").val(),
        image: $("#advertImage1Url").val(),
        image2: $("#advertImage2Url").val(),
        image3: $("#advertImage3Url").val(),
        image4: $("#advertImage4Url").val(),
        authorId: sessionStorage.uid,
        authorUsername: sessionStorage.username,
        authorFullName: sessionStorage.fullName
    };
    $.ajax({
        method: "POST",
        url: advertsUrl,
        data: newAdvertData,
        headers: authHeaders,
        success: advertCreated,
        error: showAjaxError
    });
    function advertCreated(data) {
        let advertInputFields = $("#viewNewAdvert").find("input");
        advertInputFields.val("");
        $("#advertDescription").val("");
        showView("Adverts");
        showInfo("Advert successfully posted!")
    }
}

function drawAdverts(userID) {
    let getForUser = (userID != null);
    let loggedIn = (sessionStorage.authToken != null);
    let authBase64 = btoa("test:test");
    let advertsGetUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/adverts";
    let authHeaders;
    if (loggedIn){
        authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    } else {
        authHeaders = {"Authorization": "Basic " + authBase64}
    }
    $.ajax({
        method: "GET",
        url: advertsGetUrl,
        headers: authHeaders,
        success: advertsLoaded,
        error: showAjaxError
    });
    function advertsLoaded (adverts, status) {
        $("#adverts").empty();
        $("#myAdverts").empty();
        if (getForUser) {
            for (let advert of adverts) {
                if (advert.authorId == userID) {
                    let advertDiv = $("<div>", {"class": "advertBox", "data-advert-id" : advert._id}); //.append(JSON.stringify(advert));
                    advertDiv.append($("<div>").append($('<img>', {src: advert.image, width: "100%"})));
                    advertDiv.append($("<div class='advertTitle'>").append(advert.title));
                    advertDiv.append($("<div class='advertCondition'>").append(advert.condition));
                    advertDiv.append($("<div class='advertPrice'>").append("$" + advert.price + " USD"));
                    $("#myAdverts").append(advertDiv);
                }
            }
        } else {
            for (let advert of adverts) {
                let advertDiv = $("<div>", {class: "advertBox", "data-advert-id" : advert._id}); //.append(JSON.stringify(advert));
                advertDiv.append($("<div>").append($('<img>', {src: advert.image, width: "100%"})));
                advertDiv.append($("<div class='advertTitle'>").append(advert.title));
                advertDiv.append($("<div class='advertCondition'>").append(advert.condition));
                advertDiv.append($("<div class='advertPrice'>").append("$" + advert.price + " USD"));
                $("#adverts").append(advertDiv);
            }
            showView("Adverts");
        }
    }
}

function showAdvert(advertId) {
    let loggedIn = (sessionStorage.authToken != null);
    let authBase64 = btoa("test:test");
    let advertGetUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/adverts/" + advertId;
    let authHeaders;
    if (loggedIn){
        authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    } else {
        authHeaders = {"Authorization": "Basic " + authBase64}
    }
    $.ajax({
        method: "GET",
        url: advertGetUrl,
        headers: authHeaders,
        success: advertLoaded,
        error: showAjaxError
    });
    function advertLoaded(advert) {
        $(".func").remove();
        $('#showAdvertTitle').text(advert.title);
        $('#showAdvertImage1').prop("src", advert.image);
        $('#showAdvertImage2').prop("src", advert.image2);
        $('#showAdvertImage3').prop("src", advert.image3);
        $('#showAdvertImage4').prop("src", advert.image4);
        $('#showAdvertDescription').text(advert.description);
        $('#showAdvertCondition').text(advert.condition);
        $('#showAdvertPrice').text(advert.price);
        $('#showAdvertPhone').text(advert.phone);
        $('#showAdvertUser').text(advert.authorUsername);
        if (advert.authorId == sessionStorage.uid) {
            let sel = $("#viewShowAdvert").append($("<div>").append($("<button class='func button'>Delete advert</button>")));
        }
        showView("ShowAdvert");
    }
}



function showAjaxError(data, status) {
    let errorMsg = '';
    if (typeof(data.readyState) != "undefined" && data.readyState == 0) {
        errorMsg = "Network connection problem. Please check your connection!"
    }
    else if (data.responseJSON && data.responseJSON.description) {
        errorMsg = data.responseJSON.description;
    } else {
        errorMsg = "Error: " + JSON.stringify(data)
    }
    $('#errorBox').text(errorMsg).slideDown(300);
}

function showInfo(messageText) {
    $('#infoBox').text(messageText).slideDown(300).delay(2000).slideUp(300);
}

function showError(messageText) {
    $('#errorBox').text(messageText).slideDown(300);
}

$(document).ajaxStart(function(){
    $("#loadingBox").slideDown(300);
})
    .ajaxStop(function() {
        $("#loadingBox").slideToggle(300);
    });

function logout() {
    sessionStorage.clear();
    showView("Home");
    showHideNavigationLinks();
    showInfo("Logged out.");
}


