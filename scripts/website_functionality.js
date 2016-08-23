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
    $("#linkProfile").click(function() {profileLoadInformation(); showView("Profile")});
    $("#errorBox").click(function () {$("#errorBox").slideUp(300)});
    $("#infoBox").click(function () {$("#infoBox").slideUp(300)});
    $("#formLogin").submit(function (f) {f.preventDefault(); login()});
    $("#formRegister").submit(function (f) {f.preventDefault(); register()});
    $("#formCreateAdvert").submit(function (f) {f.preventDefault(); createAdvert();});
    $("#formEditAdvert").submit(function (f) {f.preventDefault(); editAdvert($("#viewEditAdvert").attr("data-post-id"))});
    $("#showAdvertWriteComment").click(function () {$("#formComment").fadeIn(300)});
    $("#formComment").submit(function (f) {f.preventDefault(); submitComment()});
    $(document)
        .on("click", ".advertBox", function () {showAdvert($(this).attr("data-advert-id"))})
        .on("click", "#buttonEditAdvert", function () {
            showEditAdvertView($("#viewShowAdvert")
                .attr("data-post-id"))
        })
        .on("click", "#buttonDeleteAdvert", function () {
            showDeleteAdvertConfirmation();
        })
        .on("click", "#confirmAdvertDelete", function () {
            deleteAdvert($('#viewShowAdvert').attr("data-post-id"));
        });
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
    if ($(".previous-selection").attr("id") == "viewMyAdverts") {
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
        sessionStorage.email = data.email;
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
            sessionStorage.email = data.email;
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

function profileLoadInformation() {
    let email = $("#profileEmail").empty();
    let fullname = $("#profileFullName").empty();
    let username =  $("#profileUsername").empty();
    email.text(sessionStorage.email);
    fullname.text(sessionStorage.fullname);
    username.text(sessionStorage.username);
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
    let authBase64 = btoa("view:eqk3bfenagf4yuceaewnbb8q95ptfc2h2dt8c5xxywg394du5zwtj2hywg9mwn78kwddz45vptqq7wyxye8vnjdgvd7");
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
    let authBase64 = btoa("view:eqk3bfenagf4yuceaewnbb8q95ptfc2h2dt8c5xxywg394du5zwtj2hywg9mwn78kwddz45vptqq7wyxye8vnjdgvd7");
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
        $('#lightboxImg1').prop("href", advert.image);
        $('#showAdvertImage2').prop("src", advert.image2);
        $('#lightboxImg2').prop("href", advert.image2);
        $('#showAdvertImage3').prop("src", advert.image3);
        $('#lightboxImg3').prop("href", advert.image3);
        $('#showAdvertImage4').prop("src", advert.image4);
        $('#lightboxImg4').prop("href", advert.image4);
        $('#showAdvertDescription').text("Description: " + advert.description);
        $('#showAdvertCondition').text("Condition: " + advert.condition);
        $('#showAdvertPrice').text("Price: $" + advert.price);
        $('#showAdvertPhone').text("Phone: " + advert.phone);
        $('#showAdvertUser').text("Posted by: " + advert.authorUsername);
        $('#showAdvertDate').text("Posted on: " + advert._kmd.ect.substr(0, 10) + " at " + advert._kmd.ect.substr(11, 5));
        let sel = $('#viewShowAdvert');
        sel.attr("data-post-id", advertId);
        sel.attr("data-post-category", advert.category);
        if (advert.authorId === sessionStorage.uid) {
            sel.append($("<div>").append($("<button class='func button' id='buttonEditAdvert'>Edit advert</button>")));
            sel.append($("<div>").append($("<button class='func button' id='buttonDeleteAdvert'>Delete advert</button>")));
        }
        if (loggedIn) {
            $("#showAdvertComments").fadeIn(300);
            $("#formComment").hide();
        }
        loadComments(advertId);
        showView("ShowAdvert");
    }
}

function loadComments(advertId) {
    let loggedIn = (sessionStorage.authToken != null);
    let authBase64 = btoa("view:eqk3bfenagf4yuceaewnbb8q95ptfc2h2dt8c5xxywg394du5zwtj2hywg9mwn78kwddz45vptqq7wyxye8vnjdgvd7");
    let commentsGetUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/comments";
    let authHeaders;
    if (loggedIn){
        authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    } else {
        authHeaders = {"Authorization": "Basic " + authBase64}
    }
    $.ajax({
        method: "GET",
        url: commentsGetUrl,
        headers: authHeaders,
        success: commentsLoaded,
        error: showAjaxError
    });
    function commentsLoaded(comments) {
        $("#showAdvertDrawComments").empty();
        for (let comment of comments) {
            if (comment.post_id == advertId) {
                let com = $("<div class='commentBox'>");
                com.append($("<div>").append("<span class='commentTitle'>" + comment.title + "</span>"));
                com.append($("<div>").append("<span class='commentUserDateTime'><i>Posted by</i> " + comment.author_username +
                    " <i>on</i> " + comment._kmd.ect.substr(0, 10) +
                    " <i>at</i> " + comment._kmd.ect.substr(11, 5) +
                    ", <i>and they've said:</i></span> "));
                com.append($("<div>").append(comment.content));
                $("#showAdvertDrawComments").append(com);
            }
        }
    }
}

