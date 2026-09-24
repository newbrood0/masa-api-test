const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
    });

    res.end(JSON.stringify({
        success: true,
        message: "마사일호 API 테스트 서버가 정상적으로 실행되고 있습니다."
    }));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
