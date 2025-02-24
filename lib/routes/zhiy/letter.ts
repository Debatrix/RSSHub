import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, fetchUserDate } from './utils';

export const route: Route = {
    path: '/letters/:author',
    categories: ['new-media'],
    example: '/zhiy/letters/messy',
    parameters: { author: '作者 ID，可在URL中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['zhiy.cc/:author'],
        },
    ],
    name: 'Newsletter',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const author = ctx.req.param('author');

    const userData = await fetchUserDate(author);
    const { author_id: authorId, author_name: authorName, author_signature: authorSignature, author_avatar_url: authorAvatarUrl } = userData;

    const {
        data: { result: letters },
    } = await got(`${baseUrl}/api/app/users/${authorId}/letters`, {
        searchParams: {
            page: 1,
            limit: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100,
        },
    });

    const items = letters.map((item) => ({
        title: item.title,
        description: item.shortcut,
        pubDate: parseDate(item.send_time, 'X'),
        link: `${baseUrl}/letter/${item.id}`,
    }));

    return {
        title: authorName,
        link: `${baseUrl}/${author}`,
        description: authorSignature,
        image: authorAvatarUrl,
        item: items,
    };
}
