import { connect } from 'cloudflare:sockets';
const listProxy = [
	{ path: '/akamai', proxy: '172.232.238.169' }, // Akamai (Global CDN, tidak spesifik negara)
	{ path: '/kr', proxy: '52.141.25.42'}, // Korea Selatan - Microsoft Azure (Cloud Provider)
	{ path: '/us', proxy: '91.186.208.191'}, // Amerika Serikat - M247 Ltd
	{ path: '/do', proxy: '188.166.255.195' }, // Singapura - DigitalOcean
	{ path: '/do2', proxy: '143.198.213.197' }, // Singapura - DigitalOcean
	{ path: '/incapsula', proxy: '45.60.186.91' }, // Amerika Serikat - Incapsula (Imperva)
	{ path: '/ovh', proxy: '15.235.162.49' }, // Kanada - OVHcloud
	{ path: '/ore', proxy: '138.2.94.123' }, // Singapura - Oracle Cloud
	{ path: '/do3', proxy: '104.248.145.216' }, // Singapura - DigitalOcean
	{ path: "/akamai1", proxy: "172.232.239.219:587" }, // Akamai 🇮🇩
	{ path: "/akamai2", proxy: "172.232.252.119:587" }, // Akamai 🇮🇩
	{ path: "/akamai3", proxy: "172.232.249.190:587" }, // Akamai 🇮🇩
	{ path: "/akamai4", proxy: "172.232.238.103:587" }, // Akamai 🇮🇩
	{ path: "/akamai5", proxy: "172.232.239.151:587" }, // Akamai 🇮🇩
	{ path: "/akamai6", proxy: "172.232.252.106:587" }, // Akamai 🇮🇩
	{ path: "/akamai7", proxy: "172.232.239.24:587" },  // Akamai 🇮🇩
	{ path: "/ucloud", proxy: "165.154.48.233:587" },   // Ucloud Information Technology Hk 🇮🇩
	{ path: "/akamai8", proxy: "172.232.239.10:587" },  // Akamai 🇮🇩
	{ path: "/akamai9", proxy: "172.232.239.56:587" },  // Akamai 🇮🇩
	{ path: "/cloudteknologinusantara1", proxy: "103.133.223.50:2096" }, // Cloud Teknologi Nusantara 🇮🇩
	{ path: "/cloudteknologinusantara2", proxy: "103.133.223.51:2096" }, // Cloud Teknologi Nusantara 🇮🇩
	{ path: "/akamai10", proxy: "172.232.238.169:443" }, // Akamai 🇮🇩
	{ path: "/akamai11", proxy: "172.232.252.101:587" }, // Akamai 🇮🇩
	{ path: "/akamai12", proxy: "172.232.234.10:587" }, // Akamai 🇮🇩
	{ path: "/akamai13", proxy: "172.232.239.235:587" }, // Akamai 🇮🇩
	{ path: "/akamai14", proxy: "172.232.252.35:587" },  // Akamai 🇮🇩
	{ path: "/akamai15", proxy: "172.232.234.189:587" }, // Akamai 🇮🇩
	{ path: "/akamai16", proxy: "172.232.234.119:587" }, // Akamai 🇮🇩
	{ path: "/akamai17", proxy: "172.232.238.169:587" }, // Akamai 🇮🇩
	{ path: "/tencent", proxy: "43.133.145.156:53136" }, // Tencent cloud computing 🇮🇩
	{ path: "/alibaba1", proxy: "8.215.23.33:587" },    // Alibaba 🇮🇩
	{ path: "/alibaba2", proxy: "8.215.23.109:587" },   // Alibaba 🇮🇩
	{ path: "/cloudteknologinusantara3", proxy: "103.133.223.52:2096" }, // Cloud Teknologi Nusantara 🇮🇩
	{ path: "/akamai18", proxy: "172.232.252.108:587" }, // Akamai 🇮🇩
	{ path: "/akamai19", proxy: "172.232.234.33:587" },  // Akamai 🇮🇩
	{ path: "/ptbeonmultimedia", proxy: "101.50.0.114:8443" }, // PT Beon Multimedia 🇮🇩
	{ path: "/rumahweb", proxy: "203.194.112.119:2053" }, // Rumahweb 🇮🇩
	{ path: "/amazon", proxy: "43.218.79.114:2053" },    // AMAZONCOM INC 🇮🇩
	{ path: "/google1", proxy: "35.219.50.99:443" },     // Google LLC 🇮🇩
	{ path: '/dany', proxy: '188.166.255.195' }, // Singapura - DigitalOcean
	{ path: "/google2", proxy: "35.219.15.90:443" },     // Google LLC 🇮🇩  
];
let proxyIP;
export default {
    async fetch(request, ctx) {
      try {
        proxyIP = proxyIP;
        const url = new URL(request.url);
        const upgradeHeader = request.headers.get('Upgrade');
        for (const entry of listProxy) {
          if (url.pathname === entry.path) {
            proxyIP = entry.proxy;
            break;
          }
        }
        if (upgradeHeader === 'websocket' && proxyIP) {
          return await vlessOverWSHandler(request);
        }
        const allConfig = await getAllConfigVless(request.headers.get('Host'));
        return new Response(allConfig, {
          status: 200,
          headers: { "Content-Type": "text/html;charset=utf-8" },
        });
      } catch (err) {
        return new Response(err.toString(), { status: 500 });
      }
    },
  };


