import Layout from "@/components/Layout";
import NextHeadSeo from "next-head-seo";
import { GetStaticProps } from "next";
import { readFile } from "fs/promises";
import path from "path";
import ReactMarkdown from "react-markdown";

export default function disclosure({ content }: { content: string }) {
  return (
    <Layout>
      <NextHeadSeo
        title="特定商取引法に基づく表記 - EMC Shop"
        description="特定商取引法に基づく表記"
        canonical="https://shop.emcmusic.net/disclosure"
        og={{
          title: "特定商取引法に基づく表記 - EMC Shop",
          image: "https://shop.emcmusic.net/ogp.png",
        }}
        twitter={{
          card: "summary",
        }}
      />
      <div className="prose prose-sm max-w-none text-left">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const fileContent = await readFile(
    path.resolve("src", "terms", `disclosure.md`)
  );
  const content = fileContent.toString();
  return {
    props: {
      content,
    },
  };
};
