{
    const toInt = match => parseInt(match.join(''), 10)
    const toStr = match => match.flat(Infinity).join('')
}

line =
    logLevel:logLevel
    timestamp:timestamp s
    serverNum:serverNum
    s '=>' s
    authedUserInfo:authedUserInfo s
    'Authenticated'
    {
        return { logLevel, timestamp, serverNum, authedUserInfo }
    }

s = [ ]+ // whitespace
d = [0-9]
signedInt = '-'? d+

logLevel = '<' letter:[a-z]i '>' { return letter }
serverNum = num:signedInt { return parseInt(num, 10) }

timestamp = timestamp:(date s time) { return new Date(toStr(timestamp)) }
date = year:(d d d d) '-' month:(d d) '-' day:(d d)
time = hour:(d d) ':' minute:(d d) ':' second:(d d) '.' millisecond:(d d d)

authedUserInfo = '<' connID:signedInt ':' username:[^(]+ '(' UID:signedInt ')>' {
    connID = toInt(connID)
    username = toStr(username)
    UID = toInt(UID)
    return { connID, username, UID }
}