async function getAllConfigVless(hostName) {
    try {
        let vlessConfigs = '';
        let clashConfigs = '';
        for (const entry of listProxy) {
            const { path, proxy } = entry;
            const response = await fetch(`http://ip-api.com/json/${proxy}`);
            const data = await response.json();
            const pathFixed = encodeURIComponent(path);
            const vlessTls = `vless://${generateUUIDv4()}\u0040${hostName}:443?encryption=none&security=tls&sni=${hostName}&type=ws&host=${hostName}&path=${pathFixed}#${data.isp} (${data.countryCode})`;
            const vlessNtls = `vless://${generateUUIDv4()}\u0040${hostName}:80?path=${pathFixed}&security=none&encryption=none&host=${hostName}&type=ws&sni=${hostName}#${data.isp} (${data.countryCode})`;
            const vlessTlsFixed = vlessTls.replace(/ /g, '+');
            const vlessNtlsFixed = vlessNtls.replace(/ /g, '+');
            const clashConfTls = 
`- name: ${data.isp} (${data.countryCode}) ${proxy}
  server: ${hostName}
  port: 443
  type: vless
  uuid: ${generateUUIDv4()}
  cipher: auto
  tls: true
  skip-cert-verify: true
  network: ws
  servername: ${hostName}
  ws-opts:
    path: ${path}
    headers:
      Host: ${hostName}
  udp: true`;
             const clashConfNtls =
`- name: ${data.isp} (${data.countryCode}) ${proxy}
  server: ${hostName}
  port: 80
  type: vless
  uuid: ${generateUUIDv4()}
  cipher: auto
  tls: false
  skip-cert-verify: true
  network: ws
  ws-opts:
    path: ${path}
    headers:
      Host: ${hostName}
  udp: true`;
            clashConfigs += `
<div style="display: none;">
   <textarea id="clashTls${path}">${clashConfTls}</textarea>
 </div>
<div style="display: none;">
   <textarea id="clashNtls${path}">${clashConfNtls}</textarea>
 </div>
<div class="config-section" style="background-color: rgba(10, 10, 10, 0.8); color: #00ff00; border: 2px solid #00ff00;">
    <p style="color: #00ff00;"><strong>ISP:</strong> ${data.isp} (${data.countryCode})</p>
    <p style="color: #00ff00;"><strong>IP Proxy:</strong> ${proxy}</p>
    <hr style="border-color: #00ff00; width: 100%; margin-left: auto; margin-right: auto;" />
    <div class="config-toggle">
        <button class="button" onclick="toggleConfig(this, 'Tap Here To Show Configurations', 'Tap Here To Hide')">Tap Here To Show Configurations</button>
        <div class="config-content">
            <div class="config-block" style="background-color: rgba(0, 0, 0, 0.3);">
                <h3 style="color: #00ff00;">TLS:</h3>
                <p class="config">${clashConfTls}</p>
                <button class="button" onclick='copyClash("clashTls${path}")'><i class="fa fa-clipboard"></i>Copy</button>
            </div>
            <hr style="border-color: #00ff00; width: 75%; margin-left: auto; margin-right: auto;" />
            <div class="config-block" style="background-color: rgba(0, 0, 0, 0.3);">
                <h3 style="color: #00ff00;">NTLS:</h3>
                <p class="config">${clashConfNtls}</p>
                <button class="button" onclick='copyClash("clashNtls${path}")'><i class="fa fa-clipboard"></i>Copy</button>
            </div>
        </div>
    </div>
</div>
<hr class="config-divider" style="background: linear-gradient(to right, transparent, #00ff00, transparent); margin: 40px 0;" />
`;

vlessConfigs += `
<div class="config-section" style="background-color: rgba(10, 10, 10, 0.8); color: #00ff00; border: 2px solid #00ff00;">
    <p style="color: #00ff00;"><strong>ISP:</strong> ${data.isp} (${data.countryCode})</p>
    <p style="color: #00ff00;"><strong>IP Proxy:</strong> ${proxy}</p>
    <hr style="border-color: #00ff00; width: 100%; margin-left: auto; margin-right: auto;" />
    <div class="config-toggle">
        <button class="button" onclick="toggleConfig(this, 'Tap Here To Show Account', 'Tap Here To Hide')">Tap Here To Show Account</button>
        <div class="config-content">
            <div class="config-block" style="background-color: rgba(0, 0, 0, 0.3);">
                <h3 style="color: #00ff00;">TLS:</h3>
                <p class="config" style="color: #00ff00;">${vlessTlsFixed}</p>
                <button class="button" onclick='copyToClipboard("${vlessTlsFixed}")'><i class="fa fa-clipboard"></i>Copy</button>
            </div>
            <hr style="border-color: #00ff00; width: 75%; margin-left: auto; margin-right: auto;" />
            <div class="config-block" style="background-color: rgba(0, 0, 0, 0.3);">
                <h3 style="color: #00ff00;">NTLS:</h3>
                <p class="config" style="color: #00ff00;">${vlessNtlsFixed}</p>
                <button class="button" onclick='copyToClipboard("${vlessNtlsFixed}")'><i class="fa fa-clipboard"></i>Copy</button>
            </div>
        </div>
    </div>
</div>
<hr class="config-divider" style="background: linear-gradient(to right, transparent, #00ff00, transparent); margin: 40px 0;" />
`;
}
        const htmlConfigs = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLOUDFLARE PROXY</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" integrity="sha512-Fo3rlrZj/k7ujTnHg4C+6PCWJ+8zzHcXQjXGp6n5Yh9rX0x5fOdPaOqO+e2X4R5C1aE/BSqPIG+8y3O6APa8w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
        body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', monospace;
    background-color: #0c0c0c;
    color: #00ff00;
    display: flex;
    flex-direction: column;
    height: 100vh;
}
.container {
    height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 0;
    padding: 30px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: fadeIn 1s ease-in-out;
    overflow-y: auto;
    box-sizing: border-box;
}
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: -1;
        }
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
        }
