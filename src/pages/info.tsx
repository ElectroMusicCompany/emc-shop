import Layout from "@/components/Layout";
import NextHeadSeo from "next-head-seo";
import getConfig from "next/config";

export default function info({ content }: { content: string }) {
  const { publicRuntimeConfig } = getConfig();
  const version = publicRuntimeConfig?.version;
  return (
    <Layout>
      <NextHeadSeo
        title="このソフトウェアについて - EMC Shop"
        description="このソフトウェアについて"
        canonical="https://shop.emcmusic.net/info"
        og={{
          title: "このソフトウェアについて - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="">
        <h2 className="text-2xl font-bold my-4">ソフトウェア情報</h2>
        <p>
          リポジトリ：
          <a
            href="https://github.com/ElectroMusicCompany/emc-shop"
            rel="noopener noreferrer"
            target="_blank"
            className="font-mono"
          >
            ElectroMusicCompany/emc-shop
          </a>
        </p>
        <p>
          バージョン：<span className="font-mono">{version}</span>
        </p>
      </div>
    </Layout>
  );
}
