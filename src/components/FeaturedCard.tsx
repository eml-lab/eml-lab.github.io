interface Props {
  category: string;
  title: string;
  description: string;
  image: string;
  primaryText: string;
  primaryLink: string;
  secondaryText?: string;
  secondaryLink?: string;
}

export default function FeaturedCard({
  category,
  title,
  description,
  image,
  primaryText,
  primaryLink,
  secondaryText,
  secondaryLink,
}: Props) {
  return (
    <article
      className="featured-card"
      draggable={false}
      style={{
        backgroundImage: `linear-gradient(rgba(20,35,50,.72), rgba(20,35,50,.72)), url(${image})`,
      }}
    >
      <div className="featured-card-content">
        <p className="featured-card-category">{category}</p>

        <h2 className="featured-card-title">
          {title}
        </h2>

        <p className="featured-card-description">
          {description}
        </p>

        <div className="featured-card-buttons">
          <a href={primaryLink} className="featured-button primary">
            {primaryText}
          </a>

          {secondaryText && secondaryLink && (
            <a href={secondaryLink} className="featured-button secondary">
              {secondaryText}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}