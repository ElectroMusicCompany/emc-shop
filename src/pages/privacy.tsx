import Layout from "@/components/Layout";
import NextHeadSeo from "next-head-seo";
import ReactMarkdown from "react-markdown";
import { GetStaticProps } from "next";
import { readFile } from "fs/promises";
import path from "path";

export default function privacy({ content }: { content: string }) {
  return (
    <Layout>
      <NextHeadSeo
        title="プライバシーポリシー - EMC Shop"
        description="プライバシーポリシー"
        canonical="https://shop.emcmusic.net/privacy"
        og={{
          title: "プライバシーポリシー - EMC Shop",
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
    path.resolve("src", "terms", `privacy.md`)
  );
  const content = fileContent.toString();
  return {
    props: {
      content,
    },
  };
};
