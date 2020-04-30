import tailfd from 'tailfd'
import dotenvSafe from 'dotenv-safe'
import fetch from 'node-fetch'
import authenticationLogLineParser from './authenticationLogLineParser.mjs'

dotenvSafe.config()

const {
    FRIEND_REGEX,
    PUSH_TARGET,
    MUMBLE_LOG_FILE,
} = process.env

const interestingUsersRegex = new RegExp(FRIEND_REGEX)

async function handleLogLine(line, tailInfo) {
    console.info(line)

    let parsedLine
    try {
        parsedLine = authenticationLogLineParser.parse(line)
    } catch (err) {
        return // not an authentication event
    }

    const { logLevel, timestamp, serverNum, authedUserInfo } = parsedLine
    const { connID, username, UID } = authedUserInfo

    // const { username, timestamp } = result.groups

    // not an interesting user
    if (!username.match(interestingUsersRegex))
        return

    // https://github.com/mashlol/notify/blob/59b51d215018d9c7de3abf3e903ae4633c54cc69/node/notify.js#L6
    const notificationSendURL = new URL('https://us-central1-notify-b7652.cloudfunctions.net/sendNotification')
    const { searchParams } = notificationSendURL
    searchParams.set('to', PUSH_TARGET)
    searchParams.set('title', `${username} connected to mumble.`)
    searchParams.set('text', (new Date).toJSON())

    console.info(`Notifying ${PUSH_TARGET}...`)

    const resp = await fetch(notificationSendURL)

    if (!resp.ok)
        throw new Error(`Notification API Error: ${resp.status} ${resp.statusText}.`)

    const respData = await resp.json()

    if (!respData.success)
        throw new Error(`Notification failed: ${respData.error}`)

    console.info('Notification sent.')
}

const logErrors = func =>
    async (...args) => {
        try { await func(...args) }
        catch (err) { console.error(String(err)) }
    }

const watcher = tailfd(MUMBLE_LOG_FILE, logErrors(handleLogLine))

console.info(`Watching ${MUMBLE_LOG_FILE}`)
