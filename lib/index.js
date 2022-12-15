"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JadiAnime = void 0;
const md5_1 = __importDefault(require("md5"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const async_retry_1 = __importDefault(require("async-retry"));
const base64_1 = require("./base64");
const signV1 = (obj) => {
    const str = JSON.stringify(obj);
    return (0, md5_1.default)('https://h5.tu.qq.com' +
        (str.length + (encodeURIComponent(str).match(/%[89ABab]/g)?.length || 0)) +
        'HQ31X02e');
};
const JadiAnime = async (img) => {
    const imgData = await (0, base64_1.base64)(img);
    const obj = {
        busiId: 'different_dimension_me_img_entry',
        extra: JSON.stringify({
            face_rects: [],
            version: 2,
            platform: 'web',
            data_report: {
                parent_trace_id: (0, uuid_1.v4)(),
                root_channel: '',
                level: 0,
            },
        }),
        images: [imgData],
    };
    const sign = signV1(obj);
    let extra;
    try {
        extra = await (0, async_retry_1.default)(async (bail) => {
            const response = await axios_1.default.request({
                method: 'POST',
                url: 'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
                data: obj,
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://h5.tu.qq.com',
                    'Referer': 'https://h5.tu.qq.com/',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                    'x-sign-value': sign,
                    'x-sign-version': 'v1',
                },
                timeout: 30000,
            });
            const data = response?.data;
            if (!data) {
                throw new Error('No data');
            }
            if (data.msg === 'VOLUMN_LIMIT') {
                throw new Error('QQ rate limit caught');
            }
            if (data.msg === 'IMG_ILLEGAL') {
                bail(new Error('Couldn\'t pass the censorship. Try another photo.'));
                return;
            }
            if (data.code === 1001) {
                bail(new Error('Face not found. Try another photo.'));
                return;
            }
            if (data.code === -2100) { // request image is invalid
                bail(new Error('Try another photo.'));
                return;
            }
            if (data.code === 2119 || // user_ip_country
                data.code === -2111 // AUTH_FAILED
            ) {
                bail(new Error("Blocked"));
                return;
            }
            if (!data.extra) {
                throw new Error('Got no data from QQ: ' + JSON.stringify(data));
            }
            return JSON.parse(data.extra);
        }, {
            onRetry(e, attempt) {
                console.error(`QQ file upload error caught (attempt #${attempt}): ${e.toString()}`);
            },
            retries: 100,
            factor: 1,
        });
    }
    catch (e) {
        console.error(`QQ file upload error caught: ${e.toString()}`);
        throw new Error(`Unable to upload the photo: ${e.toString()}`);
    }
    console.log(extra.img_urls[1]);
    return {
        img: extra.img_urls[1]
    };
};
exports.JadiAnime = JadiAnime;