.header {
    text-align: center;
    margin-bottom: 20px;
        }
.profile-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
		}
.profile-pic {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    margin: 0;
		}
.profile-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}
.profile-name {
    color: #00ff00;
    font-size: 20px;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 3px;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.7);
}
.header h1 {
    font-size: 24px;
    text-align: center;
    text-transform: uppercase;
    margin: 0;
    text-shadow: 0 0 10px #00ff00;
        }
.nav-buttons {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
    gap: 20px;
        }
.nav-buttons .button {
    background-color: transparent;
    border: 2px solid #00ff00;
    color: #00ff00;
    padding: 6px 12px;
    font-size: 10px;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
        }
.nav-buttons .button:hover {
    background-color: #00ff00;
    color: black;
    transform: scale(1.05);
        }
.content {
    display: none;
        }
.content.active {
    display: block;
        }
.config-section {
    background: rgba(255, 255, 255, 0.1);
    padding: 10px;
    margin-bottom: 20px;
    position: relative;
    animation: slideIn 0.5s ease-in-out;
        }
@keyframes slideIn {
    from { transform: translateX(-30px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
        }
.config-section h3 {
    margin-top: 0;
    color: #00ff00; 
    font-size: 28px;
        }
.config-section p {
    color: #00ff00;
    font-size: 16px;
        }
.config-toggle {
    margin-bottom: 20px;
        }
.config-content {
    display: none;
        }
.config-content.active {
    display: block;
        }
.config-block {
    margin-bottom: 20px;
    padding: 15px;
    background-color: rgba(0, 0, 0, 0.3);
    transition: background-color 0.3s ease;
        }
.config-block h4 {
    margin-bottom: 8px;
    color: #00ff00; 
    font-size: 22px;
    font-weight: 600;
        }
.config {
    background-color: rgba(0, 0, 0, 0.4);
    padding: 10px;
    border-radius: 0;
    border: 1px solid #00ff00;
    color: #f5f5f5;
    word-wrap: break-word;
    white-space: pre-wrap;
    font-family: 'Courier New', Courier, monospace;
    font-size: 15px;
        }
.button {
    background-color: transparent;
    color: #00ff00;
    border: 2px solid #00ff00;
    padding: 10px 20px;
    margin: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
        }
.button i {
    margin-right: 3px;
        }
.button:hover {
    background-color: #00ff00;
    color: black;
        }
.config-divider {
    border: none;
    height: 1px;
    background: linear-gradient(to right, transparent, #00ff00, transparent);
    margin: 40px 0;
        }
@media (max-width: 768px) {
    .header h1 {
        font-size: 28px;
    }
    .config-section h3 {
        font-size: 24px;
    }
    .config-block h4 {
        font-size: 20px;
    }
        }
    </style>
</head>
<body>
    <div class="overlay"></div>
    <div class="container">
        <div class="header">
            <div class="profile-container">
				<h2 class="profile-name">DANY PRATMANTO</h2>
			</div>
        </div>
        <div class="nav-buttons">
            <button class="button" onclick="showContent('vless')">VLESS MENU</button>
            <button class="button" onclick="showContent('clash')">CLASH MENU</button>
			<button class="button" onclick="showContent('info')">INFO</button>
        </div>
        <div id="vless" class="content active">
            ${vlessConfigs}
        </div>
        <div id="clash" class="content">
            ${clashConfigs}
        </div>
		<div id="info" class="content">
			<p>Workers ini baru support wildcard <strong>support.zoom.us</strong></p>
			
		</div>
    </div>

    <script>
        function showContent(contentId) {
            const contents = document.querySelectorAll('.content');
            contents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(contentId).classList.add('active');
        }
        function salinTeks() {
            var teks = document.getElementById('teksAsli');
            teks.select();
            document.execCommand('copy');
            alert('Teks telah disalin.');
        }
        function copyClash(elementId) {
            const text = document.getElementById(elementId).textContent;
            navigator.clipboard.writeText(text)
            .then(() => {
                const alertBox = document.createElement('div');
                alertBox.textContent = "Copied to clipboard!";
                alertBox.style.position = 'fixed';
                alertBox.style.bottom = '20px';
                alertBox.style.right = '20px';
                alertBox.style.backgroundColor = 'green';
                alertBox.style.color = '#fff';
                alertBox.style.padding = '10px 20px';
                alertBox.style.borderRadius = '5px';
                alertBox.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                alertBox.style.opacity = '0';
                alertBox.style.transition = 'opacity 0.5s ease-in-out';
                document.body.appendChild(alertBox);
                setTimeout(() => {
                    alertBox.style.opacity = '1';
                }, 100);
                setTimeout(() => {
                    alertBox.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(alertBox);
                    }, 500);
                }, 2000);
            })
            .catch((err) => {
                console.error("Failed to copy to clipboard:", err);
            });
        }
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    const alertBox = document.createElement('div');
                    alertBox.textContent = "Copied to clipboard!";
                    alertBox.style.position = 'fixed';
                    alertBox.style.bottom = '20px';
                    alertBox.style.right = '20px';
                    alertBox.style.backgroundColor = 'green';
                    alertBox.style.color = '#fff';
                    alertBox.style.padding = '10px 20px';
                    alertBox.style.borderRadius = '5px';
                    alertBox.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    alertBox.style.opacity = '0';
                    alertBox.style.transition = 'opacity 0.5s ease-in-out';
                    document.body.appendChild(alertBox);
                    setTimeout(() => {
                        alertBox.style.opacity = '1';
                    }, 100);
                    setTimeout(() => {
                        alertBox.style.opacity = '0';
                        setTimeout(() => {
                            document.body.removeChild(alertBox);
                        }, 500);
                    }, 2000);
                })
                .catch((err) => {
                    console.error("Failed to copy to clipboard:", err);
                });
        }

        function toggleConfig(button, show, hide) {
            const configContent = button.nextElementSibling;
            if (configContent.classList.contains('active')) {
                configContent.classList.remove('active');
                button.textContent = show;
            } else {
                configContent.classList.add('active');
                button.textContent = hide;
            }
        }
    </script>
