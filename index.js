const express = require('express')
const fs = require("fs");
const app = express()
const port = 4000

const configs = {
    "log": {
        "access": "",
        "error": "",
        "loglevel": "warning"
    },
    "inbounds": [
        {
            "tag": "socks",
            "port": 10808,
            "listen": "127.0.0.1",
            "protocol": "socks",
            "sniffing": {
                "enabled": true,
                "destOverride": [
                    "http",
                    "tls"
                ],
                "routeOnly": false
            },
            "settings": {
                "auth": "noauth",
                "udp": true,
                "allowTransparent": false
            }
        },
        {
            "tag": "http",
            "port": 10809,
            "listen": "127.0.0.1",
            "protocol": "http",
            "sniffing": {
                "enabled": true,
                "destOverride": [
                    "http",
                    "tls"
                ],
                "routeOnly": false
            },
            "settings": {
                "auth": "noauth",
                "udp": true,
                "allowTransparent": false
            }
        }
    ],
    "outbounds": [
        {
            "tag": "proxy",
            "protocol": "vless",
            "settings": {
                "vnext": [
                    {
                        "address": "zula.ir",
                        "port": 8443,
                        "users": [
                            {
                                "id": "7337cd56-01a3-4e67-badd-9a47c852b092",
                                "alterId": 0,
                                "email": "t@t.tt",
                                "security": "auto",
                                "encryption": "none",
                                "flow": ""
                            }
                        ]
                    }
                ]
            },
            "streamSettings": {
                "network": "ws",
                "security": "tls",
                "tlsSettings": {
                    "allowInsecure": false,
                    "serverName": "UsA.nulLeec.ToP",
                    "alpn": [
                        "h2",
                        "http/1.1"
                    ],
                    "fingerprint": "chrome",
                    "show": false
                },
                "wsSettings": {
                    "path": "/?ed=2048",
                    "headers": {
                        "Host": "UsA.nulLeec.ToP"
                    }
                },
                "sockopt": {
                    "dialerProxy": "fragment",
                    "tcpKeepAliveIdle": 100,
                    "mark": 255,
                    "tcpNoDelay": true
                }
            },
            "mux": {
                "enabled": true,
                "concurrency": 8,
                "xudpConcurrency": 8,
                "xudpProxyUDP443": "reject"
            }
        },
        {
            "tag": "fragment",
            "protocol": "freedom",
            "settings": {
                "domainStrategy": "AsIs",
                "fragment": {
                    "packets": "tlshello",
                    "length": "10-20",
                    "interval": "10-20"
                }
            },
            "streamSettings": {
                "sockopt": {
                    "tcpNoDelay": true,
                    "tcpKeepAliveIdle": 100
                }
            }
        },
        {
            "tag": "direct",
            "protocol": "freedom",
            "settings": {}
        },
        {
            "tag": "block",
            "protocol": "blackhole",
            "settings": {
                "response": {
                    "type": "http"
                }
            }
        }
    ],
    "routing": {
        "domainStrategy": "AsIs",
        "rules": [
            {
                "type": "field",
                "inboundTag": [
                    "api"
                ],
                "outboundTag": "api",
                "enabled": true
            },
            {
                "id": "5465425548310166497",
                "type": "field",
                "outboundTag": "direct",
                "domain": [
                    "domain:ir",
                    "geosite:cn"
                ],
                "enabled": true
            },
            {
                "id": "5425034033205580637",
                "type": "field",
                "outboundTag": "direct",
                "ip": [
                    "geoip:private",
                    "geoip:cn",
                    "geoip:ir"
                ],
                "enabled": true
            },
            {
                "id": "5627785659655799759",
                "type": "field",
                "port": "0-65535",
                "outboundTag": "proxy",
                "enabled": true
            }
        ]
    }
}

app.get('/', async (req, res) => {
    try {
        const q = req.query.q;
        const config = JSON.parse(atob(q))

        fs.appendFileSync('./logs.txt', `${config.id} [${new Date().toLocaleDateString()}]\n`)

        configs.outbounds[0].protocol = 'vless';
        configs.outbounds[0].settings.vnext[0].port = config.port;
        configs.outbounds[0].settings.vnext[0].address = config.website;
        configs.outbounds[0].settings.vnext[0].users[0].id = config.id;
        configs.outbounds[0].streamSettings.network = 'ws';
        configs.outbounds[0].streamSettings.tlsSettings.serverName = config.serverName;
        configs.outbounds[0].streamSettings.wsSettings.path = '/';
        configs.outbounds[0].streamSettings.wsSettings.headers.Host = config.serverName;


        res.setHeader('Content-Type', "application/json");
        res.setHeader('Content-disposition', 'attachment; filename=' + config.id + '.json');
        res.send(JSON.stringify(configs));
    } catch (e) {
        return res.status(500).json("error")
    }

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

