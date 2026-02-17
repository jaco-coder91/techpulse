import Parser from 'rss-parser';

export type Headline = {
  title: string;
  link: string;
  source: string;
  published: string;
};

const parser = new Parser();

const SOURCES: { name: string; url: string }[] = [
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index/' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'Hacker News (Front Page)', url: 'https://hnrss.org/frontpage' },
];

function parseDate(date?: string | number | Date) {
  const ts = date ? new Date(date) : new Date(0);
  return isNaN(ts.getTime()) ? new Date(0) : ts;
}

export async function fetchHeadlines(limitPerSource = 6): Promise<Headline[]> {
  const items: Headline[] = [];

  for (const source of SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      const slice = (feed.items || []).slice(0, limitPerSource);
      slice.forEach((item) => {
        if (!item.link || !item.title) return;
        items.push({
          title: item.title,
          link: item.link,
          source: source.name,
          published: parseDate(item.isoDate || item.pubDate).toISOString(),
        });
      });
    } catch (err) {
      console.error(`Failed to load ${source.name} feed`, err);
    }
  }

  return items
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    .slice(0, 40);
}

export const feedSources = SOURCES;
