const http = require("http");
const { URL } = require("url");

const KRA_API_KEY = process.env.KRA_API_KEY;

const KRA_OWNER_API =
    "https://apis.data.go.kr/B551015/API14_1/horseOwnerInfo_1";

function sendJson(res, statusCode, data) {
    const body = JSON.stringify(data);

    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });

    res.end(body);
}

const server = http.createServer(async (req, res) => {

    /* =========================================================
       CORS OPTIONS
       ========================================================= */

    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });

        res.end();
        return;
    }

    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host}`
    );


    /* =========================================================
       서버 정상 작동 확인
       ========================================================= */

    if (requestUrl.pathname === "/") {

        sendJson(res, 200, {
            ok: true,
            message: "Masa API proxy server is running."
        });

        return;
    }


    /* =========================================================
       마주 API 프록시
       API14_1 / horseOwnerInfo_1
       ========================================================= */

    if (requestUrl.pathname === "/api/owner") {

        if (!KRA_API_KEY) {

            sendJson(res, 500, {
                error: "KRA_API_KEY environment variable is missing."
            });

            return;
        }


        const params = new URLSearchParams();


        /* 한국마사회 API 인증키 */
        params.set("serviceKey", KRA_API_KEY);


        /* 페이지 */
        params.set(
            "pageNo",
            requestUrl.searchParams.get("pageNo") || "1"
        );


        /* 출력 개수 */
        params.set(
            "numOfRows",
            requestUrl.searchParams.get("numOfRows") || "1000"
        );


        /* 개최지역 */
        params.set(
            "meet",
            requestUrl.searchParams.get("meet") || "1"
        );


        /* 마주명 */
        const ownerName =
            requestUrl.searchParams.get("ow_name");

        if (ownerName) {
            params.set("ow_name", ownerName);
        }


        /* 마주번호 */
        const ownerNo =
            requestUrl.searchParams.get("ow_no");

        if (ownerNo) {
            params.set("ow_no", ownerNo);
        }


        /* JSON 응답 */
        params.set("_type", "json");


        const kraUrl =
            KRA_OWNER_API +
            "?" +
            params.toString();


        try {

            const response = await fetch(kraUrl);

            const text = await response.text();


            res.writeHead(response.status, {

                "Content-Type":
                    response.headers.get("content-type") ||
                    "application/json; charset=utf-8",

                "Access-Control-Allow-Origin": "*",

                "Access-Control-Allow-Methods":
                    "GET, OPTIONS",

                "Access-Control-Allow-Headers":
                    "Content-Type"

            });


            res.end(text);

        } catch (error) {

            sendJson(res, 502, {

                error: "KRA API request failed.",

                message: error.message

            });

        }

        return;
    }


    /* =========================================================
       존재하지 않는 주소
       ========================================================= */

    sendJson(res, 404, {
        error: "Not Found"
    });

});


/* =========================================================
   서버 실행
   ========================================================= */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
