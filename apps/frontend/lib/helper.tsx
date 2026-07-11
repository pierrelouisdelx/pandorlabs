const helper = {
  openGraphData: {
    title: 'PandorLabs',
    description:
      'Enhance your service offerings and streamline processes with our intuitive AI SaaS template.',
    siteName: 'PandorLabs',
    type: 'website',
    images: [{ url: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg` }],
  },
  getOrganizationJsonString: () => {
    return `{
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "PandorLabs",
            "url": "${process.env.NEXT_PUBLIC_APP_URL}",
            "logo": "${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg"
            }`
  },
}
export default helper
