/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/frontpage',
          permanent: true,
        },
      ];
    },
  };
  
  export default nextConfig;
  