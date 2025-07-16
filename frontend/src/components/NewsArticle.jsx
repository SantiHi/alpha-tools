const NewsArticle = ({ title, images, link, source }) => {
  return (
    <a href={link} target="_blank">
      <div className="border border-white h-130 w-110 rounded-md m-7 flex flex-col hover:scale-110 transition-transform duration-300 ease-in-out">
        <img src={images[0]} className="w-full h-[70%] rounded-md" />
        <h5 className="text-white text-xl text-center p-4 font-medium">
          {title}
        </h5>
        <p className="text-blue-300 text-center"> {source} </p>
      </div>
    </a>
  );
};

export default NewsArticle;
