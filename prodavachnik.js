/**
 * Created by Stefan on 5.8.2017 г..
 */
function startApp() {
    let appKey = "kid_Hyqv8UNv-";
    let appSecret ="41e20b046fc446a7a1eb0afb0a587f80";
    adjustView();
    $("#viewHome").show();
    $("#linkHome").click(() =>{displayCurrSetting("home")});
    $("#linkLogin").click(() =>{displayCurrSetting("login")});
    $("#linkRegister").click(() =>{displayCurrSetting("register")});
    $("#linkListAds").click(() =>{displayCurrSetting("listAds");listReq()});
    $("#linkCreateAd").click(() =>{displayCurrSetting("create")});
    $("#linkLogout").click(() =>{displayCurrSetting("logout")});

    $("#buttonLoginUser").click(loginReq);
    $("#buttonCreateAd").click(createAdv);
    $("#buttonRegisterUser").click(registerReq);
    function adjustView() {
        if(localStorage.getItem("username") === null){
            $("#linkHome").show();
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkListAds").hide();
            $("#linkCreateAd").hide();
            $("#linkLogout").hide();
            $("#loggedInUser").hide();
        }
        else{
            $("#linkHome").show();
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListAds").show();
            $("#linkCreateAd").show();
            $("#linkLogout").show();
            $("#loggedInUser").text(`Welcome, ${localStorage.getItem("username")}`);
            $("#loggedInUser").show();
        }
    }

    function displayCurrSetting(comm) {
    $("main").find("section").hide();
        switch (comm){
            case "home": $("#viewHome").show();break;
            case "login": $("#viewLogin").show();break;
            case "register": $("#viewRegister").show();break;
            case "listAds": $("#viewAds").show();break;
            case "create": $("#viewCreateAd").show();break;
            case "logout": localStorage.clear();adjustView();displayCurrSetting("home");infoBox("Logged out successful!");break;
            case "edit": $("#viewEditAd").show();
        }
    }

    function loginReq() {
let username = ($("#formLogin").find("input[name=username]"));
let password = $("#formLogin").find("input[name=passwd]");
        let req = {
            url: 'https://baas.kinvey.com/user/kid_Hyqv8UNv-/login',
            method: "POST",
            headers: {
                "Authorization": "Basic "+ btoa(appKey+":"+appSecret)
            },
            data: {
            "username": username.val(),
            "password": password.val()
            },
            success: function(data){login(data);infoBox("Logged in successful!")},
            error: errorBox
        };
        $.ajax(req);
        username.val("");
        password.val("");
        loadingBox("Logging in...");
    }

    function registerReq() {
        let username = ($("#formRegister").find("input[name=username]"));
        let password = $("#formRegister").find("input[name=passwd]");
        let req = {
            url: 'https://baas.kinvey.com/user/kid_Hyqv8UNv-',
            method: "POST",
            headers: {
                "Authorization": "Basic "+ btoa(appKey+":"+appSecret)
            },
            data: {
                "username": username.val(),
                "password": password.val()
            },
            success: function(data){login(data);infoBox("Register successful!")},
            error: errorBox
        };
        $.ajax(req);
        username.val("");
        password.val("");
        loadingBox("Creating new account..");
    }

    function login(data) {
        localStorage.setItem("authToken", data._kmd.authtoken);
        localStorage.setItem("author", data._acl.creator);
        localStorage.setItem("username", data.username);
        adjustView();
        displayCurrSetting("home");

    }

    function listReq() {

        let req = {
            url: "https://baas.kinvey.com/appdata/kid_Hyqv8UNv-/Prodavachnik",
            method: "GET",
            headers:{
                "Authorization":"Kinvey " + localStorage.getItem("authToken")
            },
            beforeSend: loadingBox("Getting advertisement list"),
            success: function(data){

                getList(data);
            setTimeout(()=> infoBox("Done!"),400)},
            error: errorBox
        };
           $.ajax(req);

        function getList (data){
            let container = $("#ads");
            container.empty();
            let table =
                $("<table>")
                    .append($("<tr>")
                        .append($("<th>Title</th>"))
                        .append($("<th>Publisher</th>"))
                        .append($("<th>Description</th>"))
                        .append($("<th>Price</th>"))
                        .append($("<th>Date Published</th>"))
                        .append($("<th>Actions</th>")));


            for(let ad of data){
                let tr = $("<tr>");
                tr.append($("<td>").text(ad.title));
                tr.append($("<td>").text(ad.author));
                tr.append($("<td>").text(ad.description));
                tr.append($("<td>").text(ad.price));
                tr.append($("<td>").text(ad.datePublished));

                let actions = $("<td>");

                if(ad._acl.creator === localStorage.getItem("author")){
                    actions.append($('<a href="#">[Delete]</a>').click(()=>{deleteAd(ad._id)}));
                    actions.append($('<a href="#">[Edit]</a>').click(()=>{editAd(ad._id)}));
                }
                tr.append(actions);
                tr.appendTo(table);
            }
            table.appendTo(container);
        }
    function deleteAd(id) {

        let req = {
            url: `https://baas.kinvey.com/appdata/kid_Hyqv8UNv-/Prodavachnik/${id}`,
            method: "DELETE",
            headers:{
                "Authorization":"Kinvey "+ localStorage.getItem("authToken")
            },
            beforeSend: loadingBox("Deleting..."),
            success: ()=>{listReq(); infoBox("Deleted.")},
            error: errorBox,

        };
        $.ajax(req);

    }

    function editAd(ad){
        displayCurrSetting("edit");
        let title = $("#viewEditAd").find("input[name=title]");
        let des =$("#viewEditAd").find("textarea[name=description]");
        let date = $("#viewEditAd").find("input[name=datePublished]");
        let price = $("#viewEditAd").find("input[name=price]");
        let date1 = new Date(date.val());
        let pubDate =(date1.getMonth() + 1) + '/' + date1.getDate() + '/' +  date1.getFullYear();
        $("#buttonEditAd").click(()=> {
            let req = {
                url: `https://baas.kinvey.com/appdata/kid_Hyqv8UNv-/Prodavachnik/${ad}`,
                method: "PUT",
                headers: {
                    "Authorization": "Kinvey " + localStorage.getItem("authToken")
                },
                data: {
                    "title": title.val(),
                    "description": des.val(),
                    "datePublished": pubDate,
                    "price": Number(price.val()).toFixed(2),
                    "author": localStorage.getItem("username")
                },
                success: () => {
                    infoBox("Edited.");
                    listReq();
                    displayCurrSetting("listAds");
                },
                error: errorBox
            };
            $.ajax(req)
        });

    }
    }
    
    function createAdv() {
    let title = $("#formCreateAd").find("input[name=title]");
    let des =$("#formCreateAd").find("textarea[name=description]");
    let date = $("#formCreateAd").find("input[name=datePublished]");
    let price = $("#formCreateAd").find("input[name=price]");
    let date1 = new Date(date.val());
        let pubDate =(date1.getMonth() + 1) + '/' + date1.getDate() + '/' +  date1.getFullYear();

        let req = {
            url : `https://baas.kinvey.com/appdata/kid_Hyqv8UNv-/Prodavachnik`,
            method: "POST",
            headers: {
                "Authorization": "Kinvey "+ localStorage.getItem("authToken")
            },
            data: {
            "title": title.val(),
            "description": des.val(),
            "datePublished": pubDate,
            "price": Number(price.val()).toFixed(2),
            "author": localStorage.getItem("username")
            },
            beforeSend: loadingBox("Creating new ad..."),
            success: infoBox("Ad created!"),
            error: errorBox
        };

        $.ajax(req);
        title.val("")
        des.val("")
        date.val("")
        price.val("")
    }
    let notBox = $("#loadingBox");
    function loadingBox(message) {

        notBox.text(message);
        notBox.fadeIn();
        setTimeout(()=> notBox.fadeOut(),2500);
    }
    function errorBox(err) {
        notBox.hide();
        let box = $("#errorBox");
        console.log(err);
        if (err.readyState === 4) {
            box.text(err.responseJSON.description);
        }
        else if (err.readyState === 0) {
            box.text("An unexpected error has occurred!");
        }

        box.show();
        $("body").on("click",()=>{box.fadeOut()});
    }
    function infoBox(message) {
        notBox.hide();
        let box = $("#infoBox");
        box.text(message);
        box.fadeIn();
        setTimeout(()=> box.fadeOut(),1000);
    }

}