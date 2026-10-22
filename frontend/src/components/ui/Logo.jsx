export default function Logo({ grande = false }) {
  return (
    <span className={`wordmark ${grande ? 'wordmark-large' : ''}`}>
      voluntare<span className="wordmark-dot">.</span>
    </span>
  );
}
