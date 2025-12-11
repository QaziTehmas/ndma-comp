export default function ListItems({ items }) {
  return (
    <ul className="slide-list">
      {items.map((item, idx) => (
        <li key={idx}>
          {typeof item === "string" ? (
            item
          ) : (
            <>
              <strong>{item.title}:</strong> {item.description}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
