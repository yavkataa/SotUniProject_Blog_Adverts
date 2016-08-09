$(function() {
    showView("Home");
    $("#linkHome").click(function() {showView("Home")});
    $("#linkLogin").click(function() {showView("Login")});
    $("#linkRegister").click(function () {showView("Register")});
    $("#linkAdverts").click(function () {showView("Adverts")});
    $("#linkNewAdvert").click(function() {showView("NewAdvert")});

});

function showView(viewId) {
    let sections = $("main > section");
    let buttons = $(".navbar-link");
    let view = $("#view" + viewId);
    let button = $("#link" + viewId);
    if (!sections.is(':animated')) {
        $.when(sections.slideUp(500)).done(function() {view.slideDown(500)});
        buttons.removeClass("selected");
        button.addClass("selected");
    }
}
