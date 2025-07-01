import NewsArticle from "./NewsArticle";

const NewsList = ({ newsData }) => {
  if (newsData == null || !Array.isArray(newsData)) {
    return null;
  }
  return (
    <div className="flex flex-row flex-wrap mx-30 mt-10 justify-center">
      {newsData.map((value) => {
        return (
          <NewsArticle
            title={value.title}
            images={value.images}
            key={value.id}
            link={value.link}
            source={value.source}
          />
        );
      })}
    </div>
  );
};

export default NewsList;