function showEditAdvertView(advertId) {
    $("#viewEditAdvert").attr("data-post-id", advertId);
    let postTitle = $('#showAdvertTitle').text();
    let postImage1= $('#showAdvertImage1').attr("src");
    let postImage2= $('#showAdvertImage2').attr("src");
    let postImage3= $('#showAdvertImage3').attr("src");
    let postImage4= $('#showAdvertImage4').attr("src");
    let postDescription = $('#showAdvertDescription').text();
    let postCondition = $('#showAdvertCondition').text();
    let postPrice = $('#showAdvertPrice').text();
    let postPhone = $('#showAdvertPhone').text();
    let postCategory = $('#viewShowAdvert').attr("data-post-category");
    $('#advertTitleEdit').val(postTitle);
    $('#advertCategoryEdit').val(postCategory);
    $('#advertImage1UrlEdit').val(postImage1);
    $('#advertImage2UrlEdit').val(postImage2);
    $('#advertImage3UrlEdit').val(postImage3);
    $('#advertImage4UrlEdit').val(postImage4);
    $('#advertDescriptionEdit').val(postDescription);
    $('#advertConditionEdit').val(postCondition);
    $('#advertPriceEdit').val(postPrice);
    $('#advertPhoneEdit').val(postPhone);
    showView("EditAdvert");
}

function editAdvert(advertId) {
    let advertEditUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/adverts/" + advertId;
    let authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    let putData = {
        title: $("#advertTitleEdit").val(),
        category: $("#advertCategoryEdit").val(),
        description: $("#advertDescriptionEdit").val(),
        condition: $("#advertConditionEdit").val(),
        price: $("#advertPriceEdit").val(),
        phone: $("#advertPhoneEdit").val(),
        image: $("#advertImage1UrlEdit").val(),
        image2: $("#advertImage2UrlEdit").val(),
        image3: $("#advertImage3UrlEdit").val(),
        image4: $("#advertImage4UrlEdit").val(),
        authorId: sessionStorage.uid,
        authorUsername: sessionStorage.username,
        authorFullName: sessionStorage.fullName
    };
    $.ajax({
        method: "PUT",
        url: advertEditUrl,
        data: putData,
        headers: authHeaders,
        success: advertEdited,
        error: showAjaxError
    });
    function advertEdited(data) {
        showInfo("Advert edited successfully!");
        showView("MyAdverts");
    }
}

function showDeleteAdvertConfirmation() {
    $("#buttonDeleteAdvert").after($("<div class='func' style='display: none;'>Warning: This is permanent and cannot be recovered! <br/> Click the button to confirm and delete the advert: <div><button class='func button' id='confirmAdvertDelete'>Confirm</button></div>").fadeIn(300)).hide();
}

function deleteAdvert(advertId) {
    let advertDeleteUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/adverts/" + advertId;
    let authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    $.ajax({
        method: "DELETE",
        url: advertDeleteUrl,
        headers: authHeaders,
        success: advertDeleted,
        error: showAjaxError
    });
    function advertDeleted() {
        showInfo("Advert deleted successfully!");
        drawAdverts(sessionStorage.uid);
        showView("MyAdverts");
    }
}

function submitComment() {
    let commentCreateUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/comments";
    let authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    let postId = $("#viewShowAdvert").attr("data-post-id");
    let authorUsername = sessionStorage.username;
    let authorId = sessionStorage.uid;
    let commentTitle = $("#commentTitle").val();
    let commentContent = $("#commentContent").val();
    let newCommentData = {
        title: commentTitle,
        content: commentContent,
        post_id: postId,
        author_id: authorId,
        author_username: authorUsername
    };

    $.ajax({
        method: "POST",
        url: commentCreateUrl,
        data: newCommentData,
        headers: authHeaders,
        success: commentPosted,
        error: showAjaxError
    });
    function commentPosted() {
        showInfo("Comment posted successfully!");
        $("#formComment").fadeOut(300);
        showAdvert(postId);
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


