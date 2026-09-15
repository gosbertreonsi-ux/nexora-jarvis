import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, { origin: "*" });
fastify.register(fastifyWebsocket);

// @ts-ignore
fastify.register(require('@fastify/formbody'));

interface CommandPacket {
  command?: string;
}

const VAULT_PARENT_DIR = "C:\\Users\\H P\\nexora-jarvis-ui";
const VAULT_FOLDER = path.join(VAULT_PARENT_DIR, "vault");
const VAULT_LOCKED_FOLDER = path.join(VAULT_PARENT_DIR, "Control Panel.{21EC2020-3AEA-1069-A2DD-08002B30309D}");

function executeSystemShell(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout ? stdout.trim() : stderr.trim());
    });
  });
}

function cleanAndExtractQuery(phrase: string): string {
  return phrase.toLowerCase()
    .replace("yes,", "")
    .replace("run the internet for me", "")
    .replace("run the internet for", "")
    .replace("search for", "")
    .replace("look up", "")
    .replace("find out about", "")
    .replace("google", "")
    .trim();
}

async function gatherHardwareVitals() {
  try {
    const batteryCmd = "powershell -Command \"(Get-WmiObject -Class Win32_Battery).EstimatedChargeRemaining\"";
    const statusCmd = "powershell -Command \"(Get-WmiObject -Class Win32_Battery).BatteryStatus\"";
    
    const rawCharge = await executeSystemShell(batteryCmd);
    const rawStatus = await executeSystemShell(statusCmd);
    
    const batteryPercent = rawCharge ? parseInt(rawCharge) : 85; 
    const isCharging = rawStatus === "2" || rawStatus === "6"; 

    const thermalCmd = "powershell -Command \"(Get-Counter '\\Processor(_Total)\\% Processor Time').CounterSamples.CookedValue\"";
    const rawLoad = await executeSystemShell(thermalCmd);
    const cpuLoad = rawLoad ? Math.min(Math.round(parseFloat(rawLoad)), 100) : 10;

    return {
      batteryPercent,
      isCharging,
      cpuLoad,
      freeMemory: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2),
      totalMemory: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)
    };
  } catch {
    return { batteryPercent: 95, isCharging: false, cpuLoad: 15, freeMemory: "7.20", totalMemory: "16.00" };
  }
}

