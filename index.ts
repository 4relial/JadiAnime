import md5 from 'md5';
import { v4 as v4uuid } from 'uuid';
import axios from 'axios';
import asyncRetry from 'async-retry';
import { base64 } from './base64';

const signV1 = (obj: Record<string, unknown>) => {
    const str = JSON.stringify(obj);
    return md5(
        'https://h5.tu.qq.com' +
        (str.length + (encodeURIComponent(str).match(/%[89ABab]/g)?.length || 0)) +
        'HQ31X02e',
    );
};

export const JadiAnime = async (img: string) => {
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
            async (bail: (arg0: Error) => void) => {
                const response = await axios.request({
                    method: 'POST',
                    url: 'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
                    data: obj,
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

                if (
                    data.code === 2119 || // user_ip_country
                    data.code === -2111 // AUTH_FAILED
                ) {
                    bail(new Error("Blocked"));
                    return;
                }

                if (!data.extra) {
                    throw new Error('Got no data from QQ: ' + JSON.stringify(data));
                }

                return JSON.parse(data.extra as string);
            },
            {
                onRetry(e: { toString: () => any; }, attempt: any) {
                    console.error(`QQ file upload error caught (attempt #${attempt}): ${e.toString()}`);
                },
                retries: 100,
                factor: 1,
            },
        );
    } catch (e) {
        console.error(`QQ file upload error caught: ${(e as Error).toString()}`);
        throw new Error(`Unable to upload the photo: ${(e as Error).toString()}`);
    }

    console.log(extra.img_urls[1] as string);
    return {
        img : extra.img_urls[1] as string
    }
};
