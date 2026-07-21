/**
 * Per-platform content for the `/products/social-media/[platform]` pages.
 *
 * Structurally the same idea as `lib/brands.ts`: one entry per source, prose
 * specific enough that the page earns its own ranking rather than reading as a
 * template fill. New platforms are added here, not by copying a page.
 */

export interface SocialSourceFaq {
  question: string
  answer: string
}

export interface SocialSource {
  /** URL segment: /products/social-media/<slug> */
  slug: string
  /** The platform's official brand colour. Run through `accentTokens()`. */
  accent: string
  name: string
  siteUrl: string
  domain: string
  /** Short positioning line — what the platform is, in five words. */
  tagline: string
  /** Object types the feed returns. */
  objectTypes: string[]
  /** 3–4 sentences on the platform itself. */
  intro: string
  /** 2–3 sentences on who buys this feed and why. */
  whyItMatters: string
  /** Fields that are distinctive to this platform. */
  notableFields: string[]
  /** Concrete things customers do with it. */
  useCases: Array<{ title: string; description: string }>
  faqs: SocialSourceFaq[]
}

export const SOCIAL_SOURCES: SocialSource[] = [
  {
    slug: 'linkedin',
    // LinkedIn corporate blue. Too dark for text on our canvas, so
    // `accentTokens()` lifts it for type and icons and keeps it for fills.
    accent: '#0A66C2',
    name: 'LinkedIn',
    siteUrl: 'https://www.linkedin.com',
    domain: 'linkedin.com',
    tagline: 'The professional graph',
    objectTypes: [
      'Company pages',
      'Public posts',
      'Job postings',
      'Public profiles',
      'Engagement metrics',
    ],
    intro:
      'LinkedIn is the only social network where the graph is professional rather than personal, which makes its public surface structurally different from every other platform. Company pages, job postings, and public posts describe organisations rather than individuals — headcount direction, which functions a company is investing in, which markets it is opening, and how its executives are positioning it publicly. That is business intelligence that happens to be published as social content.',
    whyItMatters:
      'For B2B teams, LinkedIn is the highest-signal public data source that exists: hiring patterns lead revenue, executive posts lead announcements, and company page changes lead strategy shifts. Sales teams use it for account-level trigger events, competitive intelligence teams use job postings as a leading indicator of product direction, and recruiters use it to map talent markets that no other source describes.',
    notableFields: [
      'Company page attributes — industry, size band, headquarters, specialties',
      'Job postings with title, function, seniority, and location',
      'Public post content with author, timestamp, and engagement envelope',
      'Reaction, comment, and repost counts per post',
      'Public profile fields where the member has made them visible',
    ],
    useCases: [
      {
        title: 'Hiring signals as a growth indicator',
        description:
          'Job posting volume by function is one of the earliest public signals a company gives about where it is investing. A sudden run of enterprise sales roles reads differently from a run of research roles, and both precede any announcement.',
      },
      {
        title: 'Account-level trigger events',
        description:
          'New leadership, a new office, a funding announcement, or a hiring surge each mark an account as newly in-market. Feeding those triggers into your CRM is the difference between outbound that lands and outbound that annoys.',
      },
      {
        title: 'Competitive product direction',
        description:
          'What a competitor hires for describes what it is building, months before anything ships. Engineering role titles and required skills are a surprisingly literal roadmap.',
      },
      {
        title: 'Talent market mapping',
        description:
          'Aggregate public profile and posting data describes where a skill set is concentrated, what it is being paid, and which companies are gaining or losing people in it.',
      },
      {
        title: 'Executive share-of-voice',
        description:
          'Track how often your leadership and your competitors post, on which themes, and how much engagement each generates — the B2B equivalent of brand share-of-voice tracking.',
      },
      {
        title: 'ICP and firmographic enrichment',
        description:
          'Company page attributes enrich an account list with industry, size, and geography, so segmentation runs on current data rather than whatever was true when the list was bought.',
      },
    ],
    faqs: [
      {
        question: 'What LinkedIn data do you collect, exactly?',
        answer:
          'Public surfaces only: company pages, public job postings, public posts and their engagement counts, and profile fields a member has chosen to make publicly visible. We do not access content behind a login, we do not touch private profiles, connections, or messages, and we do not attempt to infer anything a member has not published. During scoping we confirm in writing exactly which fields you can rely on, because the public surface is narrower than most people assume.',
      },
      {
        question: 'Is collecting LinkedIn data legal?',
        answer:
          'We collect only publicly available pages — the surface a logged-out visitor can see — and we do not circumvent authentication or access controls. Because professional data can constitute personal data under GDPR, we treat it as such: data is stored in your chosen region, retention windows are configurable, deletion propagates through the pipeline when content is removed at source, and our DPA is available before you sign. We will not build a use case that depends on deanonymising individuals.',
      },
      {
        question: 'Can you track a specific list of companies?',
        answer:
          'Yes, and this is the most common configuration. You supply an account list — by company page, domain, or name — and we monitor those organisations continuously, pushing job postings, page changes, and public posts as they appear. Most customers wire this straight into their CRM as trigger events rather than consuming it as a dataset.',
      },
      {
        question: 'How fresh is the LinkedIn data?',
        answer:
          'Cadence is yours to set. Account monitoring for trigger events typically runs daily, which is fast enough that a job posting reaches your CRM within a day of going live. Broader market mapping usually runs weekly, since the aggregate picture does not move fast enough to justify more.',
      },
    ],
  },
  {
    slug: 'reddit',
    // Reddit OrangeRed, the platform's primary brand colour.
    accent: '#FF4500',
    name: 'Reddit',
    siteUrl: 'https://www.reddit.com',
    domain: 'reddit.com',
    tagline: 'Unfiltered community discussion',
    objectTypes: [
      'Posts',
      'Comment threads',
      'Subreddit metadata',
      'Vote scores',
      'Author handles',
    ],
    intro:
      'Reddit is the largest archive of unprompted public opinion on the internet, organised into tens of thousands of topic communities with their own norms and vocabularies. Unlike the engagement-optimised feeds elsewhere, Reddit content is threaded, voted, and largely written by people who are not performing for an audience — which is precisely what makes it useful. When someone explains why they returned a product or switched vendors, they usually do it here.',
    whyItMatters:
      'Reddit is where product problems surface before they reach support queues and where purchase decisions get argued out in public. Product teams use it for unfiltered feedback that survey instruments never capture, brand teams use it as an early-warning system, and AI teams use it as one of the richest sources of natural conversational language available for training and evaluation.',
    notableFields: [
      'Post title, body, subreddit, and permalink',
      'Full comment trees with parent-child threading preserved',
      'Vote score and comment count per post',
      'Subreddit metadata including subscriber count and topic',
      'Author handle and post timestamps',
      'Flair and tag taxonomy as each community defines it',
    ],
    useCases: [
      {
        title: 'Early-warning brand monitoring',
        description:
          'Product problems appear on Reddit before they reach your support queue, and often before they reach anywhere else. A rising thread in the right subreddit is the earliest warning you will get.',
      },
      {
        title: 'Unfiltered product feedback',
        description:
          'People explain why they switched, returned, or stayed in far more detail than any survey elicits — including the reasons they would never write on a feedback form.',
      },
      {
        title: 'Competitive comparison mining',
        description:
          '"X vs Y" threads are among the most honest competitive research available, and they surface the specific objections your sales team keeps running into.',
      },
      {
        title: 'AI training and evaluation corpora',
        description:
          'Threaded conversational data with clear parent-child structure and a community quality signal in the vote score. One of the most useful natural-language sources for dialogue work.',
      },
      {
        title: 'Community and trend detection',
        description:
          'Subreddit growth and posting velocity identify emerging interests while they are still niche, months ahead of mainstream coverage.',
      },
      {
        title: 'Sentiment with actual context',
        description:
          'Because comments are threaded, sentiment can be read against what it is replying to — which is the difference between a usable signal and a polarity score that means nothing.',
      },
    ],
    faqs: [
      {
        question: 'Do you preserve Reddit comment threading?',
        answer:
          'Yes, and it is the field that matters most in this source. Parent-child relationships are preserved in full rather than flattened into a list of comments, because a reply read without its parent is frequently meaningless — sarcasm, corrections, and disagreement all depend on what came before. Flattened Reddit data is much less useful than it looks.',
      },
      {
        question: 'Can you monitor specific subreddits or keywords?',
        answer:
          'Both. You can scope collection to a set of communities, to keyword and brand-term matches across the platform, or to a combination — brand mentions everywhere plus deep coverage of the handful of subreddits where your category actually gets discussed. That combination is the usual configuration.',
      },
      {
        question: 'Is Reddit data suitable for AI training?',
        answer:
          'It is one of the better public sources for conversational and dialogue work: naturally threaded, topically organised, and carrying a built-in community quality signal in the vote score. We deliver it with threading and metadata intact so you can filter on those signals rather than ingesting the whole firehose. Licensing and permitted use are scoped explicitly in the engagement.',
      },
      {
        question: 'How do you handle deleted posts and comments?',
        answer:
          'Deletion at source propagates through the pipeline, so removed content drops out of subsequent deliveries. Retention windows on data already delivered are configurable and set during onboarding, and our DPA covers the processor relationship. We treat user-generated content as containing personal data by default rather than assuming otherwise.',
      },
    ],
  },
]

export const SOCIAL_SOURCES_BY_SLUG: Record<string, SocialSource> =
  Object.fromEntries(SOCIAL_SOURCES.map((s) => [s.slug, s]))

export function relatedSocialSources(source: SocialSource): SocialSource[] {
  return SOCIAL_SOURCES.filter((s) => s.slug !== source.slug)
}
