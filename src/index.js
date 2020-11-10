const cheerio = require("cheerio");
const Axios = require("axios").default;

const config = require("./config");
const secrets = require("./secrets.json");

class PokemonAPI {
    constructor(coordinates) {
        this.cookies = [];
        this.headers = {};
        this.version = undefined;

        this.cookies["ingress.intelmap.lat"] = coordinates.latitude;
        this.cookies["ingress.intelmap.lng"] = coordinates.longitude;

        this.cookies["sessionid"] = secrets.sessionid;
        this.cookies["csrftoken"] = secrets.csrftoken;

        this.headers["accept-encoding"] = "gzip, deflate";
        this.headers["content-type"] = "application/json; charset=UTF-8";
        this.headers["origin"] = config.domain;
        this.headers["referer"] = `${config.domain}/intel`;
        this.headers["user-agent"] = "Mozilla/2.0 (compatible; MSIE 3.0; Windows 3.1)";
        this.headers["x-csrftoken"] = secrets.csrftoken;
        
        this.processedCookies = "";

        for(const cookie in this.cookies) {
            this.processedCookies += `${cookie}=${this.cookies[cookie]}; `;
        }

        this.headers["cookie"] = this.processedCookies;

        this.run();
    }

    async run() {
        this.version = await this.getVersion();
    }

    async getVersion() {
        let version;

        const res = await Axios.get(`${config.domain}/intel`, {
            headers: this.headers
        });

        const $ = cheerio.load(res.data);

        const scripts = $("script").get();

        scripts.forEach(script => {
            const src = script.attribs["src"];

            if(src && src.includes("gen_dashboard")) {
                version = src.replace("/jsc/gen_dashboard_", "").replace(".js", "");
            }
        });

        return version;
    }
}

new PokemonAPI(config.coordinates);