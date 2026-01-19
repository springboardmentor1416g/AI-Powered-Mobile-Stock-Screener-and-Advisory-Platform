const NewsFeed = ({ news = [] }) => {
  if (!news.length) return <p>No recent news</p>;

  return (
    <section>
      <h3>Latest News</h3>
      {news.map((item, idx) => (
        <p key={idx}>{item.title}</p>
      ))}
    </section>
  );
};

export default NewsFeed;
