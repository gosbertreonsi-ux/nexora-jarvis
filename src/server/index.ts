import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
import { exec } from 'child_process';
import os from 'os';

const fastify = Fastify({ logger: true });

// ENABLES CROSS-ORIGIN ACCESS CHANNELS FOR THE FRONTEND LOGIC LAYERS
fastify.register(fastifyCors, { origin: "*" });
fastify.register(fastifyWebsocket);

// @ts-ignore - Dynamically register form body parser modules for safety
fastify.register(require('@fastify/formbody'));

interface CommandPacket {
  command: string;
}

// UTILITY FUNCTION: Executes native Windows commands safely
function executeSystemShell(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout ? stdout : stderr);
    });
  });
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

        // ─── EXTRACTIVE SEARCH PARAMETER ENGINE LAYER ───
        if (inputPhrase.includes("search for") || inputPhrase.includes("tell me what to search")) {
          actionTriggered = "LAUNCH_CHROME_SEARCH";
          
          // Isolate and extract exactly what sits after the trigger phrases
          let searchKeyword = "";
          if (inputPhrase.includes("search for")) {
            searchKeyword = rawPhrase.substring(inputPhrase.indexOf("search for") + 10).trim();
          } else {
            searchKeyword = rawPhrase.substring(inputPhrase.indexOf("search") + 6).trim();
          }

          // If the user just said "open chrome and search", handle an empty fallback loop
          if (!searchKeyword) {
            responseText = "I have opened Google Chrome, Commander Lee. What specific topic shall I look up for you?";
            await executeSystemShell('start chrome https://google.com');
          } else {
            responseText = `Searching Google for "${searchKeyword}" right away, Commander Lee. Initializing web query modules.`;
            const encodedQuery = encodeURIComponent(searchKeyword);
            await executeSystemShell(`start chrome https://google.com/search?q=${encodedQuery}`);
          }
        } 
        else if (inputPhrase.includes("youtube") || inputPhrase.includes("music")) {
          actionTriggered = "LAUNCH_YOUTUBE";
          
          // Check if they want to play a specific band or song on YouTube
          let songQuery = "";
          if (inputPhrase.includes("play")) {
            songQuery = rawPhrase.substring(inputPhrase.indexOf("play") + 4).trim();
          }

          if (songQuery) {
            responseText = `Opening YouTube and launching streaming playback array layers for "${songQuery}", sir.`;
            const encodedSong = encodeURIComponent(songQuery);
            await executeSystemShell(`start chrome https://youtube.com{encodedSong}`);
          } else {
            responseText = "Understood, Commander Lee. Opening YouTube and launching low-fi audio radio streams now.";
            await executeSystemShell('start chrome https://youtube.com');
          }
        } 
        else if (inputPhrase.includes("chrome") || inputPhrase.includes("open google")) {
          actionTriggered = "LAUNCH_CHROME";
          responseText = "I have opened a clean Google Chrome browser session, Commander Lee. Standing by for instructions.";
          await executeSystemShell('start chrome https://google.com');
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
        else {
          actionTriggered = "CONVERSATION";
          responseText = `I have logged your voice command, Commander Lee, but it falls outside my native automation modules. You stated: "${rawPhrase}". Shall I run an internet query for this?`;
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
