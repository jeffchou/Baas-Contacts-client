var registerProfileEvents = function() {
    var $upload = $("#upload-face-img");
    $upload.hover(
        function() {
            $(this).find("div.float-buttom").fadeTo(200, 0.5);
        },function() {
            $(this).find("div.float-buttom").fadeTo(200, 0.0);
        });

    $upload.find("input").on("change", uploadImg);
};

var renderProfile = function(userInfo) {
    $.print("userInfo:");
    $.print(userInfo);
    $("#profile-name").text(userInfo.user.name);
    $("#profile-intro").text(userInfo.user.intro);
    var joinDate = new Date(userInfo.signUpDate);
    $("#prfile-join-date").text(joinDate.toLocaleDateString());
    if (userInfo.visibleByAnonymousUsers)
        displayProfileImg(userInfo.visibleByAnonymousUsers.profileImg);

    var rawInfo = {};
    for(var key in userInfo) {
        if (key.indexOf("visibleBy") > -1) {
            $.extend(rawInfo, userInfo[key]);
        }
    }

    var text = "<p>";
    for(var key in rawInfo) {
        text += key + " : " + rawInfo[key] + " <br />";
    }
    text += "</p>";
    $("#profile-intro").html(text);
};

var updateProfileImg = function (imgId) {
    userInfo.visibleByAnonymousUsers.profileImg = imgId;
    BaasBox.updateUserProfile(userInfo);
};

var uploadImg = function(e) {
    var files = e.target.files;
    if (files.length < 0) return;
    var file = files[0];
    if (!file.type.match('image.*')) {
        $.notify(file.name + " is not a image");
        return;
    }

    var formData = new FormData();
    formData.append("upload", file, file.name);

    $.notify("Uploading " + file.name + "...");
    BaasBox.uploadFile(formData)
        .done(function(res){
            $.notify("Upload " + file.name + " success.");
            var info = JSON.parse(res);
            var imgId = info.data.id;
            displayProfileImg(imgId);
            updateProfileImg(imgId);
        })
        .fail(function(error){
            var info = JSON.parse(error.responseText);
            var message = info.message;
            $.notify("Error on uploading image. message: " + message);
        });
};

var displayProfileImg = function(imgId){
    if (!imgId) return;
    BaasBox.fetchFile(imgId, true)
        .done(function(res){
            $("#profile-face-thumb img").attr("src", this.url);
        });
};