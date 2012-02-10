var config = {}

config.server = {
    port: 8000
}

config.app = {
    sio: {
        log_level: 1,
        transports: ['websocket', 'xhr-polling', 'jsonp-polling']
    },
    sessionKey: 'asaoiofbiafoiwoiewkjwnvs'
}

module.exports = config
