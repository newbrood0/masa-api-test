const http = require("http");

const PORT = process.env.PORT || 3000;
const KRA_API_KEY = process.env.KRA_API_KEY;

const KRA_API_URL =
    "https://apis.data.go.kr/B551015/API14_1/horseOwnerInfo_1";

const server = http.createServer(async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host}`
    );

    if (requestUrl.pathname === "/") {

        res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8"
        });

        res.end(JSON.stringify({
            success: true,
            message: "마사일호 API 테스트 서버가 정상적으로 실행되고 있습니다."
        }));

        return;
    }

    if (requestUrl.pathname === "/api/owner") {

        if (!KRA_API_KEY) {

            res.writeHead(500, {
                "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
                success: false,
                error: "KRA_API_KEY 환경변수가 설정되지 않았습니다."
            }));

            return;
        }

        const meet =
            requestUrl.searchParams.get("meet") || "1";

        const ownerName =
            requestUrl.searchParams.get("ow_name") || "";

        const pageNo =
            requestUrl.searchParams.get("pageNo") || "1";

        const numOfRows =
            requestUrl.searchParams.get("numOfRows") || "10";

        const params = new URLSearchParams();

        params.set("ServiceKey", KRA_API_KEY);
        params.set("pageNo", pageNo);
        params.set("numOfRows", numOfRows);
        params.set("meet", meet);

        if (ownerName) {
            params.set("ow_name", ownerName);
        }

        params.set("_type", "json");

        const apiUrl =
            KRA_API_URL +
            "?" +
            params.toString();

        try {

            const response =
                await fetch(apiUrl);

            const text =
                await response.text();

            res.writeHead(
                response.status,
                {
                    "Content-Type":
                        response.headers.get("content-type") ||
                        "application/json; charset=utf-8"
                }
            );

            res.end(text);

        } catch (error) {

            res.writeHead(502, {
                "Content-Type":
                    "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
                success: false,
                error: "한국마사회 API 호출에 실패했습니다.",
                detail: error.message
            }));

        }

        return;
    }

    res.writeHead(404, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify({
        success: false,
        error: "존재하지 않는 주소입니다."
    }));
});

server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});
