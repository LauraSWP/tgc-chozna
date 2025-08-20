export default function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>TCG Test Page</h1>
      <p>If you see this page, the Next.js routing is working correctly.</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
}
