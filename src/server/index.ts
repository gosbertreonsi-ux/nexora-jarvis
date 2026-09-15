import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
import { exec } from 'child_process';
import os from 'os';

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, { origin: "*" });
fastify.register(fastifyWebsocket);

// @ts-ignore
fastify.register(require('@fastify/formbody'));

interface CommandPacket {
  command: string;
}

function executeSystemShell(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout ? stdout : stderr);
    });
  });
}

// HELPER FUNCTION: Smart heuristic parser to extract search queries from casual speech
function cleanAndExtractQuery(phrase: string): string {
  let cleaned = phrase.toLowerCase()
    .replace("yes,", "")
    .replace("run the internet for me", "")
    .replace("run the internet for", "")
    .replace("search for", "")
    .replace("look up", "")
    .replace("find out about", "")
    .replace("google", "")
    .trim();
  
  return cleaned;
}

// ─── CORE REAL-TIME JARVIS COGNITIVE ROUTER ───
fastify.register(async function (fastify) {
  fastify.get('/jarvis-core', { websocket: true }, (connection, req) => {
    console.log("🟢 Cognitive link securely bound to Commander Lee's console interface.");
    
    connection.send(JSON.stringify({
      status: "READY",
      text: "Neural systems operational. Standing by for your instructions, Commander Lee."
    }));

    connection.on('message', async (message) => {
      try {
        const packet: CommandPacket = JSON.parse(message.toString());
        const rawPhrase = packet.command.trim();
        const inputPhrase = rawPhrase.toLowerCase();
        console.log(`🎙️ [COMMAND CAPTURED]: ${inputPhrase}`);

        let responseText = "";
        let actionTriggered = "NONE";

        // 1. DYNAMIC SYSTEM AUTOMATION TRIGGERS
        if (inputPhrase.includes("youtube") || inputPhrase.includes("music")) {
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
          const freeMemoryGB = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
          const totalMemoryGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
          responseText = `Monitoring laptop clusters, Commander Lee. Available systemic workspace memory is currently ${freeMemoryGB} Gigabytes out of a total ${totalMemoryGB} Gigabytes.`;
        } 
        else if (inputPhrase.includes("ping") || inputPhrase.includes("network")) {
          actionTriggered = "NETWORK_PING";
          responseText = "Measuring transmission latency variables now, Commander Lee.";
          connection.send(JSON.stringify({ status: "PROCESSING", text: responseText, action: actionTriggered }));
          try {
            await executeSystemShell('ping -n 3 8.8.8.8');
            responseText = "Network transit diagnostics complete. Sockets are functioning perfectly, sir.";
          } catch {
            responseText = "Warning, Commander Lee: Network routing endpoints returned an unhandled gateway latency timeout.";
          }
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
        // 2. FALLBACK ADAPTIVE COGNITIVE SEARCH (Catches phrases like "Yes, run the internet")
        else {
          actionTriggered = "LAUNCH_CHROME_SEARCH";
          const topicToSearch = cleanAndExtractQuery(rawPhrase);

          if (topicToSearch && topicToSearch.length > 1) {
            responseText = `Processing casual command context. Searching Google for "${topicToSearch}" now, Commander Lee.`;
            await executeSystemShell(`start chrome https://google.com{encodeURIComponent(topicToSearch)}`);
          } else {
            // If they just said generic words with no hidden query data
            actionTriggered = "CONVERSATION";
            responseText = `I hear you, Commander Lee. Opening Google Chrome terminal hub for you to navigate directly.`;
            await executeSystemShell('start chrome https://google.com');
          }
        }

        // Return processed execution tokens back to the Next.js frontend panel layout
        connection.send(JSON.stringify({
          status: "SUCCESS",
          text: responseText,
          action: actionTriggered
        }));

      } catch (err) {
        console.error("Cognitive loop breakdown: ", err);
        connection.send(JSON.stringify({ status: "ERROR", text: "Internal processing crash caught inside JARVIS core layer scripts." }));
      }
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
