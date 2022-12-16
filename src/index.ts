import md5 from 'md5';
import { v4 as v4uuid } from 'uuid';
import axios from 'axios';
import asyncRetry from 'async-retry';
import { base64 } from './base64';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

const signV1 = (obj: Record<string, unknown>) => {
    const str = JSON.stringify(obj);
    return md5(
        'https://h5.tu.qq.com' +
        (str.length + (encodeURIComponent(str).match(/%[89ABab]/g)?.length || 0)) +
        'HQ31X02e',
    );
};

type opts = {
    proxyType ? : string;
    proxyUrl ? : string;
  }

export const JadiAnime = async (img: string, opts?: opts) => {

    let httpsAgent: HttpsProxyAgent | SocksProxyAgent | undefined;

    if(opts?.proxyType?.toLowerCase() == "socks5"){
        httpsAgent = new SocksProxyAgent(opts?.proxyUrl ? opts.proxyUrl : "");
        httpsAgent.timeout = 30000;
    } else if(opts?.proxyType?.toLowerCase() == "https"){
        httpsAgent = new HttpsProxyAgent(opts?.proxyUrl ? opts.proxyUrl : "");
        httpsAgent.timeout = 30000;
    }

    const imgData = await base64(img)
    const obj = {
        busiId: 'different_dimension_me_img_entry',
        extra: JSON.stringify({
            face_rects: [],
            version: 2,
            platform: 'web',
            data_report: {
                parent_trace_id: v4uuid(),
                root_channel: '',
                level: 0,
            },
        }),
        images: [imgData],
    };
    const sign = signV1(obj);

    let extra;
    try {
        extra = await asyncRetry(
            async (bail) => {
                const response = await axios.request({
                    method: 'POST',
                    url: 'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
                    data: obj,
                    httpsAgent,
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': 'https://h5.tu.qq.com',
                        'Referer': 'https://h5.tu.qq.com/',
                        'User-Agent':
                            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                        'x-sign-value': sign,
                        'x-sign-version': 'v1',
                    },
                    timeout: 30000,
                });

                const data = response?.data as Record<string, unknown> | undefined;

                if (!data) {
                    throw new Error('No data');
                }

                if (data.msg === 'VOLUMN_LIMIT') {
                    throw new Error('Server Sedang Sibuk');
                }

                if (data.msg === 'IMG_ILLEGAL') {
                    bail(new Error('Gambar ini melanggar aturan!'));
                    return;
                }

                if (data.code === 1001) {
                    bail(new Error('Mukanya mana?'));
                    return;
                }

                if (data.code === -2100) { // request image is invalid
                    bail(new Error('Coba foto lain'));
                    return;
                }

                if (
                    data.code === 2119 || // user_ip_country
                    data.code === -2111 // AUTH_FAILED
                ) {
                    bail(new Error("Yaah fitur ini sedang tidak dapat digunakan"));
                    return;
                }

                if (!data.extra) {
                    throw new Error('Gagal mengkonversi ' + JSON.stringify(data));
                }

                return JSON.parse(data.extra as string);
            },
            {
                onRetry(e: { toString: () => any; }, attempt: any) {
                    console.error(`Upload Gagal (Percobaan ke #${attempt}): ${e.toString()}`);
                },
                retries: 100,
                factor: 1,
            },
        );
    } catch (e) {
        console.error(`Konversi gagal: ${(e as Error).toString()}`);
        throw new Error(`Konversi Gagal: ${(e as Error).toString()}`);
    }

    console.log(extra.img_urls[1] as string);
    return {
        img : extra.img_urls[1] as string
    }
};
