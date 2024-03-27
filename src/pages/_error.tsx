import Layout from "@/components/Layout";
import { NextPage, NextPageContext } from "next";
import NextHeadSeo from "next-head-seo";

interface Props {
  statusCode: number;
}

const Error: NextPage<Props> = ({ statusCode }) => {
  if (statusCode === 404) {
    return (
      <Layout>
        <NextHeadSeo
          title="404 - EMC Shop"
          description="ページが見つかりません"
          robots="noindex, nofollow"
        />
        <div className="flex flex-col items-center justify-center gap-3">
          <h3 className="text-5xl font-bold">404</h3>
          <p className="text-2xl font-medium">ページが見つかりません</p>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <NextHeadSeo
        title={`${statusCode} - EMC Shop`}
        description="エラーが発生しました"
        robots="noindex, nofollow"
      />
      <div className="flex flex-col items-center justify-center gap-3">
        <h3 className="text-5xl font-bold">{statusCode}</h3>
        <p className="text-2xl font-medium">エラーが発生しました</p>
      </div>
    </Layout>
  );
};

Error.getInitialProps = async ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404;

  return { statusCode };
};

export default Error;
