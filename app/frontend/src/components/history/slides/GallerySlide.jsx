import { GALLERY_IMAGES } from "../../../data/slidesData";

export default function GallerySlide() {
  return (
    <div className="gallery-grid">
      {GALLERY_IMAGES.map((img, idx) => (
        <div key={idx} className="img-card">
          <img src={img.src} alt={img.caption} />
          <p className="img-caption">{img.caption}</p>
        </div>
      ))}
    </div>
  );
}
