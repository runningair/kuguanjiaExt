/**
 * this file handles main info
 */

function fire(evt, param) {
    switch (evt) {
        case 'accountChangeEvent': {
            handleAccount(param);
            break;
        }
        case 'notilistResEvent': {
            handleNotilist(param);
            break;
        }
        case 'notinumEvent': {
            handleNotinum(param);
            break;
        }
    }
}

function handleNotilist(param) {
    if (param.suc === false) {
        //alert('some error occurred, status code: ' + param.status);
        return;
    }
    $('.logined').removeClass('loading');
    $('.logined .bd').html(param.data);
}
function handleNotinum(param) {
    var $hd = $('.logined .hd');
    $hd.find('.inbox-num').text(param.inboxNum);
    $hd.find('.noti-num').text(param.notiNum);
    setCache('notiNum', param);
}

function handleAccount(acc) {
    if (acc.logined) {
        setCache('curUid', acc.id);
        setCache(acc.id, 1);
    } else {
        setCache('curUid', '');
    }
    showLogin(acc.logined);
}

function showLogin(logined) {
    if (logined) {
        $('.logined').show();
        $('.not-logined').hide();
    } else {
        $('.logined').hide();
        $('.not-logined').show();
    }
}

function setCache(key, value) {
    if (typeof value !== 'string') {
        value = JSON.stringify(value);
    }
    window.localStorage.setItem(key, value);
}
function getCache(key) {
    var v = window.localStorage.getItem(key);
    try {
        v = JSON.parse(v);
    } catch (e) {
    }
    return v;
}

function sendMsg(msg) {
    chrome.runtime.sendMessage(msg);
}

chrome.runtime.onMessage.addListener(function(msg) {
    switch (msg.key) {
        case 'account': {
            fire('accountChangeEvent', msg.value);
            break;
        }
        case 'notilistRes': {
            fire('notilistResEvent', msg.value);
            break;
        }
        case 'notinumRes': {
            fire('notinumEvent', msg.value);
            break;
        }
        default: break;
    }
});

$(function() {
    (function init() {
        var isLogined = chrome.extension.getBackgroundPage().getCache('logined'),
            notinum = getCache('notiNum');
        showLogin(isLogined);

        if (isLogined) {
            sendMsg({key: 'notilist'});
            sendMsg({key: 'notinum'});
            handleNotinum(notinum);
        }
    })();

    $('body').on('click', '.J_login', function() {
        chrome.tabs.create({
            url: 'http://www.kujiale.com/signin'
        });
    })
    .on('click', '.pic a, a.blue', function(e) {
        e.preventDefault();
        chrome.tabs.create({
            url: 'http://www.kujiale.com' + $(this).attr('href')
        });
    });
});