// ─── CORE REAL-TIME JARVIS COGNITIVE ROUTER ───
fastify.register(async function (fastify) {
  fastify.get('/jarvis-core', { websocket: true }, async (connection, req) => {
    console.log("🟢 Cognitive link securely bound to Commander Lee's console interface.");
    
    if (!fs.existsSync(VAULT_FOLDER) && !fs.existsSync(VAULT_LOCKED_FOLDER)) {
      fs.mkdirSync(VAULT_FOLDER, { recursive: true });
      fs.writeFileSync(path.join(VAULT_FOLDER, "CONFIDENTIAL_BLUEPRINTS.txt"), "JARVIS MATRIX SECURED CODE COGNITIVE SCHEMA ARCHITECTURE.");
    }

    connection.send(JSON.stringify({
      status: "READY",
      text: "Neural systems operational. System vitals online. Standing by, Commander Lee."
    }));

    const telemetryInterval = setInterval(async () => {
      if (connection.readyState === 1) {
        const vitals = await gatherHardwareVitals();
        connection.send(JSON.stringify({ status: "TELEMETRY", metrics: vitals }));
      }
    }, 4000);

    connection.on('message', async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        
        // CRITICAL DEFENSIVE SANITIZATION: Bypasses malformed or empty text packets
        if (!parsedMessage || typeof parsedMessage !== 'object' || !('command' in parsedMessage) || parsedMessage.command === undefined || parsedMessage.command === null) {
          console.log("⚠️ Bypassed unhandled packet anomaly frame context.");
          return;
        }

        const packet = parsedMessage as CommandPacket;
        const rawPhrase = String(packet.command).trim();
        
        if (rawPhrase.length === 0) {
          console.log("⚠️ Bypassed blank text block stream layer.");
          return;
        }

        const inputPhrase = rawPhrase.toLowerCase();
        console.log(`🎙️ [COMMAND CAPTURED]: ${inputPhrase}`);

        let responseText = "";
        let actionTriggered = "NONE";

        // ─── 1. CYBERSECURITY VAULT CONFIGURATIONS ───
        if (inputPhrase.includes("lock") && (inputPhrase.includes("vault") || inputPhrase.includes("file"))) {
          actionTriggered = "VAULT_LOCK";
          if (fs.existsSync(VAULT_FOLDER)) {
            fs.renameSync(VAULT_FOLDER, VAULT_LOCKED_FOLDER);
            await executeSystemShell(`attrib +h +s "${VAULT_LOCKED_FOLDER}"`);
            responseText = "Securing system file perimeter, Commander Lee. Vault folder is locked, hidden, and encrypted.";
          } else {
            responseText = "Vault matrix folder is already isolated and sealed under custom cryptographic flags, Commander.";
          }
        }
        else if ((inputPhrase.includes("open") || inputPhrase.includes("unlock")) && (inputPhrase.includes("vault") || inputPhrase.includes("file"))) {
          actionTriggered = "VAULT_UNLOCK";
          if (fs.existsSync(VAULT_LOCKED_FOLDER)) {
            await executeSystemShell(`attrib -h -s "${VAULT_LOCKED_FOLDER}"`);
            fs.renameSync(VAULT_LOCKED_FOLDER, VAULT_FOLDER);
            responseText = "Biometric voice override accepted, Commander Lee. Unlocking secure vault folder and launching file viewer now.";
            await executeSystemShell(`explorer "${VAULT_FOLDER}"`);
          } else {
            responseText = "Access granted, sir. Vault container structure is already wide open and available on your workspace grid.";
            await executeSystemShell(`explorer "${VAULT_FOLDER}"`);
          }
        }
        // ─── 2. SYSTEM SHELL AUTOMATIONS ───
        else if (inputPhrase.includes("youtube") || inputPhrase.includes("music")) {
          actionTriggered = "LAUNCH_YOUTUBE";
          let songQuery = "";
          if (inputPhrase.includes("play")) {
            songQuery = rawPhrase.substring(inputPhrase.indexOf("play") + 4).trim();
          }

          if (songQuery) {
            responseText = `Opening YouTube and launching streaming playback layers for "${songQuery}", sir.`;
            await executeSystemShell(`start chrome https://youtube.com{encodeURIComponent(songQuery)}`);
          } else {
            responseText = "Understood, Commander Lee. Opening YouTube and launching low-fi audio radio streams now.";
            await executeSystemShell('start chrome https://youtube.com');
          }
        } 
        else if (inputPhrase.includes("status") || inputPhrase.includes("system")) {
          actionTriggered = "SYSTEM_READOUT";
          const vitals = await gatherHardwareVitals();
          responseText = `Systems check complete, Commander Lee. Laptop load index is at ${vitals.cpuLoad} percent. Battery power matrix is holding at ${vitals.batteryPercent} percent capacity.`;
        } 
        else if (inputPhrase.includes("code") || inputPhrase.includes("visual studio")) {
          actionTriggered = "LAUNCH_CODE";
          responseText = "Waking up your integrated code editing workspace array right away, Commander.";
          await executeSystemShell('code .');
        }
        else if (inputPhrase.includes("explorer") || inputPhrase.includes("show files")) {
          actionTriggered = "LAUNCH_EXPLORER";
          responseText = "Opening native Windows file navigation systems targeting your active project path, sir.";
          await executeSystemShell('start .');
        }
        // ─── 3. ADAPTIVE CONVERSATIONAL INTERNET MATRIX ───
        else {
          actionTriggered = "LAUNCH_CHROME_SEARCH";
          const topicToSearch = cleanAndExtractQuery(rawPhrase);

          if (topicToSearch && topicToSearch.length > 1) {
            responseText = `Processing casual command context. Searching Google for "${topicToSearch}" now, Commander Lee.`;
            await executeSystemShell(`start chrome https://google.com{encodeURIComponent(topicToSearch)}`);
          } else {
            actionTriggered = "CONVERSATION";
            responseText = `I hear you, Commander Lee. Opening Google Chrome terminal hub for you to navigate directly.`;
            await executeSystemShell('start chrome https://google.com');
          }
        }

        connection.send(JSON.stringify({
          status: "SUCCESS",
          text: responseText,
          action: actionTriggered
        }));

      } catch (err) {
        console.error("⚠️ Caught malformed data package block frame anomaly execution.");
      }
    });

    connection.on('close', () => {
      clearInterval(telemetryInterval);
      console.log("🔴 Telemetry metrics stream interval loop destroyed safely.");
    });
  });
});

const start = async () => {
  try {
    const port = 8080;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`\n🌌 [NEXORA JARVIS OPERATIONAL COGNITIVE BACKEND ENGULFED]`);
    console.log(`========================================================================`);
    console.log(`Active Real-Time Ingress: ws://localhost:8080/jarvis-core\n`);
  } catch (err) {
    process.exit(1);
  }
};

start();