</body>
</html>`;
        return htmlConfigs;
    } catch (error) {
        return `An error occurred while generating the VLESS configurations. ${error}`;
    }
}
function generateUUIDv4() {
  const randomValues = crypto.getRandomValues(new Uint8Array(16));
  randomValues[6] = (randomValues[6] & 0x0f) | 0x40;
  randomValues[8] = (randomValues[8] & 0x3f) | 0x80;
  return [
    randomValues[0].toString(16).padStart(2, '0'),
    randomValues[1].toString(16).padStart(2, '0'),
    randomValues[2].toString(16).padStart(2, '0'),
    randomValues[3].toString(16).padStart(2, '0'),
    randomValues[4].toString(16).padStart(2, '0'),
    randomValues[5].toString(16).padStart(2, '0'),
    randomValues[6].toString(16).padStart(2, '0'),
    randomValues[7].toString(16).padStart(2, '0'),
    randomValues[8].toString(16).padStart(2, '0'),
    randomValues[9].toString(16).padStart(2, '0'),
    randomValues[10].toString(16).padStart(2, '0'),
    randomValues[11].toString(16).padStart(2, '0'),
    randomValues[12].toString(16).padStart(2, '0'),
    randomValues[13].toString(16).padStart(2, '0'),
    randomValues[14].toString(16).padStart(2, '0'),
    randomValues[15].toString(16).padStart(2, '0')
].join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}
async function vlessOverWSHandler(request) {
	const webSocketPair = new WebSocketPair();
	const [client, webSocket] = Object.values(webSocketPair);
	webSocket.accept();
	let address = '';
	let portWithRandomLog = '';
	const log = (info, event) => {
		console.log(`[${address}:${portWithRandomLog}] ${info}`, event || '');
	};
	const earlyDataHeader = request.headers.get('sec-websocket-protocol') || '';
	const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);
	let remoteSocketWapper = {
		value: null,
	};
	let udpStreamWrite = null;
	let isDns = false;
	readableWebSocketStream.pipeTo(new WritableStream({
		async write(chunk, controller) {
			if (isDns && udpStreamWrite) {
				return udpStreamWrite(chunk);
			}
			if (remoteSocketWapper.value) {
				const writer = remoteSocketWapper.value.writable.getWriter()
				await writer.write(chunk);
				writer.releaseLock();
				return;
			}
			const {
				hasError,
				message,
				portRemote = 443,
				addressRemote = '',
				rawDataIndex,
				vlessVersion = new Uint8Array([0, 0]),
				isUDP,
			} = processVlessHeader(chunk);
			address = addressRemote;
			portWithRandomLog = `${portRemote}--${Math.random()} ${isUDP ? 'udp ' : 'tcp '
				} `;
			if (hasError) {
				throw new Error(message); 
				return;
			}
			if (isUDP) {
				if (portRemote === 53) {
					isDns = true;
				} else {
					throw new Error('UDP proxy only enable for DNS which is port 53');
					return;
				}
			}
			const vlessResponseHeader = new Uint8Array([vlessVersion[0], 0]);
			const rawClientData = chunk.slice(rawDataIndex);
			if (isDns) {
				const { write } = await handleUDPOutBound(webSocket, vlessResponseHeader, log);
				udpStreamWrite = write;
				udpStreamWrite(rawClientData);
				return;
			}
			handleTCPOutBound(remoteSocketWapper, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, log);
		},
		close() {
			log(`readableWebSocketStream is close`);
		},
		abort(reason) {
			log(`readableWebSocketStream is abort`, JSON.stringify(reason));
		},
	})).catch((err) => {
		log('readableWebSocketStream pipeTo error', err);
	});

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
}
async function handleTCPOutBound(remoteSocket, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, log,) {
	async function connectAndWrite(address, port) {
		const tcpSocket = connect({
			hostname: address,
			port: port,
		});
		remoteSocket.value = tcpSocket;
		log(`connected to ${address}:${port}`);
		const writer = tcpSocket.writable.getWriter();
		await writer.write(rawClientData);
		writer.releaseLock();
		return tcpSocket;
	}
	async function retry() {
		const tcpSocket = await connectAndWrite(proxyIP || addressRemote, portRemote)
		tcpSocket.closed.catch(error => {
			console.log('retry tcpSocket closed error', error);
		}).finally(() => {
			safeCloseWebSocket(webSocket);
		})
		remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, null, log);
	}
	const tcpSocket = await connectAndWrite(addressRemote, portRemote);

	remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, retry, log);
}
function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
	let readableStreamCancel = false;
	const stream = new ReadableStream({
		start(controller) {
			webSocketServer.addEventListener('message', (event) => {
				if (readableStreamCancel) {
					return;
				}
				const message = event.data;
				controller.enqueue(message);
			});
			webSocketServer.addEventListener('close', () => {
				safeCloseWebSocket(webSocketServer);
				if (readableStreamCancel) {
					return;
				}
				controller.close();
			}
			);
			webSocketServer.addEventListener('error', (err) => {
				log('webSocketServer has error');
				controller.error(err);
			}
			);
			const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
			if (error) {
				controller.error(error);
			} else if (earlyData) {
				controller.enqueue(earlyData);
			}
		},
		pull(controller) {
		},
		cancel(reason) {
			if (readableStreamCancel) {
				return;
			}
			log(`ReadableStream was canceled, due to ${reason}`)
			readableStreamCancel = true;
			safeCloseWebSocket(webSocketServer);
		}
	});
	return stream;
}
function processVlessHeader(
	vlessBuffer
) {
	if (vlessBuffer.byteLength < 24) {
		return {
			hasError: true,
			message: 'invalid data',
		};
	}
	const version = new Uint8Array(vlessBuffer.slice(0, 1));
	let isValidUser = true;
	let isUDP = false;
	if (!isValidUser) {
		return {
			hasError: true,
			message: 'invalid user',
		};
	}
	const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];
	const command = new Uint8Array(
		vlessBuffer.slice(18 + optLength, 18 + optLength + 1)
	)[0];
	if (command === 1) {
	} else if (command === 2) {
		isUDP = true;
	} else {
		return {
			hasError: true,
			message: `command ${command} is not support, command 01-tcp,02-udp,03-mux`,
		};
	}
	const portIndex = 18 + optLength + 1;
	const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
	const portRemote = new DataView(portBuffer).getUint16(0);
	let addressIndex = portIndex + 2;
	const addressBuffer = new Uint8Array(
		vlessBuffer.slice(addressIndex, addressIndex + 1)
	);
	const addressType = addressBuffer[0];
	let addressLength = 0;
	let addressValueIndex = addressIndex + 1;
	let addressValue = '';
	switch (addressType) {
		case 1:
			addressLength = 4;
			addressValue = new Uint8Array(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
			).join('.');
			break;
		case 2:
			addressLength = new Uint8Array(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + 1)
			)[0];
			addressValueIndex += 1;
			addressValue = new TextDecoder().decode(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
			);
			break;
		case 3:
			addressLength = 16;
			const dataView = new DataView(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
			);
			const ipv6 = [];
			for (let i = 0; i < 8; i++) {
				ipv6.push(dataView.getUint16(i * 2).toString(16));
			}
			addressValue = ipv6.join(':');
			break;
		default:
			return {
				hasError: true,
				message: `invild  addressType is ${addressType}`,
			};
	}
	if (!addressValue) {
		return {
			hasError: true,
			message: `addressValue is empty, addressType is ${addressType}`,
		};
	}
	return {
		hasError: false,
		addressRemote: addressValue,
		addressType,
		portRemote,
		rawDataIndex: addressValueIndex + addressLength,
		vlessVersion: version,
		isUDP,
	};
}
async function remoteSocketToWS(remoteSocket, webSocket, vlessResponseHeader, retry, log) {
	let remoteChunkCount = 0;
	let chunks = [];
	let vlessHeader = vlessResponseHeader;
	let hasIncomingData = false;
	await remoteSocket.readable
		.pipeTo(
			new WritableStream({
				start() {
				},
				async write(chunk, controller) {
					hasIncomingData = true;
					if (webSocket.readyState !== WS_READY_STATE_OPEN) {
						controller.error(
							'webSocket.readyState is not open, maybe close'
						);
					}
					if (vlessHeader) {
						webSocket.send(await new Blob([vlessHeader, chunk]).arrayBuffer());
						vlessHeader = null;
					} else {
						webSocket.send(chunk);
					}
				},
				close() {
					log(`remoteConnection!.readable is close with hasIncomingData is ${hasIncomingData}`);
				},
				abort(reason) {
					console.error(`remoteConnection!.readable abort`, reason);
				},
			})
		)
		.catch((error) => {
			console.error(
				`remoteSocketToWS has exception `,
				error.stack || error
			);
			safeCloseWebSocket(webSocket);
		});
	if (hasIncomingData === false && retry) {
		log(`retry`)
		retry();
	}
}
function base64ToArrayBuffer(base64Str) {
	if (!base64Str) {
		return { error: null };
	}
	try {
		base64Str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
		const decode = atob(base64Str);
		const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
		return { earlyData: arryBuffer.buffer, error: null };
	} catch (error) {
		return { error };
	}
}
const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;
function safeCloseWebSocket(socket) {
	try {
		if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
			socket.close();
		}
	} catch (error) {
		console.error('safeCloseWebSocket error', error);
	}
}
async function handleUDPOutBound(webSocket, vlessResponseHeader, log) {
	let isVlessHeaderSent = false;
	const transformStream = new TransformStream({
		start(controller) {
		},
		transform(chunk, controller) {
			for (let index = 0; index < chunk.byteLength;) {
				const lengthBuffer = chunk.slice(index, index + 2);
				const udpPakcetLength = new DataView(lengthBuffer).getUint16(0);
				const udpData = new Uint8Array(
					chunk.slice(index + 2, index + 2 + udpPakcetLength)
				);
				index = index + 2 + udpPakcetLength;
				controller.enqueue(udpData);
			}
		},
		flush(controller) {
		}
	});
	transformStream.readable.pipeTo(new WritableStream({
		async write(chunk) {
			const resp = await fetch('https://1.1.1.1/dns-query',
				{
					method: 'POST',
					headers: {
						'content-type': 'application/dns-message',
					},
					body: chunk,
				})
			const dnsQueryResult = await resp.arrayBuffer();
			const udpSize = dnsQueryResult.byteLength;
			const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);
			if (webSocket.readyState === WS_READY_STATE_OPEN) {
				log(`doh success and dns message length is ${udpSize}`);
				if (isVlessHeaderSent) {
					webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
				} else {
					webSocket.send(await new Blob([vlessResponseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
					isVlessHeaderSent = true;
				}
			}
		}
	})).catch((error) => {
		log('dns udp has error' + error)
	});
	const writer = transformStream.writable.getWriter();
	return {
		write(chunk) {
			writer.write(chunk);
		}
	};
}
