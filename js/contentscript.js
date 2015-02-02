/**
 * this file handles account information
 */




function sendMsg(msg) {
    chrome.runtime.sendMessage(msg);
}

$(function() {
    var userName = $('#header #login .info').attr('title');
    if (userName) {
        sendMsg({
            key: 'account',
            value: {
                id: $.cookie('email'),
                name: userName,
                logined: true
            }
        })
    } else {
        sendMsg({
            key: 'account',
            value: {
                logined: false
            }
        })
    }
});
