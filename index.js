const config = require("./config.json");

let lastIp;

(async function check() {
    // Get IP
    await fetch(config.ipEndpoint).then(i => i.json()).then(async ipJson => {
        const ip = config.ipKey.split(".").reduce((acc, curr) => acc?.[curr], ipJson);
        if (!ip || lastIp === ip) return;
        
        console.log(timestamp(), `IP changed from '${lastIp || "nothing"}' to '${ip}'`);

        // Update IP if changed
        const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records/${config.dnsRecordId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.cloudflareApiKey}`
            },
            body: JSON.stringify({
                type: "A",
                content: ip
            })
        }).catch(err => console.log(timestamp(), "Failed to update DNS!"));

        if (cfRes.status !== 200) {
            // Failed to update IP
            return console.log(timestamp(), `Failed to update DNS! Status: ${res.status}`);
        }

        // Success
        lastIp = ip;
        return console.log(timestamp(), "Succesfully updated DNS!");
    }).catch(err => console.log(timestamp(), "Failed to get IP!"));

    setTimeout(() => check(), config.checkInterval); // Check IP loop
})();

function timestamp() {
    return `[${new Date().toLocaleString()}]`;
}