const config = require("./config.json");

let lastIp;

(async function check() {
    await fetch(config.ipEndpoint).then(i => i.json()).then(async ipJson => {
        const ip = config.ipKey.split(".").reduce((curr, prev) => curr[prev], ipJson);
        if (!ip || lastIp === ip) return;
        
        console.log(timestamp(), `IP changed from '${lastIp || "nothing"}' to '${ip || "nothing"}'`);

        await fetch(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records/${config.dnsRecordId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.cloudflareApiKey}`
            },
            body: JSON.stringify({
                type: "A",
                content: ip
            })
        }).then(async res => {
            if (res.status === 200) {
                lastIp = ip;
                return console.log(timestamp(), "Succesfully updated DNS!");
            }

            const json = await res.json().catch(err => { });
            return console.log(timestamp(), `Failed to update DNS! Status: ${res.status}, JSON:`, json);
        }).catch(err => console.log(timestamp(), "Failed to update DNS! Error:", err));
    }).catch(err => console.log(timestamp(), "Failed to get IP! Error:", err));

    setTimeout(() => check(), config.checkInterval);
})();

function timestamp() {
    return `[${new Date().toLocaleString()}]`;
}