const http = require("http");
const { handleCommand } = require("./src/gameEngine");

const PORT = Number(process.env.PORT || 3000);

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function kakaoResponse(text) {
  return {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text
          }
        }
      ]
    }
  };
}

function getKakaoUserId(payload) {
  return (
    payload?.userRequest?.user?.id ||
    payload?.userRequest?.user?.properties?.plusfriendUserKey ||
    payload?.userRequest?.user?.properties?.appUserId ||
    payload?.userId ||
    "local-user"
  );
}

function getKakaoText(payload) {
  return payload?.userRequest?.utterance || payload?.utterance || payload?.text || "";
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/") {
      sendJson(res, 200, {
        ok: true,
        service: "gametalk",
        endpoints: ["POST /kakao/skill", "POST /test"]
      });
      return;
    }

    if (req.method === "POST" && req.url === "/kakao/skill") {
      const payload = await readBody(req);
      const text = handleCommand(getKakaoUserId(payload), getKakaoText(payload));
      sendJson(res, 200, kakaoResponse(text));
      return;
    }

    if (req.method === "POST" && req.url === "/test") {
      const payload = await readBody(req);
      const text = handleCommand(payload.userId || "local-user", payload.text || "");
      sendJson(res, 200, { text });
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`gametalk server listening on http://localhost:${PORT}`);
});
