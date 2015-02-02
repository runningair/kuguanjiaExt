// get and store account information
/*var AccountInfo = function() {
    var instance = null;
    return function(initInfo) {
        if (instance === null) {
            instance = this;
        }
        if (typeof initInfo === 'object') {
            this.account = initInfo;
        } else {
            this.account = getCache(getCache('curUid'));
        }
        typeof this.account === 'object' || (this.account = {});
    };
}();
AccountInfo.prototype = {
    isLogined: function() {
        return this.account.logined;
    },
    getAccount: function() {
        return this.account;
    },
    setAccount: function(account) {
        account.id && (this.account.id = account.id);
        account.name && (this.account.name = account.name);
        account.logined && (this.account.logined = account.logined);
        setCache('curUid', this.account.id);
        setCache(account.id, account);
    }
};
*/

/**
 * this file handles polling and fire instant notification
 */

var timerId = null,
    notiNum = null;

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

function fire(evt, param) {
    switch(evt) {
        case 'accountChangeEvent': {
            // if account login again, start polling
            param.logined && timerId && pollNoti();
            setCache('logined', param.logined);
            break;
        }
        case 'notinumReqEvent': {
            fetchNotinum();
            break;
        }
        case 'notiNumResEvent': {
            handleNotiNum(param);
            break;
        }
        case 'notilistReqEvent': {
            fetchNotilist();
            break;
        }
        default: {
            return;
        }
    }
};

function sendMsg(msg) {
    chrome.runtime.sendMessage(msg)
}

function handleNotiNum(param) {
    var res = JSON.parse(param);
    if (notiNum === null) {
        notiNum = res;
        return;
    }
    if (notiNum.inboxNum < res.inboxNum) {
       newNotiOrInbox(1);
    }
    if (notiNum.notiNum < res.notiNum) {
       newNotiOrInbox(0);
    }
    notiNum = res;
    console.log(notiNum)
    sendMsg({
        key: 'notinumRes',
        value: notiNum
    })
}
function newNotiOrInbox(type) {
    var noti,
        config = {
            icon: 'icon.png'
        },
        link;
    // notification
    if (type === 0) {
        config.body = '您在酷家乐有一条新通知';
        link = 'http://www.kujiale.com/u/notice';
    } else if (type === 1) {
        config.body = '您在酷家乐有一条新私信'
        link = 'http://www.kujiale.com/u/inbox';
    } else {
        return;
    }
    noti = new Notification('酷管家通知', config);
    noti.onclick = function() {
        chrome.tabs.create({url: link});
        fetchNotilist();
    }
}

function fetchNotilist() {
    $.ajax({
        url: 'http://www.kujiale.com/api/notilist',
        cache: false,
        type: 'get',
        success: function(data) {
            sendMsg({
                key: 'notilistRes',
                value: {
                    suc: true,
                    data: data
                }
            });
        },
        error: function(xhr) {
            sendMsg({
                key: 'notilistRes',
                value: {
                    suc: false,
                    status: xhr.status
                }
            });
        }
    });
}

function pollNoti() {
    fetchNotinum();
    timerId = setTimeout(function() {
        fetchNotinum();
        pollNoti();
    }, 20000);
};
function fetchNotinum() {
    $.ajax({
        url: 'http://www.kujiale.com/api/notinums',
        cache: false,
        type : 'get',
        success: function(data) {
            fire('notiNumResEvent', data);
        },
        error: function(xhr) {
            clearTimeout(timerId)
        }
    });
}

(function start() {
    chrome.runtime.onMessage.addListener(function(msg) {
        switch(msg.key) {
            case 'account': {
                fire('accountChangeEvent', msg.value);
                break;
            }
            case 'notilist': {
                fire('notilistReqEvent');
            }
            case 'notinum': {
                fire('notinumReqEvent');
            }
        }
    });
    pollNoti();
})();
