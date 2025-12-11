export default function SlideHeader({ title, subtitle }) {
  return (
    <>
      {title && <h1 className="slide-title">{title}</h1>}
      {subtitle && <p className="slide-subtitle">{subtitle}</p>}
    </>
  );
}