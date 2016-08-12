const kinveyAppID = 'kid_r1mi4MLY';
const kinveyAppSecret = 'c65bf74098564788b1147610ba9548a6';
const kinveyBaseUrl = 'https://baas.kinvey.com/';

$(function() {
    showView("Home");
    $("#linkHome").click(function() {showView("Home")});
    $("#linkLogin").click(function() {showView("Login")});
    $("#linkRegister").click(function () {showView("Register")});
    $("#linkAdverts").click(function () {showView("Adverts")});
    $("#linkNewAdvert").click(function() {showView("NewAdvert")});
    $("#errorBox").click(function () {$("#errorBox").slideUp(300)});
    $("#infoBox").click(function () {$("#infoBox").slideUp(300)});
    showHideNavigationLinks();
    $("#formLogin").submit(function (f) {f.preventDefault(); login()});
    $("#formRegister").submit(function (f) {f.preventDefault();register()});
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
        sections.removeClass("current-selection");
        view.addClass("current-selection");
    }
}

function showHideNavigationLinks() {
    let loggedIn = (sessionStorage.authToken != null);
    if (loggedIn) {
        $("#linkLogin").hide();
        $("#linkRegister").hide();
        $("#linkAdverts").show();
        $("#linkNewAdvert").show();
        $("#linkLogout").show();
        $("#headerGreeting").append("Greetings, " + sessionStorage.username + "!");
    } else {
        $("#linkLogin").show();
        $("#linkRegister").show();
        $("#linkAdverts").hide();
        $("#linkNewAdvert").hide();
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


